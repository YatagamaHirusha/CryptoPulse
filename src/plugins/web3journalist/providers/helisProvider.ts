import type { IAgentRuntime, Memory, Provider, ProviderResult, State } from "@elizaos/core";

const HELIUS_ENHANCED_BASE = "https://api.helius.xyz/v0";

/** Wrapped SOL mint — high activity; used as a proxy for network-wide SOL-adjacent flows (Helius enhanced by address). */
const WSOL_MINT = "So11111111111111111111111111111111111111112";

const MIN_WHALE_USD = 50_000;
const MIN_SWAP_USD = 25_000;

let solPriceUsdCache: { price: number; at: number } | null = null;
const SOL_PRICE_TTL_MS = 5 * 60 * 1000;

async function getSolPriceUsd(runtime: IAgentRuntime): Promise<number> {
  const now = Date.now();
  if (solPriceUsdCache && now - solPriceUsdCache.at < SOL_PRICE_TTL_MS) {
    return solPriceUsdCache.price;
  }
  const fromSetting = runtime.getSetting("SOL_PRICE_USD");
  if (typeof fromSetting === "number" && fromSetting > 0) {
    solPriceUsdCache = { price: fromSetting, at: now };
    return fromSetting;
  }
  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { headers: { Accept: "application/json" } }
    );
    if (r.ok) {
      const j = (await r.json()) as { solana?: { usd?: number } };
      const p = j.solana?.usd;
      if (typeof p === "number" && p > 0) {
        solPriceUsdCache = { price: p, at: now };
        return p;
      }
    }
  } catch {
    /* fall through */
  }
  return 150;
}

function getHeliusApiKey(runtime: IAgentRuntime): string | null {
  const fromRuntime = runtime.getSetting("HELIUS_API_KEY");
  if (typeof fromRuntime === "string" && fromRuntime.length > 0) return fromRuntime;
  const env = process.env.HELIUS_API_KEY;
  if (env && env.length > 0) return env;
  return null;
}

export interface OnChainBrief {
  type: "onchain";
  eventType: "whale_transfer" | "dex_volume_spike" | "protocol_surge" | "large_swap";
  description: string;
  amount: number;
  amountUSD: number;
  fromAddress: string;
  toAddress: string;
  txSignature: string;
  protocol?: string;
  timestamp: string;
}

/** Known program / vault addresses → human-readable protocol (expand as needed). */
const KNOWN_PROTOCOLS: Record<string, string> = {
  JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4: "Jupiter",
  "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin": "Serum",
  whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc: "Orca",
  MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD: "Marinade",
};

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

interface HeliusNativeTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  amount: number;
}

interface HeliusTokenTransfer {
  fromUserAccount: string;
  toUserAccount: string;
  mint: string;
  /** UI or raw depending on Helius response — use `decimals` when present. */
  tokenAmount: number | string;
  decimals?: number;
}

interface HeliusEnhancedTx {
  signature: string;
  timestamp?: number;
  type?: string;
  source?: string;
  description?: string;
  feePayer?: string;
  nativeTransfers?: HeliusNativeTransfer[];
  tokenTransfers?: HeliusTokenTransfer[];
}

function protocolFromAddresses(from: string, to: string): string | undefined {
  return KNOWN_PROTOCOLS[from] ?? KNOWN_PROTOCOLS[to];
}

/** USDC notional in USD from Helius token transfer (UI or base units). */
function usdcTransferUsd(tt: HeliusTokenTransfer): number {
  if (tt.mint !== USDC_MINT) return 0;
  const raw = typeof tt.tokenAmount === "string" ? parseFloat(tt.tokenAmount) : tt.tokenAmount;
  if (!Number.isFinite(raw)) return 0;
  const decimals = tt.decimals ?? 6;
  if (raw >= 1_000_000) return raw / 10 ** decimals;
  return raw;
}

/**
 * Fetches enhanced transactions via Helius (same REST family as their docs:
 * GET /v0/addresses/{address}/transactions).
 */
async function fetchHeliusAddressTransactions(
  apiKey: string,
  address: string,
  typeFilter: string | undefined,
  limit: number
): Promise<HeliusEnhancedTx[]> {
  const params = new URLSearchParams({
    "api-key": apiKey,
    limit: String(Math.min(100, Math.max(1, limit))),
  });
  if (typeFilter) params.set("type", typeFilter);

  const url = `${HELIUS_ENHANCED_BASE}/addresses/${address}/transactions?${params.toString()}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Helius API error: ${response.status} ${await response.text()}`);
  }
  const txns = (await response.json()) as HeliusEnhancedTx[];
  return Array.isArray(txns) ? txns : [];
}

