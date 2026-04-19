import {
  type Action,
  type ActionExample,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
} from "@elizaos/core";
import { chatCompletion } from "../llm";
import { broadcastArticleToSocials } from "../socialBroadcast";

function getWeb3InstantConfig(runtime: IAgentRuntime): { apiUrl: string; apiSecret: string } | null {
  const urlRaw = runtime.getSetting("WEB3INSTANT_API_URL");
  const secretRaw = runtime.getSetting("WEB3INSTANT_API_SECRET");
  const apiUrl =
    (typeof urlRaw === "string" && urlRaw.length > 0 ? urlRaw : null) ||
    process.env.WEB3INSTANT_API_URL ||
    "";
  const apiSecret =
    (typeof secretRaw === "string" && secretRaw.length > 0 ? secretRaw : null) ||
    process.env.WEB3INSTANT_API_SECRET ||
    "";
  if (!apiUrl || !apiSecret) return null;
  return { apiUrl: apiUrl.replace(/\/$/, ""), apiSecret };
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

const MANUAL_ARTICLE_SYSTEM_PROMPT = `You are Don Roneth, lead journalist at Web3Instant (web3instant.com).

Write a complete crypto / Web3 news article about the topic the user requests.

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
  "sourceUrls": ["array of source URLs cited in the article (real URLs only)"],
  "storyType": "one of: breaking | analysis | whale_alert | protocol_surge | investigation"
}

WRITING RULES:
- Open with a first-person anecdote or vivid scene-setter
- Cite specific numbers when available; do not invent numbers
- H2 sections: Background, Key Data, What This Means, My Take
- Never hallucinate sources: if you can't cite, use fewer sources, but only real URLs
- Keep it punchy and scannable`;

export const writeAndPublishAction: Action = {
  name: "WRITE_AND_PUBLISH",
  description: "Write an article on a user topic, publish to Web3Instant, then post to X (and Telegram if configured).",
  similes: ["WRITE_AND_POST", "PUBLISH_TOPIC", "MANUAL_PUBLISH", "WRITE_ARTICLE_AND_PUBLISH"],

  validate: async (runtime: IAgentRuntime): Promise<boolean> => {
    return getWeb3InstantConfig(runtime) !== null;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options,
    callback?: HandlerCallback
  ): Promise<ActionResult | void> => {
    const config = getWeb3InstantConfig(runtime);
    if (!config) {
      const text = "WEB3INSTANT_API_URL / WEB3INSTANT_API_SECRET not configured.";
      if (callback) await callback({ text });
      return { success: false, text };
    }

    const topic = (message.content?.text || "").trim();
    if (!topic) {
      const text = "Tell me what you want the article to be about.";
      if (callback) await callback({ text });
      return { success: false, text };
    }

    try {
      const raw = await chatCompletion({
        systemPrompt: MANUAL_ARTICLE_SYSTEM_PROMPT,
        userPrompt: `TOPIC REQUEST:\n${topic}\n\nRespond with ONLY the JSON object, no preamble, no markdown code fences.`,
        maxTokens: 4096,
        temperature: 0.7,
      });

      const cleaned = raw.trim().replace(/^```json\n?/i, "").replace(/\n?```$/i, "");
      const article = JSON.parse(cleaned) as Record<string, unknown>;

      if (typeof article.title !== "string" || typeof article.content !== "string") {
        throw new Error("LLM returned invalid JSON (missing title/content).");
      }

      if (typeof article.slug !== "string" || !article.slug) {
        article.slug = slugify(article.title);
      }

      const { apiUrl, apiSecret } = config;
      const res = await fetch(`${apiUrl}/api/agent/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-agent-secret": apiSecret },
        body: JSON.stringify({
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: typeof article.excerpt === "string" ? article.excerpt : "",
          category: typeof article.category === "string" ? article.category : "tech",
          tags: Array.isArray(article.tags) ? article.tags : [],
          sourceUrls: Array.isArray(article.sourceUrls) ? article.sourceUrls : [],
          storyType: typeof article.storyType === "string" ? article.storyType : "analysis",
          author: "don-roneth",
          publishedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Web3Instant publish failed (${res.status}): ${errText}`);
      }

      const result = (await res.json()) as { articleUrl?: string; slug?: string };
      const fullUrl = result.articleUrl || `${apiUrl}/en/article/${String(article.slug || result.slug || "")}`;

      const tweetRaw =
        typeof article.tweet === "string" && article.tweet.trim().length > 0
          ? article.tweet
          : `📰 ${String(article.title).slice(0, 200)} web3instant.com`;
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

      const text = `✅ Published: ${fullUrl}\n\nPosted to X (and Telegram if configured).`;
      if (callback) {
        await callback({ text, articleUrl: fullUrl, tweet: updatedTweet, telegramMessage: updatedTelegram });
      }
      return { success: true, text, data: { articleUrl: fullUrl } };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[WRITE_AND_PUBLISH] Error:", e);
      if (callback) await callback({ text: `Failed: ${msg}` });
      return { success: false, text: `Failed: ${msg}`, error: msg };
    }
  },

  examples: [] as ActionExample[][],
};

