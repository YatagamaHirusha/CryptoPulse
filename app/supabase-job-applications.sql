-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  linkedin TEXT,
  portfolio TEXT,
  resume_link TEXT NOT NULL,
  cover_letter TEXT,
  position_title TEXT NOT NULL,
  position_slug TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_position ON job_applications(position_slug);
CREATE INDEX idx_job_applications_created_at ON job_applications(created_at DESC);

-- Enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (apply for jobs)
CREATE POLICY "Anyone can submit job applications" ON job_applications
  FOR INSERT WITH CHECK (true);

-- Only authenticated users can read (admins)
CREATE POLICY "Authenticated users can read job applications" ON job_applications
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update status (admins)
CREATE POLICY "Authenticated users can update job applications" ON job_applications
  FOR UPDATE USING (auth.role() = 'authenticated');
