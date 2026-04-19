import type { SupabaseClient } from "@supabase/supabase-js";

/** Minimal row shape for public `articles` selects (repo has no generated Database types). */
export type ArticleRow = {
  id: string;
  title: string;
  excerpt?: string | null;
  cover_image?: string | null;
  created_at: string;
  author_name?: string | null;
  author_avatar?: string | null;
  author_role?: string | null;
  category?: string | null;
  slug?: string | null;
  likes_count?: number | null;
  view_count: number | null | undefined;
};

/**
 * Public article lists filter by locale. English includes rows where `language` is NULL
 * (legacy imports / agent rows) so they still appear on /en.
 */
export function filterArticlesByLocale(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any,
  lang: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  if (lang === "en") {
    return query.or("language.eq.en,language.is.null");
  }
  return query.eq("language", lang);
}

type CountOpts = { count: "exact" | "planned" | "estimated"; head: boolean };

/** `articles` + `published=true` + locale filter (NULL language counts as English). */
export function publishedArticlesFrom(
  supabase: SupabaseClient,
  lang: string,
  select: string,
  countOpts?: CountOpts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const q = supabase.from("articles").select(select, countOpts).eq("published", true);
  return filterArticlesByLocale(q, lang);
}
