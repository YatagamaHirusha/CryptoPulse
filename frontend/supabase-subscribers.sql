-- Create subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for subscription form)
CREATE POLICY "Allow public insert" ON subscribers
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admins) to read subscribers
CREATE POLICY "Allow authenticated read" ON subscribers
  FOR SELECT TO authenticated USING (true);
