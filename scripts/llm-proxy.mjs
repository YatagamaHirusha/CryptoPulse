#!/usr/bin/env node
/**
 * LLM proxy: translates ElizaOS's /v1/responses (OpenAI Responses API)
 * into /v1/chat/completions that Nosana supports.
 *
 * Handles: role mapping, thinking mode, streaming.
 */

import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
try {
  const envPath = resolve(__dirname, "..", ".env");
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
} catch { /* ok */ }

const PORT = parseInt(process.env.LLM_PROXY_PORT || "3002", 10);
const UPSTREAM = (process.env.NOSANA_UPSTREAM_URL || process.env.OPENAI_API_URL || "").replace(/\/$/, "");
const KEY = process.env.OPENAI_API_KEY || "nosana";

if (!UPSTREAM) { console.error("[PROXY] Set OPENAI_API_URL"); process.exit(1); }

const VALID_ROLES = new Set(["system", "user", "assistant"]);

function fixRole(role) {
  if (VALID_ROLES.has(role)) return role;
  if (role === "developer" || role === "tool") return "system";
  return "user";
}

function extractText(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((c) => typeof c === "object" && c !== null)
      .map((c) => c.text || c.content || "")
      .filter(Boolean)
      .join("\n");
  }
  return String(content || "");
}

function responsesToChat(body) {
  const messages = [];

  if (body.instructions) {
    messages.push({ role: "system", content: body.instructions });
  }

  for (const item of body.input || []) {
    if (typeof item === "string") {
      messages.push({ role: "user", content: item });
      continue;
    }
    if (!item || typeof item !== "object") continue;

    const role = fixRole(item.role || "user");
    const text = extractText(item.content);
    if (text) messages.push({ role, content: text });
  }

  if (messages.length === 0) {
    messages.push({ role: "user", content: "Hello" });
  }

  return {
    model: body.model,
    messages,
    max_tokens: body.max_output_tokens || 4096,
    temperature: body.temperature ?? 0.7,
    chat_template_kwargs: { enable_thinking: false },
  };
}

function chatToResponsesJson(chatResp) {
  const text = chatResp.choices?.[0]?.message?.content || "";
  const id = "resp_" + Date.now().toString(36);
  return {
    id,
    object: "response",
    created_at: chatResp.created || Math.floor(Date.now() / 1000),
    status: "completed",
    model: chatResp.model,
    output: [{
      type: "message",
      id: "msg_" + Date.now().toString(36),
      status: "completed",
      role: "assistant",
      content: [{ type: "output_text", text }],
    }],
    usage: {
      input_tokens: chatResp.usage?.prompt_tokens || 0,
      output_tokens: chatResp.usage?.completion_tokens || 0,
      total_tokens: chatResp.usage?.total_tokens || 0,
    },
  };
}

function buildResponsesSSE(chatResp) {
  const text = chatResp.choices?.[0]?.message?.content || "";
  const id = "resp_" + Date.now().toString(36);
  const itemId = "item_" + Date.now().toString(36);
  const model = chatResp.model || "unknown";
  const created = chatResp.created || Math.floor(Date.now() / 1000);

  const usage = {
    input_tokens: chatResp.usage?.prompt_tokens || 0,
    output_tokens: chatResp.usage?.completion_tokens || 0,
    total_tokens: chatResp.usage?.total_tokens || 0,
  };

  const respBase = { id, object: "response", created_at: created, status: "in_progress", model, output: [] };
  const ev = [];

  ev.push(`event: response.created\ndata: ${JSON.stringify({ type: "response.created", response: respBase })}\n\n`);

  const msgItem = { type: "message", id: itemId, status: "in_progress", role: "assistant", content: [] };
  ev.push(`event: response.output_item.added\ndata: ${JSON.stringify({ type: "response.output_item.added", output_index: 0, item: msgItem })}\n\n`);

  ev.push(`event: response.content_part.added\ndata: ${JSON.stringify({ type: "response.content_part.added", item_id: itemId, output_index: 0, content_index: 0, part: { type: "output_text", text: "" } })}\n\n`);

  const chunkSize = 40;
  for (let i = 0; i < text.length; i += chunkSize) {
    ev.push(`event: response.output_text.delta\ndata: ${JSON.stringify({ type: "response.output_text.delta", item_id: itemId, output_index: 0, content_index: 0, delta: text.slice(i, i + chunkSize) })}\n\n`);
  }

  ev.push(`event: response.output_text.done\ndata: ${JSON.stringify({ type: "response.output_text.done", item_id: itemId, output_index: 0, content_index: 0, text })}\n\n`);

  ev.push(`event: response.content_part.done\ndata: ${JSON.stringify({ type: "response.content_part.done", item_id: itemId, output_index: 0, content_index: 0, part: { type: "output_text", text } })}\n\n`);

  const doneItem = { ...msgItem, status: "completed", content: [{ type: "output_text", text }] };
  ev.push(`event: response.output_item.done\ndata: ${JSON.stringify({ type: "response.output_item.done", output_index: 0, item: doneItem })}\n\n`);

  const doneResp = { ...respBase, status: "completed", output: [doneItem], usage };
  ev.push(`event: response.completed\ndata: ${JSON.stringify({ type: "response.completed", response: doneResp })}\n\n`);

  return ev.join("");
}

