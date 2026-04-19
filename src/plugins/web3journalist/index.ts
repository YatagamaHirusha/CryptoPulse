import type { Plugin } from "@elizaos/core";
import { rssProvider, heliusProvider } from "./providers";
import { generateArticleAction, publishArticleAction, writeAndPublishAction } from "./actions";
import { web3JournalistSchedulerService } from "./services/scheduler";

export const web3journalistPlugin: Plugin = {
  name: "web3journalist",
  description:
    "Autonomous Web3 journalism plugin for Web3Instant — monitors on-chain events and news, writes articles, publishes to web3instant.com, Twitter, and Telegram",
  providers: [rssProvider, heliusProvider],
  actions: [generateArticleAction, publishArticleAction, writeAndPublishAction],
  services: [web3JournalistSchedulerService],
};

export default web3journalistPlugin;
