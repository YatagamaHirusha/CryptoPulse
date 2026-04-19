-- Add scheduled_for column to articles
ALTER TABLE articles ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;

-- Create helper functions for roles
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'moderator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Public Read Policy to respect scheduled_for
DROP POLICY IF EXISTS "Allow public read access" ON articles;
CREATE POLICY "Allow public read access" ON articles
  FOR SELECT USING (published = true AND (scheduled_for IS NULL OR scheduled_for <= NOW()));

-- Update RLS for Articles
DROP POLICY IF EXISTS "Allow authenticated users to read all" ON articles;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON articles;
DROP POLICY IF EXISTS "Allow users to update own articles" ON articles;
DROP POLICY IF EXISTS "Allow users to delete own articles" ON articles;

-- Read: Team members can read all articles
CREATE POLICY "Allow team read" ON articles
  FOR SELECT TO authenticated USING (true);

-- Insert: Authenticated users (Authors, Mods, Admins) can insert
CREATE POLICY "Allow team insert" ON articles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Update: Superadmin/Mod can update all, Authors can update own
CREATE POLICY "Allow team update" ON articles
  FOR UPDATE TO authenticated USING (
    is_superadmin() OR 
    is_moderator() OR 
    auth.uid() = author_id
  );

-- Delete: Superadmin/Mod can delete all, Authors can delete own
CREATE POLICY "Allow team delete" ON articles
  FOR DELETE TO authenticated USING (
    is_superadmin() OR 
    is_moderator() OR 
    auth.uid() = author_id
  );

-- Profiles RLS
-- Allow Superadmin to update any profile (to set roles)
CREATE POLICY "Allow superadmin update profiles" ON profiles
  FOR UPDATE TO authenticated USING (is_superadmin());

-- Allow Superadmin to delete profiles
CREATE POLICY "Allow superadmin delete profiles" ON profiles
  FOR DELETE TO authenticated USING (is_superadmin());