export async function fetchOnChainBriefs(
  runtime: IAgentRuntime,
  apiKey: string
): Promise<OnChainBrief[]> {
  const briefs: OnChainBrief[] = [];
  const solUsd = await getSolPriceUsd(runtime);
  const seenSig = new Set<string>();

  try {
    const transferTxs = await fetchHeliusAddressTransactions(apiKey, WSOL_MINT, "TRANSFER", 40);

    for (const tx of transferTxs) {
      if (seenSig.has(tx.signature)) continue;

      const nativeTransfers = tx.nativeTransfers || [];
      let best: { transfer: HeliusNativeTransfer; amountSOL: number; amountUSD: number } | null = null;

      for (const transfer of nativeTransfers) {
        const amountSOL = transfer.amount / 1e9;
        const amountUSD = amountSOL * solUsd;
        if (amountUSD < MIN_WHALE_USD) continue;
        if (!best || amountUSD > best.amountUSD) {
          best = { transfer, amountSOL, amountUSD };
        }
      }

      if (!best) continue;
      seenSig.add(tx.signature);

      const knownProtocol = protocolFromAddresses(
        best.transfer.fromUserAccount,
        best.transfer.toUserAccount
      );

      briefs.push({
        type: "onchain",
        eventType: "whale_transfer",
        description: `Large SOL transfer: ${best.amountSOL.toFixed(0)} SOL (~$${(best.amountUSD / 1000).toFixed(0)}k) moved${knownProtocol ? ` involving ${knownProtocol}` : ""}`,
        amount: best.amountSOL,
        amountUSD: best.amountUSD,
        fromAddress: best.transfer.fromUserAccount,
        toAddress: best.transfer.toUserAccount,
        txSignature: tx.signature,
        protocol: knownProtocol,
        timestamp: new Date((tx.timestamp ?? 0) * 1000).toISOString(),
      });
    }
  } catch (err) {
    console.error("Helius whale transfer fetch error:", err);
  }

  try {
    const swapTxs = await fetchHeliusAddressTransactions(apiKey, WSOL_MINT, "SWAP", 25);

    for (const tx of swapTxs) {
      if (seenSig.has(tx.signature)) continue;

      const tokenTransfers = tx.tokenTransfers || [];
      let usdApprox = 0;
      let fromAddr = "";
      let toAddr = "";

      for (const tt of tokenTransfers) {
        const u = usdcTransferUsd(tt);
        if (u > usdApprox) {
          usdApprox = u;
          fromAddr = tt.fromUserAccount;
          toAddr = tt.toUserAccount;
        }
      }

      if (usdApprox < MIN_SWAP_USD) continue;
      seenSig.add(tx.signature);

      const proto =
        protocolFromAddresses(fromAddr, toAddr) ||
        (tx.source?.toLowerCase().includes("jupiter") ? "Jupiter" : undefined) ||
        tx.source;

      const isJupiterSurge =
        (tx.source?.toUpperCase().includes("JUPITER") || proto?.includes("Jupiter")) && usdApprox >= 100_000;

      const isProtocolSurge =
        proto === "Marinade" && usdApprox >= 75_000 && tx.source?.toUpperCase().includes("MARINADE");

      let eventType: OnChainBrief["eventType"] = "large_swap";
      if (isProtocolSurge) eventType = "protocol_surge";
      else if (isJupiterSurge) eventType = "dex_volume_spike";

      briefs.push({
        type: "onchain",
        eventType,
        description:
          tx.description ||
          `Large swap (~$${(usdApprox / 1000).toFixed(0)}k USDC leg)${proto ? ` via ${proto}` : ""}`,
        amount: usdApprox,
        amountUSD: usdApprox,
        fromAddress: fromAddr || tx.feePayer || "",
        toAddress: toAddr,
        txSignature: tx.signature,
        protocol: proto,
        timestamp: new Date((tx.timestamp ?? 0) * 1000).toISOString(),
      });
    }
  } catch (err) {
    console.error("Helius swap fetch error:", err);
  }

  briefs.sort((a, b) => b.amountUSD - a.amountUSD);

  return briefs.slice(0, 5);
}

function formatOnChainBriefs(events: OnChainBrief[]): string {
  if (events.length === 0) return "No significant on-chain events detected in the last hour.";

  const formatted = events
    .map(
      (e, i) =>
        `[On-Chain Event ${i + 1}] ${e.eventType.toUpperCase()}\n${e.description}\nTx: ${e.txSignature}\nTime: ${e.timestamp}${e.protocol ? `\nProtocol: ${e.protocol}` : ""}`
    )
    .join("\n\n---\n\n");

  return `LIVE SOLANA ON-CHAIN EVENTS:\n\n${formatted}`;
}

export const helisProvider: Provider = {
  name: "HELIUS_ONCHAIN",
  description:
    "Large SOL transfers and notable swaps from Helius Enhanced Transactions (REST), with live SOL/USD from CoinGecko.",

  get: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<ProviderResult> => {
    const apiKey = getHeliusApiKey(runtime);
    if (!apiKey) {
      return {
        text: "Helius API key not configured — on-chain data unavailable. Set HELIUS_API_KEY in .env or character settings.",
      };
    }

    const events = await fetchOnChainBriefs(runtime, apiKey);
    const text =
      events.length === 0
        ? "No significant on-chain events detected in the last hour."
        : formatOnChainBriefs(events);

    return {
      text,
      data: { briefs: events, count: events.length },
    };
  },
};
