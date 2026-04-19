import { NextResponse } from "next/server";

export const runtime = "nodejs";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,ripple,cardano,polkadot,dogecoin,litecoin,chainlink,avalanche-2&order=market_cap_desc&per_page=10&page=1&sparkline=false";

/** Minimal fallback when CoinGecko is unreachable (rate limit, DNS, dev offline). */
const FALLBACK = [
  { id: "bitcoin", symbol: "btc", current_price: 0, price_change_percentage_24h: 0 },
  { id: "ethereum", symbol: "eth", current_price: 0, price_change_percentage_24h: 0 },
  { id: "solana", symbol: "sol", current_price: 0, price_change_percentage_24h: 0 },
];

/**
 * Server-side proxy for CoinGecko so the browser does not call coingecko.com directly
 * (avoids CORS quirks, ad-blockers, and "Failed to fetch" in some environments).
 */
export async function GET() {
  try {
    const res = await fetch(COINGECKO_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.warn("[crypto-ticker] CoinGecko HTTP", res.status, await res.text().catch(() => ""));
      return NextResponse.json(FALLBACK, { status: 200, headers: { "X-Crypto-Ticker": "fallback" } });
    }

    const data = await res.json();
    if (!Array.isArray(data)) {
      return NextResponse.json(FALLBACK, { status: 200, headers: { "X-Crypto-Ticker": "fallback" } });
    }

    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch (e) {
    console.error("[crypto-ticker]", e);
    return NextResponse.json(FALLBACK, { status: 200, headers: { "X-Crypto-Ticker": "fallback" } });
  }
}
