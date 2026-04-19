import {
  type Action,
  type ActionExample,
  type ActionResult,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  type State,
} from "@elizaos/core";
import type { GeneratedArticle } from "./generateArticle";
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

async function loadArticle(runtime: IAgentRuntime, message: Memory): Promise<GeneratedArticle | null> {
  const fromMessage = (message.content as Record<string, unknown>).article;
  if (fromMessage && typeof fromMessage === "object" && fromMessage !== null && "title" in fromMessage) {
    return fromMessage as GeneratedArticle;
  }

  const cached = await runtime.getCache<string>("pending_article_latest");
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as GeneratedArticle;
      if (parsed?.title) return parsed;
    } catch {
      /* ignore */
    }
  }
  return null;
}

export const publishArticleAction: Action = {
  name: "PUBLISH_TO_WEB3INSTANT",
  description: "Publish a generated article to web3instant.com via the publishing API",
  similes: ["PUBLISH_ARTICLE", "POST_ARTICLE", "SAVE_ARTICLE", "SEND_TO_WEBSITE"],

  validate: async (runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<boolean> => {
    return getWeb3InstantConfig(runtime) !== null;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options,
    callback?: HandlerCallback
  ): Promise<ActionResult | void> => {
    try {
      const article = await loadArticle(runtime, message);
      if (!article?.title) {
        if (callback) {
          await callback({ text: "No article found to publish. Run GENERATE_ARTICLE first or pass article in content." });
        }
        return { success: false, text: "No article to publish" };
      }

      const config = getWeb3InstantConfig(runtime);
      if (!config) {
        if (callback) {
          await callback({ text: "WEB3INSTANT_API_URL / WEB3INSTANT_API_SECRET not configured." });
        }
        return { success: false, text: "Missing Web3Instant API config" };
      }

      const { apiUrl, apiSecret } = config;

      const publishResponse = await fetch(`${apiUrl}/api/agent/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-agent-secret": apiSecret,
        },
        body: JSON.stringify({
          title: article.title,
          slug: article.slug,
          content: article.content,
          excerpt: article.excerpt,
          category: article.category,
          tags: article.tags,
          sourceUrls: article.sourceUrls,
          storyType: article.storyType,
          author: "don-roneth",
          publishedAt: new Date().toISOString(),
        }),
      });

      if (!publishResponse.ok) {
        const errorText = await publishResponse.text();
        throw new Error(`API returned ${publishResponse.status}: ${errorText}`);
      }

      const result = (await publishResponse.json()) as { articleUrl?: string };
      const articleUrl = result.articleUrl;
      console.log("[PUBLISH] Published to web3instant:", articleUrl);

      const fullUrl = articleUrl || `${apiUrl}/en/article/${article.slug}`;
      const updatedTweet = article.tweet.replace("web3instant.com", fullUrl);
      const updatedTelegram = `${article.telegramMessage}\n\n🔗 ${fullUrl}`;

      await broadcastArticleToSocials(runtime, {
        tweet: updatedTweet,
        telegramMessage: updatedTelegram,
      });

      const summary = `✅ Published to web3instant.com: ${fullUrl}\n\nPosted to Twitter/X and Telegram (when configured).`;

      if (callback) {
        await callback({
          text: summary,
          tweet: updatedTweet,
          telegramMessage: updatedTelegram,
          articleUrl: fullUrl,
        });
      }

      return {
        success: true,
        text: summary,
        data: { articleUrl: fullUrl, tweet: updatedTweet, telegramMessage: updatedTelegram },
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("[PUBLISH] Error:", error);
      if (callback) {
        await callback({ text: `Publishing failed: ${msg}` });
      }
      return { success: false, text: `Publishing failed: ${msg}`, error: msg };
    }
  },

  examples: [] as ActionExample[][],
};

/** @deprecated Use {@link publishArticleAction} */
export const publishArticle = publishArticleAction;
