a-- Create contact_submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public insert
CREATE POLICY "Allow public insert contact" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admins) to read
CREATE POLICY "Allow authenticated read contact" ON contact_submissions
  FOR SELECT TO authenticated USING (true);
