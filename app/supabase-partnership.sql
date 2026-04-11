-- Create partnership_inquiries table
CREATE TABLE IF NOT EXISTS partnership_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  contact_role TEXT,
  company_size TEXT,
  website_url TEXT NOT NULL,
  twitter_username TEXT,
  telegram_username TEXT NOT NULL,
  media_interest TEXT[], -- Array of strings
  company_description TEXT NOT NULL,
  campaign_description TEXT NOT NULL,
  offerings_interested TEXT[], -- Array of strings
  budget TEXT NOT NULL,
  timeline TEXT NOT NULL,
  industry TEXT NOT NULL,
  status TEXT DEFAULT 'new', -- new, contacted, closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (submit form)
CREATE POLICY "Allow public to insert inquiries" ON partnership_inquiries
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admins) to view
CREATE POLICY "Allow admins to view inquiries" ON partnership_inquiries
  FOR SELECT USING (auth.role() = 'authenticated');
