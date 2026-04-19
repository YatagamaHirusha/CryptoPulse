import type { IAgentRuntime, Memory, Provider, ProviderResult, State } from "@elizaos/core";
import Parser from "rss-parser";

const parser = new Parser();

/**
 * Sources aligned with web3instant `scripts/news-bot/index.ts` RSS_FEEDS
 * (CoinTelegraph, CoinDesk, BeInCrypto) plus Decrypt + The Defiant for broader coverage.
 */
const RSS_SOURCES = [
  { url: "https://cointelegraph.com/rss", name: "CoinTelegraph" },
  { url: "https://www.coindesk.com/arc/outboundfeeds/rss/", name: "CoinDesk" },
  { url: "https://beincrypto.com/feed/", name: "BeInCrypto" },
  { url: "https://decrypt.co/feed", name: "Decrypt" },
  { url: "https://thedefiant.io/feed", name: "The Defiant" },
];

/** URL → first-seen timestamp — entries older than 24h are pruned (in-memory dedup window). */
const urlSeenAt = new Map<string, number>();
const DEDUP_WINDOW_MS = 24 * 60 * 60 * 1000;

function pruneSeenUrls(): void {
  const now = Date.now();
  for (const [url, t] of urlSeenAt.entries()) {
    if (now - t > DEDUP_WINDOW_MS) urlSeenAt.delete(url);
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Mirrors `guessCategory` in web3instant `scripts/news-bot/index.ts` (same keyword order),
 * mapped onto the brief's category union.
 */
function categorizeBrief(title: string, snippet: string): NewsBrief["category"] {
  const text = `${title} ${snippet}`.toLowerCase();

  if (text.includes("bitcoin") || text.includes("btc")) return "bitcoin";
  if (text.includes("ethereum") || text.includes("eth") || text.includes("vitalik")) return "ethereum";
  if (
    text.includes("defi") ||
    text.includes("yield") ||
    text.includes("liquidity") ||
    text.includes("aave") ||
    text.includes("uniswap")
  )
    return "defi";
  if (text.includes("nft") || text.includes("collectible") || text.includes("opensea")) return "nfts";
  if (
    text.includes("regulation") ||
    text.includes("sec") ||
    text.includes("congress") ||
    text.includes("policy") ||
    text.includes("law")
  )
    return "regulation";
  if (text.includes("game") || text.includes("gaming") || text.includes("play-to-earn") || text.includes("p2e"))
    return "tech";
  if (text.includes("metaverse") || text.includes("virtual") || text.includes("avatar")) return "tech";
  if (
    text.includes("bank") ||
    text.includes("etf") ||
    text.includes("institutional") ||
    text.includes("wall street")
  )
    return "finance";
  if (
    text.includes("company") ||
    text.includes("partnership") ||
    text.includes("acquisition") ||
    text.includes("funding")
  )
    return "finance";
  if (
    text.includes("blockchain") ||
    text.includes("protocol") ||
    text.includes("layer") ||
    text.includes("scaling") ||
    text.includes("solana")
  )
    return "tech";

  return "finance";
}

export interface NewsBrief {
  type: "rss";
  headline: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: string;
  category: "bitcoin" | "ethereum" | "defi" | "nfts" | "regulation" | "finance" | "tech";
}

/**
 * Fetches recent RSS items using the same approach as web3instant `scripts/news-bot/rss.ts`:
 * `rss-parser` + `parseURL`, then **only items from the last 24 hours** (`pubDate`).
 * Dedupes by URL within a rolling 24h in-memory window (per process).
 */
export async function fetchLatestStories(): Promise<NewsBrief[]> {
  pruneSeenUrls();

  const stories: NewsBrief[] = [];
  const oneDayAgo = new Date(Date.now() - DEDUP_WINDOW_MS);

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);

      const recentItems = feed.items.filter((item) => {
        if (!item.pubDate) return false;
        return new Date(item.pubDate) > oneDayAgo;
      });

      const top = recentItems.slice(0, 5);

      for (const item of top) {
        if (!item.link || !item.title) continue;
        if (urlSeenAt.has(item.link)) continue;

        urlSeenAt.set(item.link, Date.now());

        const rawSnippet =
          item.contentSnippet ||
          (item.content ? stripHtml(item.content).slice(0, 300) : "") ||
          "";

        const headline = item.title;
        const category = categorizeBrief(headline, rawSnippet);

        stories.push({
          type: "rss",
          headline,
          summary: rawSnippet.slice(0, 300),
          sourceUrl: item.link,
          sourceName: source.name,
          publishedAt: item.pubDate || new Date().toISOString(),
          category,
        });
      }
    } catch (err) {
      console.error(`RSS fetch failed for ${source.name}:`, err);
    }
  }

  return stories;
}

/**
 * Same as fetchLatestStories but skips the in-memory URL dedup.
 * Used by the scheduler so every 5-min cycle still sees the full 24h window.
 */
export async function fetchAllRecentStories(): Promise<NewsBrief[]> {
  const stories: NewsBrief[] = [];
  const oneDayAgo = new Date(Date.now() - DEDUP_WINDOW_MS);

  for (const source of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(source.url);
      const recentItems = feed.items.filter((item) => {
        if (!item.pubDate) return false;
        return new Date(item.pubDate) > oneDayAgo;
      });

      for (const item of recentItems.slice(0, 10)) {
        if (!item.link || !item.title) continue;

        const rawSnippet =
          item.contentSnippet ||
          (item.content ? stripHtml(item.content).slice(0, 300) : "") ||
          "";

        stories.push({
          type: "rss",
          headline: item.title,
          summary: rawSnippet.slice(0, 300),
          sourceUrl: item.link,
          sourceName: source.name,
          publishedAt: item.pubDate || new Date().toISOString(),
          category: categorizeBrief(item.title, rawSnippet),
        });
      }
    } catch (err) {
      console.error(`RSS fetch failed for ${source.name}:`, err);
    }
  }

  return stories;
}

function formatBriefsForContext(stories: NewsBrief[]): string {
  if (stories.length === 0) return "No new RSS stories available.";

  const formatted = stories
    .slice(0, 8)
    .map(
      (s, i) =>
        `[Story ${i + 1}] ${s.sourceName} | ${s.category.toUpperCase()}\nHeadline: ${s.headline}\nSummary: ${s.summary}\nURL: ${s.sourceUrl}\nPublished: ${s.publishedAt}`
    )
    .join("\n\n---\n\n");

  return `LATEST NEWS BRIEFS (RSS):\n\n${formatted}`;
}

export const rssProvider: Provider = {
  name: "RSS_FEEDS",
  description:
    "Structured crypto news briefs from the same RSS sources and 24h window as web3instant/scripts/news-bot (rss-parser).",

  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<ProviderResult> => {
    const stories = await fetchLatestStories();
    const text = formatBriefsForContext(stories);
    return {
      text,
      data: { briefs: stories, count: stories.length },
    };
  },
};
