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

export interface GeneratedArticle {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tweet: string;
  telegramMessage: string;
  category: string;
  tags: string[];
  sourceUrls: string[];
  storyType: "breaking" | "analysis" | "whale_alert" | "protocol_surge" | "investigation";
}

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

function buildPrompt(newsBrief: string): string {
  return `${ARTICLE_SYSTEM_PROMPT}

NEWS BRIEF TO WRITE ABOUT:
${newsBrief}

Respond with ONLY the JSON object, no preamble, no markdown code fences.`;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/-$/, "");
}

function parseGeneratedArticle(raw: string): GeneratedArticle {
  const cleaned = raw.trim().replace(/^```json\n?/i, "").replace(/\n?```$/i, "");
  const parsed = JSON.parse(cleaned) as GeneratedArticle;
  if (!parsed.title || !parsed.content) {
    throw new Error("Missing required article fields");
  }
  return parsed;
}

export const generateArticleAction: Action = {
  name: "GENERATE_ARTICLE",
  description:
    "Generate a full news article from a news brief, formatted for web3instant.com, Twitter, and Telegram",
  similes: ["WRITE_ARTICLE", "CREATE_NEWS", "REPORT_STORY", "WRITE_NEWS"],

  validate: async (_runtime: IAgentRuntime, message: Memory, _state?: State): Promise<boolean> => {
    const text = message.content.text || "";
    return text.length > 20;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State | undefined,
    _options,
    callback?: HandlerCallback
  ): Promise<ActionResult | void> => {
    const newsBrief =
      message.content.text ||
      (typeof state?.text === "string" ? state.text : "") ||
      "";

    console.log("[GENERATE_ARTICLE] Writing article for brief:", newsBrief.slice(0, 100));

    try {
      const response = await chatCompletion({
        systemPrompt: ARTICLE_SYSTEM_PROMPT,
        userPrompt: `NEWS BRIEF TO WRITE ABOUT:\n${newsBrief}\n\nRespond with ONLY the JSON object, no preamble, no markdown code fences.`,
        maxTokens: 4096,
        temperature: 0.7,
      });

      let article: GeneratedArticle;
      try {
        article = parseGeneratedArticle(response);
      } catch (parseError) {
        console.error("[GENERATE_ARTICLE] Failed to parse JSON:", parseError);
        console.error("Raw response:", response.slice(0, 500));
        if (callback) {
          await callback({
            text: "Failed to generate article — model returned invalid JSON. Retrying...",
          });
        }
        return { success: false, text: "Invalid JSON from model", error: String(parseError) };
      }

      if (!article.slug) {
        article.slug = generateSlug(article.title);
      }

      console.log("[GENERATE_ARTICLE] Article generated:", article.title);

      await runtime.setCache(`pending_article_${Date.now()}`, JSON.stringify(article));
      await runtime.setCache("pending_article_latest", JSON.stringify(article));

      const summaryText = `Article generated: "${article.title}"\n\nTweet preview: ${article.tweet}\n\nReady to publish to web3instant.com, Twitter, and Telegram.`;

      if (callback) {
        await callback({
          text: summaryText,
          actions: ["PUBLISH_TO_WEB3INSTANT"],
        });
      }

      return {
        success: true,
        text: summaryText,
        data: { article },
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[GENERATE_ARTICLE] Error:", error);
      if (callback) {
        await callback({ text: `Article generation failed: ${msg}` });
      }
      return { success: false, text: `Article generation failed: ${msg}`, error: msg };
    }
  },

  examples: [
    [
      {
        name: "{{user1}}",
        content: { text: "Write an article about the whale that moved 28500 SOL from Binance" },
      },
      {
        name: "Don Roneth",
        content: {
          text: "Article generated: '🐋 28,500 SOL ($3.2M) Leaves Binance — Third Large Withdrawal This Week'\n\nTweet preview: 🐋 BREAKING: A single wallet just moved 28,500 SOL (~$3.2M) out of Binance. Fresh destination address created 4 hours ago. Third large withdrawal this week. Full analysis: web3instant.com\n\nReady to publish to web3instant.com, Twitter, and Telegram.",
          actions: ["PUBLISH_TO_WEB3INSTANT"],
        },
      },
    ],
  ] as ActionExample[][],
};

/** @deprecated Use {@link generateArticleAction} — kept for older imports */
export const generateArticle = generateArticleAction;
