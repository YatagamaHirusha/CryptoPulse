-- Phase 2 Database Updates

-- 1. Support for Localization (Item 11)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS original_id UUID REFERENCES articles(id);

-- Index for faster filtering by language
CREATE INDEX IF NOT EXISTS idx_articles_language ON articles(language);

-- 2. Support for AI Quick Read (Item 14)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_summary TEXT;

-- 3. Support for Internal Linking (Item 12) - Tags
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array of strings for tags
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);
