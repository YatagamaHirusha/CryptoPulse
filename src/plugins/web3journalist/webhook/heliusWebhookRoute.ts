import type { IAgentRuntime, Route } from "@elizaos/core";
import { pushHeliusWebhookEvents } from "./heliusWebhookQueue";

/**
 * Normalize Helius POST body to an array (Helius may send one object or an array).
 */
function normalizeEvents(body: unknown): unknown[] {
  if (body == null) return [];
  if (Array.isArray(body)) return body;
  return [body];
}

export function createHeliusWebhookRoute(): Route {
  return {
    type: "POST",
    path: "/webhook/helius",
    name: "helius-webhook",
    public: true,
    handler: async (req, res, _runtime: IAgentRuntime): Promise<void> => {
      const events = normalizeEvents(req.body);
      console.log("[Helius Webhook] Received:", events.length, "events");
      pushHeliusWebhookEvents(events);
      res.status(200).json({ status: "received" });
    },
  };
}
