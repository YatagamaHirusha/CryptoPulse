import { NextRequest, NextResponse } from "next/server";
import { marked } from "marked";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 120;

const FALLBACK_COVER =
  "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=1600";

/* ------------------------------------------------------------------ */
/*  Image generation — same pipeline as scripts/news-bot              */
/* ------------------------------------------------------------------ */

const IMAGE_PROMPT_INSTRUCTIONS = `Based on the following news article, create a detailed, creative image generation prompt.

GOAL: Visualize the specific story using a "High-End Business Editorial" aesthetic.

INSTRUCTIONS:
1. BE CREATIVE & SPECIFIC — think like a photographer for Bloomberg or WSJ.
2. VISUAL STYLE: Authentic, cinematic, premium. Natural window light, golden hour, dramatic shadows. Real materials — grainy film, polished wood, fabric, stone, metal.
3. CRITICAL: NO TEXT, NO CHARTS, NO 3D renders, NO cartoons, NO abstract digital art.

Output ONLY the final prompt text, nothing else.`;

async function generateImagePrompt(title: string, content: string): Promise<string> {
  const fallback =
    "A dramatic shot of a modern skyscraper looking up from street level, reflecting clouds. High-end architectural photography.";

  const userPrompt = `Title: ${title}\nContent: ${content.substring(0, 500)}...`;

  const providers: Array<{ url: string; key: string; model: string }> = [];

  if (process.env.GROQ_API_KEY) {
    providers.push({
      url: "https://api.groq.com/openai/v1/chat/completions",
      key: process.env.GROQ_API_KEY,
      model: "llama-3.3-70b-versatile",
    });
  }
  if (process.env.NOSANA_LLM_URL && process.env.NOSANA_LLM_KEY) {
    providers.push({
      url: `${process.env.NOSANA_LLM_URL.replace(/\/$/, "")}/chat/completions`,
      key: process.env.NOSANA_LLM_KEY,
      model: process.env.NOSANA_LLM_MODEL || "Qwen3.5-9B-FP8",
    });
  }

  for (const p of providers) {
    try {
      const res = await fetch(p.url, {
        method: "POST",
        headers: { Authorization: `Bearer ${p.key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: p.model,
          messages: [
            { role: "system", content: IMAGE_PROMPT_INSTRUCTIONS },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.85,
          max_tokens: 300,
          ...(p.url.includes("nos.ci") ? { chat_template_kwargs: { enable_thinking: false } } : {}),
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (res.ok) {
        const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text && text.length > 20) return text;
      }
    } catch {
      /* try next provider */
    }
  }
  return fallback;
}

async function generateCoverImage(prompt: string): Promise<Buffer | null> {
  const keysRaw = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  const keys = keysRaw.split(",").map((k) => k.trim()).filter(Boolean);
  if (keys.length === 0) return null;

  const style =
    " Style: High-End Business Editorial Photography, authentic, trusted, natural lighting, real materials, premium textures. CRITICAL: NO 3D renders, NO abstract art, NO cartoons, NO text.";

  for (let attempt = 0; attempt < Math.min(keys.length, 3); attempt++) {
    const key = keys[attempt % keys.length];
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt + style }] }] }),
          signal: AbortSignal.timeout(60_000),
        }
      );
      if (!res.ok) {
        if (res.status === 429 || res.status === 503) {
          await new Promise((r) => setTimeout(r, 15_000));
          continue;
        }
        continue;
      }
      const data = await res.json();
      const part = data.candidates?.[0]?.content?.parts?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => p.inline_data || p.inlineData
      );
      const b64 = part?.inline_data?.data || part?.inlineData?.data;
      if (b64) return Buffer.from(b64, "base64");
    } catch {
      /* retry */
    }
  }
  return null;
}

async function uploadToStorage(buffer: Buffer, slug: string): Promise<string | null> {
  try {
    const sharp = (await import("sharp")).default;
    const processed = await sharp(buffer)
      .jpeg({ quality: 80, mozjpeg: true })
      .resize(1200, 675, { fit: "cover" })
      .toBuffer();

    const fileName = `ai-gen-${slug}-${Date.now()}.jpg`;
    const { error } = await supabaseAdmin.storage
      .from("article-images")
      .upload(fileName, processed, { contentType: "image/jpeg", upsert: false });

    if (error) {
      console.error("[Image Upload] Storage error:", error.message);
      return null;
    }

    const { data: urlData } = supabaseAdmin.storage
      .from("article-images")
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  } catch (err) {
    console.error("[Image Upload] Error:", err);
    return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mapAuthor(authorSlug: string | undefined): { author_name: string; author_slug: string } {
  const slug = (authorSlug || "don-roneth").toLowerCase();
  if (slug === "don-roneth" || slug === "donroneth") {
    return { author_name: "Don Roneth", author_slug: "don-roneth" };
  }
  const name = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return { author_name: name, author_slug: slug };
}

function mapCategory(raw: string): string {
  const c = raw.toLowerCase().trim();
  const m: Record<string, string> = {
    bitcoin: "Bitcoin",
    ethereum: "Ethereum",
    defi: "DeFi",
    nfts: "NFTs",
    regulation: "Regulation",
    finance: "Finance",
    tech: "Technology",
  };
  return m[c] || raw.charAt(0).toUpperCase() + raw.slice(1);
}

/* ------------------------------------------------------------------ */
/*  POST handler                                                       */
/* ------------------------------------------------------------------ */

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-agent-secret");
  const expected = process.env.WEB3INSTANT_API_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: "Server misconfigured: missing Supabase URL or service role key" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();

    const {
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      sourceUrls,
      storyType,
      author,
      publishedAt,
    } = body as Record<string, unknown>;

    if (
      typeof title !== "string" ||
      typeof slug !== "string" ||
      typeof content !== "string" ||
      typeof category !== "string"
    ) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, content, category" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabaseAdmin
      .from("articles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: "Article with this slug already exists", slug },
        { status: 409 }
      );
    }

    const { author_name, author_slug } = mapAuthor(typeof author === "string" ? author : undefined);

    const parsedMd = marked.parse(content);
    const htmlContent =
      typeof content === "string" && /<[a-z][\s\S]*>/i.test(content)
        ? content
        : typeof parsedMd === "string"
          ? parsedMd
          : await parsedMd;

    const excerptStr = typeof excerpt === "string" ? excerpt : "";
    const tagsArr = Array.isArray(tags) ? (tags as string[]) : [];
    const tagsFiltered = tagsArr.filter((t): t is string => typeof t === "string");
    const sourceArr = Array.isArray(sourceUrls)
      ? (sourceUrls as string[]).filter((u): u is string => typeof u === "string")
      : [];

    /* ---------- AI cover image generation ---------- */
    let coverUrl = FALLBACK_COVER;
    try {
      console.log("[Agent Publish] Generating cover image...");
      const imgPrompt = await generateImagePrompt(title, content);
      console.log("[Agent Publish] Image prompt:", imgPrompt.slice(0, 120));
      const imgBuffer = await generateCoverImage(imgPrompt);
      if (imgBuffer) {
        const uploaded = await uploadToStorage(imgBuffer, slug);
        if (uploaded) {
          coverUrl = uploaded;
          console.log("[Agent Publish] Cover image uploaded:", coverUrl);
        }
      }
      if (coverUrl === FALLBACK_COVER) {
        console.log("[Agent Publish] Using fallback cover (no GEMINI_API_KEY or generation failed)");
      }
    } catch (imgErr) {
      console.error("[Agent Publish] Image generation error (using fallback):", imgErr);
    }

    const insertPayload: Record<string, unknown> = {
      title,
      slug,
      content: htmlContent,
      excerpt: excerptStr,
      summary: excerptStr,
      category: mapCategory(category),
      tags: tagsFiltered.length ? tagsFiltered : null,
      source_urls: sourceArr.length ? sourceArr : null,
      story_type: typeof storyType === "string" ? storyType : null,
      author_name,
      author_slug,
      author_id: null,
      cover_image: coverUrl,
      published: true,
      language: "en",
      is_ai_generated: true,
      agent_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (typeof publishedAt === "string" && publishedAt.length > 0) {
      insertPayload.created_at = publishedAt;
    }

    const { data, error } = await supabaseAdmin
      .from("articles")
      .insert(insertPayload)
      .select("id, slug")
      .single();

    if (error) throw error;

    const articleUrl = `https://web3instant.com/en/article/${data.slug}`;

    return NextResponse.json({
      success: true,
      articleId: data.id,
      articleUrl,
      slug: data.slug,
      coverImage: coverUrl,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[Agent Publish API] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