async function handle(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;

  if (req.method === "GET" && (path === "/health" || path === "/healthz")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end('{"ok":true}');
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Allow-Methods": "*" });
    return res.end();
  }

  let rawBody = "";
  for await (const chunk of req) rawBody += chunk;

  const isResponses = path.endsWith("/responses");
  const isChatCompletions = path.endsWith("/chat/completions");

  let upstreamUrl, upstreamBody, wantStream = false, needConvert = false;

  if (isResponses && req.method === "POST") {
    try {
      const parsed = JSON.parse(rawBody);
      wantStream = !!parsed.stream;
      const chatBody = responsesToChat(parsed);
      upstreamUrl = `${UPSTREAM}/chat/completions`;
      upstreamBody = JSON.stringify(chatBody);
      needConvert = true;
    } catch (e) {
      console.error("[PROXY] Parse error:", e.message);
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: { message: "Bad request body" } }));
    }
  } else if (isChatCompletions && req.method === "POST") {
    try {
      const parsed = JSON.parse(rawBody);
      wantStream = !!parsed.stream;
      parsed.stream = false;
      parsed.chat_template_kwargs = { enable_thinking: false };
      if (parsed.messages) {
        parsed.messages = parsed.messages.map((m) => ({ ...m, role: fixRole(m.role) }));
      }
      upstreamUrl = `${UPSTREAM}/chat/completions`;
      upstreamBody = JSON.stringify(parsed);
    } catch {
      upstreamUrl = `${UPSTREAM}/chat/completions`;
      upstreamBody = rawBody;
    }
  } else {
    const suffix = path.replace(/^\/v1/, "");
    upstreamUrl = `${UPSTREAM}${suffix}`;
    upstreamBody = rawBody;
  }

  try {
    const upRes = await fetch(upstreamUrl, {
      method: req.method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: req.method !== "GET" && req.method !== "HEAD" ? upstreamBody : undefined,
      signal: AbortSignal.timeout(180_000),
    });

    const respText = await upRes.text();

    if (!upRes.ok) {
      console.error(`[PROXY] Upstream ${upRes.status}: ${respText.slice(0, 200)}`);
      res.writeHead(upRes.status, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(respText);
    }

    const chatJson = JSON.parse(respText);

    if (needConvert && wantStream) {
      const sse = buildResponsesSSE(chatJson);
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      return res.end(sse);
    }

    if (needConvert) {
      const converted = chatToResponsesJson(chatJson);
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      return res.end(JSON.stringify(converted));
    }

    if (wantStream && chatJson.choices) {
      const text = chatJson.choices[0]?.message?.content || "";
      const chunks = [];
      const chunkSize = 20;
      for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(`data: ${JSON.stringify({
          id: chatJson.id, object: "chat.completion.chunk", model: chatJson.model,
          choices: [{ index: 0, delta: { content: text.slice(i, i + chunkSize) }, finish_reason: null }],
        })}\n\n`);
      }
      chunks.push(`data: ${JSON.stringify({
        id: chatJson.id, object: "chat.completion.chunk", model: chatJson.model,
        choices: [{ index: 0, delta: {}, finish_reason: "stop" }],
      })}\n\n`);
      chunks.push("data: [DONE]\n\n");

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      return res.end(chunks.join(""));
    }

    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    return res.end(respText);
  } catch (err) {
    console.error(`[PROXY] Error:`, err.message);
    res.writeHead(502, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: { message: err.message } }));
  }
}

createServer(handle).listen(PORT, () => {
  console.log(`[PROXY] Ready on http://localhost:${PORT} → ${UPSTREAM}`);
});
