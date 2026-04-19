import type { IAgentRuntime } from "@elizaos/core";

const TWEET_MAX = 280;

/** `@elizaos/plugin-twitter` TwitterService → twitterClient (TwitterClientInstance) → client (ClientBase). */
type TwitterServiceLike = {
  twitterClient?: {
    client?: {
      profile?: unknown;
      twitterClient?: {
        sendTweet: (
          text: string,
          replyToTweetId?: string,
          mediaData?: unknown[],
          hideLinkPreview?: boolean
        ) => Promise<unknown>;
      };
    };
  };
};

function isDryRun(runtime: IAgentRuntime): boolean {
  const v = runtime.getSetting("TWITTER_DRY_RUN") ?? process.env.TWITTER_DRY_RUN ?? "false";
  return String(v).toLowerCase() === "true";
}

export function truncateForTweet(text: string, max = TWEET_MAX): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.5 ? cut.slice(0, lastSpace) : cut) + "…";
}

/**
 * Post a status update via the Twitter plugin service (same path as POST_TWEET action).
 */
export async function postTwitterFromRuntime(runtime: IAgentRuntime, text: string): Promise<void> {
  const svc = runtime.getService("twitter") as unknown as TwitterServiceLike | null;
  const client = svc?.twitterClient?.client;
  if (!client?.profile) {
    console.warn("[SOCIAL] Twitter not ready (missing service or profile); skip tweet");
    return;
  }
  const sendTweet = client.twitterClient?.sendTweet as ((t: string) => Promise<unknown>) | undefined;
  if (!sendTweet) {
    console.warn("[SOCIAL] Twitter sendTweet unavailable; skip tweet");
    return;
  }
  const body = truncateForTweet(text);
  if (isDryRun(runtime)) {
    console.log("[SOCIAL] TWITTER_DRY_RUN=true — would tweet:", body.slice(0, 200));
    return;
  }
  await sendTweet(body);
  console.log("[SOCIAL] Tweet posted");
}

/**
 * Send via Telegram plugin send-handler (MarkdownV2 conversion is handled in the plugin).
 */
export async function postTelegramFromRuntime(runtime: IAgentRuntime, text: string): Promise<void> {
  const channelId =
    (runtime.getSetting("TELEGRAM_CHANNEL_ID") as string | undefined) ||
    process.env.TELEGRAM_CHANNEL_ID ||
    "";
  if (!channelId.trim()) {
    console.warn("[SOCIAL] TELEGRAM_CHANNEL_ID not set; skip Telegram");
    return;
  }
  await runtime.sendMessageToTarget(
    { source: "telegram", channelId: String(channelId).trim() },
    { text }
  );
  console.log("[SOCIAL] Telegram message sent");
}

/** Fire Twitter + Telegram together after a successful Web3Instant publish. */
export async function broadcastArticleToSocials(
  runtime: IAgentRuntime,
  opts: { tweet: string; telegramMessage: string }
): Promise<void> {
  const [twErr, tgErr] = await Promise.allSettled([
    postTwitterFromRuntime(runtime, opts.tweet),
    postTelegramFromRuntime(runtime, opts.telegramMessage),
  ]);
  if (twErr.status === "rejected") {
    console.error("[SOCIAL] Twitter post failed (non-fatal):", twErr.reason);
  }
  if (tgErr.status === "rejected") {
    console.error("[SOCIAL] Telegram post failed (non-fatal):", tgErr.reason);
  }
}
