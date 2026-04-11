import { NextResponse } from 'next/server';
import dotenv from 'dotenv';
import path from 'path';

export async function POST(req: Request) {
  // Handle chat request
  try {
    // Ensure env vars are loaded
    if (!process.env.GROQ_API_KEY) {
      dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
    }

    const { message, context } = await req.json();
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is missing from process.env');
      return NextResponse.json({ error: 'Groq API key not configured' }, { status: 500 });
    }

    if (!message || !context) {
      return NextResponse.json({ error: 'Message and context are required' }, { status: 400 });
    }

    const systemPrompt = `
      You are a helpful AI assistant for a news website called Web3Instant.
      Your task is to answer user questions based ONLY on the provided article context.
      
      Article Context:
      ${context}

      Instructions:
      1. Answer the user's question using only the information from the article.
      2. If the answer is not in the article, politely say that the article doesn't contain that information.
      3. Keep your answers concise and relevant.
      4. Do not hallucinate or make up facts not present in the text.
      5. Maintain a professional and helpful tone.
      6. IMPORTANT: Do not provide financial advice. If the user asks for investment advice, price predictions, or trading strategies, explicitly state that you cannot provide financial advice and they should "Do Your Own Research (DYOR)".
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.5,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error parsing JSON' }));
      console.error('Groq API Error:', errorData);
      return NextResponse.json({ 
        error: errorData?.error?.message || 'Failed to fetch response from AI',
        details: errorData 
      }, { status: response.status });
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
