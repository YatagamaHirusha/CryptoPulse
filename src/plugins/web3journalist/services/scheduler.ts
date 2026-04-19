import { Service, type IAgentRuntime } from "@elizaos/core";
import { fetchAllRecentStories, type NewsBrief } from "../providers/rssProvider";
import { chatCompletion } from "../llm";
import { broadcastArticleToSocials } from "../socialBroadcast";

/** Minutes between automated RSS → article → publish cycles. Override via `WEB3JOURNALIST_INTERVAL_MINUTES` in agent `.env` (default: 5). */
function envPositiveInt(name: string, fallback: number): number {
  const n = Number(process.env[name]);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

const INTERVAL_MS = envPositiveInt("WEB3JOURNALIST_INTERVAL_MINUTES", 5) * 60 * 1000;
/** Seconds after agent start before the first run. Override: `WEB3JOURNALIST_FIRST_RUN_DELAY_SEC` (default: 30). */
const FIRST_RUN_DELAY_MS = envPositiveInt("WEB3JOURNALIST_FIRST_RUN_DELAY_SEC", 30) * 1000;

const ARTICLE_SYSTEM_PROMPT = `You are Don Roneth, lead journalist at Web3Instant (web3instant.com).

Write a complete crypto news article based on the news brief provided. 

OUTPUT FORMAT: Respond with ONLY a valid JSON object matching this exact structure:
{
  "title": "Compelling headline that leads with the biggest fact",
  "slug": "url-friendly-slug-max-60-chars",
  "content": "Full article in markdown. 400-600 words. Use ## H2 headers. Include bullet points for key data. End with ## My Take section.",
  "excerpt": "1-2 sentence hook. Start with the most shocking number or fact.",
  "tweet": "Twitter post max 280 chars. Lead with emoji + biggest number. End with web3instant.com",
  "telegramMessage": "Telegram message 400-600 chars. More detailed than tweet. Use **bold** for key numbers.",
  "category": "one of: bitcoin | ethereum | defi | nfts | regulation | finance | tech",
  "tags": ["array", "of", "3-5", "relevant", "tags"],
  "sourceUrls": ["array of source URLs cited in the article"],
  "storyType": "one of: breaking | analysis | whale_alert | protocol_surge | investigation"
}

WRITING RULES:
- Open with a first-person anecdote or vivid scene-setter
- Cite specific numbers — never say 'significantly', say '$3.2M' or '18%'
- Reference historical parallels when relevant
- H2 sections: Background, Key Data, What This Means, My Take
- Never hallucinate data — only use what's in the brief
- Keep it punchy and scannable`;

const publishedSourceUrls = new Set<string>();

function pickBestStory(stories: NewsBrief[]): NewsBrief | null {
  const fresh = stories.filter((s) => !publishedSourceUrls.has(s.sourceUrl));
  if (fresh.length === 0) return null;
  return fresh[0];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
}

async function runCycle(runtime: IAgentRuntime): Promise<void> {
  console.log("[SCHEDULER] Fetching RSS stories...");

  let stories: NewsBrief[];
  try {
    stories = await fetchAllRecentStories();
  } catch (err) {
    console.error("[SCHEDULER] RSS fetch failed:", err);
    return;
  }

  if (stories.length === 0) {
    console.log("[SCHEDULER] No new RSS stories in last 24h. Skipping cycle.");
    return;
  }

  console.log(`[SCHEDULER] Got ${stories.length} stories (${publishedSourceUrls.size} already published). Picking next...`);
  const story = pickBestStory(stories);
  if (!story) {
    console.log("[SCHEDULER] All stories already published. Skipping.");
    return;
  }

  console.log(`[SCHEDULER] Writing article for: "${story.headline}"`);

  let raw: string;
  try {
    raw = await chatCompletion({
      systemPrompt: ARTICLE_SYSTEM_PROMPT,
      userPrompt: `NEWS BRIEF TO WRITE ABOUT:
Headline: ${story.headline}
Summary: ${story.summary}
Source: ${story.sourceName} (${story.sourceUrl})
Category: ${story.category}
Published: ${story.publishedAt}

Respond with ONLY the JSON object, no preamble, no markdown code fences.`,
      maxTokens: 4096,
      temperature: 0.7,
    });
  } catch (err) {
    console.error("[SCHEDULER] LLM call failed:", err);
    return;
  }

  let article: Record<string, unknown>;
  try {
    const cleaned = raw.trim().replace(/^```json\n?/i, "").replace(/\n?```$/i, "");
    article = JSON.parse(cleaned);
    if (!article.title || !article.content) throw new Error("Missing title/content");
  } catch (err) {
    console.error("[SCHEDULER] Failed to parse article JSON:", err);
    console.error("[SCHEDULER] Raw (first 500 chars):", raw.slice(0, 500));
    return;
  }

  if (!article.slug) article.slug = slugify(article.title as string);

  const apiUrl =
    (runtime.getSetting("WEB3INSTANT_API_URL") as string) ||
    process.env.WEB3INSTANT_API_URL ||
    "";
  const apiSecret =
    (runtime.getSetting("WEB3INSTANT_API_SECRET") as string) ||
    process.env.WEB3INSTANT_API_SECRET ||
    "";

  if (!apiUrl || !apiSecret) {
    console.error("[SCHEDULER] WEB3INSTANT_API_URL or WEB3INSTANT_API_SECRET not set. Skipping publish.");
    return;
  }

  console.log(`[SCHEDULER] Publishing: "${article.title}"`);

  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/agent/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-agent-secret": apiSecret,
      },
      body: JSON.stringify({
        title: article.title,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt || "",
        category: article.category || story.category,
        tags: article.tags || [],
        sourceUrls: article.sourceUrls || [story.sourceUrl],
        storyType: article.storyType || "breaking",
        author: "don-roneth",
        publishedAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[SCHEDULER] Publish failed (${res.status}):`, errText);
      return;
    }

    const result = (await res.json()) as { articleUrl?: string; slug?: string };
    publishedSourceUrls.add(story.sourceUrl);
    console.log(`[SCHEDULER] Published! ${result.articleUrl || result.slug}`);

    const fullUrl =
      result.articleUrl ||
      `${apiUrl.replace(/\/$/, "")}/en/article/${(article.slug as string) || result.slug || ""}`;
    const tweetRaw =
      typeof article.tweet === "string" && article.tweet.trim().length > 0
        ? article.tweet
        : `📰 ${String(article.title).slice(0, 200)}`;
    const telegramRaw =
      typeof article.telegramMessage === "string" && article.telegramMessage.trim().length > 0
        ? article.telegramMessage
        : `**${String(article.title)}**\n\n${String(article.excerpt || "")}`;
    const updatedTweet = tweetRaw.replace("web3instant.com", fullUrl);
    const updatedTelegram = `${telegramRaw}\n\n🔗 ${fullUrl}`;

    await broadcastArticleToSocials(runtime, {
      tweet: updatedTweet,
      telegramMessage: updatedTelegram,
    });
  } catch (err) {
    console.error("[SCHEDULER] Publish request failed:", err);
  }
}

export class Web3JournalistScheduler extends Service {
  static serviceType = "web3journalist-scheduler";
  capabilityDescription = "Auto-fetches RSS news, generates articles via LLM, and publishes to web3instant.com on a schedule.";

  private timer: ReturnType<typeof setInterval> | null = null;
  private firstRunTimer: ReturnType<typeof setTimeout> | null = null;
  private _runtime: IAgentRuntime | undefined;

  static async start(runtime: IAgentRuntime): Promise<Service> {
    const svc = new Web3JournalistScheduler(runtime);
    svc._runtime = runtime;
    svc.begin();
    return svc;
  }

  static async stop(_runtime: IAgentRuntime): Promise<void> {
    return undefined;
  }

  constructor(runtime?: IAgentRuntime) {
    super(runtime);
    this._runtime = runtime;
  }

  private begin() {
    console.log(`[SCHEDULER] Initialized. First run in ${FIRST_RUN_DELAY_MS / 1000}s, then every ${INTERVAL_MS / 60000}min.`);

    this.firstRunTimer = setTimeout(async () => {
      if (this._runtime) await runCycle(this._runtime);

      this.timer = setInterval(async () => {
        if (this._runtime) await runCycle(this._runtime);
      }, INTERVAL_MS);
    }, FIRST_RUN_DELAY_MS);
  }

  async stop(): Promise<void> {
    if (this.firstRunTimer) clearTimeout(this.firstRunTimer);
    if (this.timer) clearInterval(this.timer);
    console.log("[SCHEDULER] Stopped.");
  }
}

export const web3JournalistSchedulerService: typeof Web3JournalistScheduler = Web3JournalistScheduler;
