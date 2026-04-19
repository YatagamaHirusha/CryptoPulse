/**
 * ChainPulse / Web3Instant — main agent plugin entry.
 * Register `web3journalistPlugin` in your character JSON `plugins` array.
 *
 * ElizaOS Plugin Docs: https://elizaos.github.io/eliza/docs/core/plugins
 */

import type { Plugin } from "@elizaos/core";
import { web3journalistPlugin } from "./plugins/web3journalist";

// TODO: implement in prompt-XX
export const customPlugin: Plugin = web3journalistPlugin;

export { web3journalistPlugin } from "./plugins/web3journalist";
export { character } from "./character";

/** Helius webhook queue — POST /webhook/helius pushes here; poll with {@link drainHeliusWebhookEvents}. */
export {
  heliusWebhookQueue,
  pushHeliusWebhookEvents,
  drainHeliusWebhookEvents,
  heliusWebhookQueueLength,
} from "./plugins/web3journalist/webhook/heliusWebhookQueue";

export default customPlugin;
