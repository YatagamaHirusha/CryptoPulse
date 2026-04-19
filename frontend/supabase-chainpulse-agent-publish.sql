-- =============================================================================
-- ChainPulse / Agent publish — NEW Supabase project setup
--
-- 1) Create a new project at https://supabase.com (separate from your friend’s DB).
-- 2) In SQL Editor, run in this order (paths relative to this repo’s app/ folder):
--      a) supabase-schema.sql
--      b) supabase-summary.sql
--      c) supabase-phase2.sql
--      d) supabase-chainpulse-agent-publish.sql  (this file)
-- 3) Settings → API: copy Project URL → NEXT_PUBLIC_SUPABASE_URL (and optional SUPABASE_URL).
--    Copy anon → NEXT_PUBLIC_SUPABASE_ANON_KEY; copy service_role → SUPABASE_SERVICE_ROLE_KEY.
-- 4) Add WEB3INSTANT_API_SECRET (same value as the agent’s WEB3INSTANT_API_SECRET) to .env.local.
-- 5) The Next.js route POST /api/agent/publish uses the service role key (server-only) so it
--    bypasses RLS; do not expose the service key to the browser.
-- =============================================================================

-- Agent & source metadata (articles table)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS source_urls TEXT[];
ALTER TABLE articles ADD COLUMN IF NOT EXISTS story_type TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS agent_published BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_slug TEXT;

COMMENT ON COLUMN articles.source_urls IS 'URLs cited by the ChainPulse agent article';
COMMENT ON COLUMN articles.story_type IS 'breaking | analysis | whale_alert | protocol_surge | investigation';
COMMENT ON COLUMN articles.is_ai_generated IS 'True when body was produced by LLM';
COMMENT ON COLUMN articles.agent_published IS 'True when inserted via /api/agent/publish';
COMMENT ON COLUMN articles.author_slug IS 'Stable author key e.g. don-roneth';

-- Fix increment_view_count (missing SET in legacy schema)
CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$;
