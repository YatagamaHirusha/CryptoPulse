-- Drop existing policies if they exist (do this first, before tables)
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Allow public read access" ON articles;
  DROP POLICY IF EXISTS "Allow authenticated users to read all" ON articles;
  DROP POLICY IF EXISTS "Allow authenticated users to insert" ON articles;
  DROP POLICY IF EXISTS "Allow users to update own articles" ON articles;
  DROP POLICY IF EXISTS "Allow users to delete own articles" ON articles;
  DROP POLICY IF EXISTS "Allow public read categories" ON categories;
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  author_name TEXT,
  author_avatar TEXT,
  published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if table already existed (fixes "column does not exist" error)
ALTER TABLE articles ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES auth.users(id);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_avatar TEXT;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug) VALUES
  ('Business', 'business'),
  ('Finance', 'finance'),
  ('Technology', 'technology'),
  ('Politics', 'politics'),
  ('Health', 'health'),
  ('Environment', 'environment'),
  ('Culture', 'culture'),
  ('Sports', 'sports')
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security (after tables are created)
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON articles
  FOR SELECT USING (published = true);

-- Allow authenticated users to read all articles
CREATE POLICY "Allow authenticated users to read all" ON articles
  FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert their own articles
CREATE POLICY "Allow authenticated users to insert" ON articles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Allow users to update their own articles
CREATE POLICY "Allow users to update own articles" ON articles
  FOR UPDATE TO authenticated USING (auth.uid() = author_id);

-- Allow users to delete their own articles
CREATE POLICY "Allow users to delete own articles" ON articles
  FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Allow everyone to read categories
CREATE POLICY "Allow public read categories" ON categories
  FOR SELECT USING (true);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  email TEXT,
  role TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure columns exist if table already existed
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS slug TEXT;

-- Safely add unique constraint for slug if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_slug_key') THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to profiles
CREATE POLICY "Allow public read profiles" ON profiles
  FOR SELECT USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Allow users to insert own profile" ON profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Create storage bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete own uploads" ON storage.objects;

-- Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'article-images');

-- Allow public access to images
CREATE POLICY "Allow public access to images" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-images');

-- Allow users to update their own uploads
CREATE POLICY "Allow users to update own uploads" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'article-images');

-- Allow users to delete their own uploads
CREATE POLICY "Allow users to delete own uploads" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'article-images');

-- Function to increment view count safely
CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$;

-- Add original_url to articles for deduplication
ALTER TABLE articles ADD COLUMN IF NOT EXISTS original_url TEXT UNIQUE;
