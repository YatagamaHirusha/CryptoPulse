-- Add author_role column to articles table
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_role TEXT;

-- Backfill existing articles with the current role of their authors
UPDATE articles 
SET author_role = profiles.role 
FROM profiles 
WHERE articles.author_id = profiles.id;
