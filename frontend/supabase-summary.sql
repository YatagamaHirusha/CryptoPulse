-- Add summary column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS summary TEXT;

-- Comment on column
COMMENT ON COLUMN articles.summary IS 'AI-generated summary of the article';
