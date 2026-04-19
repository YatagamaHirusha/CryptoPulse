/**
 * Direct OpenAI-compatible chat completions client for Nosana endpoints.
 * ElizaOS's runtime.useModel sends to /v1/responses (OpenAI Responses API)
 * but Nosana only supports /v1/chat/completions.
 */

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices: Array<{
    message: { content: string };
    finish_reason: string;
  }>;
}

export async function chatCompletion(opts: {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string> {
  const apiUrl = (process.env.OPENAI_API_URL || "http://127.0.0.1:11434/v1").replace(/\/$/, "");
  const apiKey = process.env.OPENAI_API_KEY || "nosana";
  const model = process.env.MODEL_NAME || "Qwen3.5-9B-FP8";

  const messages: ChatMessage[] = [
    { role: "system", content: opts.systemPrompt },
    { role: "user", content: opts.userPrompt },
  ];

  const res = await fetch(`${apiUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0.7,
      chat_template_kwargs: { enable_thinking: false },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM API error (${res.status}): ${errText}`);
  }

  const data = (await res.json()) as ChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty LLM response");
  return content;
}
