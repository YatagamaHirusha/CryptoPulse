/** In-memory FIFO for Helius webhook payloads — polled by the agent / scheduler. */
const MAX_QUEUE = 1000;

export const heliusWebhookQueue: unknown[] = [];

/**
 * Append Helius events (normalized to individual items). Drops oldest entries past {@link MAX_QUEUE}.
 */
export function pushHeliusWebhookEvents(events: unknown[]): void {
  for (const e of events) {
    heliusWebhookQueue.push(e);
  }
  while (heliusWebhookQueue.length > MAX_QUEUE) {
    heliusWebhookQueue.shift();
  }
}

/** Remove and return up to `limit` queued events (default: all). */
export function drainHeliusWebhookEvents(limit: number = heliusWebhookQueue.length): unknown[] {
  const n = Math.min(limit, heliusWebhookQueue.length);
  return heliusWebhookQueue.splice(0, n);
}

export function heliusWebhookQueueLength(): number {
  return heliusWebhookQueue.length;
}
