import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    if (!message || !context) {
      return NextResponse.json({ error: "Message and context are required" }, { status: 400 });
    }

    const apiUrl = (
      process.env.NOSANA_LLM_URL ||
      process.env.OPENAI_API_URL ||
      ""
    ).replace(/\/$/, "");
    const apiKey = process.env.NOSANA_LLM_KEY || process.env.OPENAI_API_KEY || "nosana";
    const model = process.env.NOSANA_LLM_MODEL || process.env.MODEL_NAME || "Qwen3.5-9B-FP8";

    if (!apiUrl) {
      return NextResponse.json(
        { error: "LLM not configured. Set NOSANA_LLM_URL in .env.local" },
        { status: 500 }
      );
    }

    const systemPrompt = `You are a helpful AI assistant for a news website called Web3Instant.
Your task is to answer user questions based ONLY on the provided article context.

Article Context:
${context}

Instructions:
1. Answer the user's question using only the information from the article.
2. If the answer is not in the article, politely say that the article doesn't contain that information.
3. Keep your answers concise and relevant.
4. Do not hallucinate or make up facts not present in the text.
5. Maintain a professional and helpful tone.
6. IMPORTANT: Do not provide financial advice. If the user asks for investment advice, price predictions, or trading strategies, explicitly state that you cannot provide financial advice and they should "Do Your Own Research (DYOR)".`;

    const isNosana = apiUrl.includes("nos.ci");

    const res = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.5,
        max_tokens: 500,
        ...(isNosana ? { chat_template_kwargs: { enable_thinking: false } } : {}),
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[Chat API] LLM error:", res.status, errText.slice(0, 300));
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply =
      data.choices?.[0]?.message?.content || "Sorry, I could not generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[Chat API] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
