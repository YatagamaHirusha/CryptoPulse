-- Create or update Crypto Ron author profile
-- Run this in Supabase SQL Editor

-- Update existing profile or insert with a specific ID that matches auth.users
-- Replace 'YOUR-USER-ID-HERE' with an actual user ID from auth.users table
-- Or run this query to check existing profiles: SELECT id, full_name, slug FROM profiles;

UPDATE profiles 
SET
  full_name = 'Ron Sterling',
  slug = 'ron-sterling',
  avatar_url = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ron&top=shortFlat&hairColor=d6b370&clothing=blazerAndShirt',
  bio = 'Ron is a seasoned crypto market analyst with over a decade of experience in financial markets and blockchain technology. He specializes in market cycle analysis and fundamental evaluation of digital assets.

Ron''s writing combines deep technical knowledge with practical market wisdom, helping investors navigate the volatile crypto landscape. He is known for his balanced perspective and ability to separate signal from noise.',
  role = 'Senior Crypto Analyst',
  email = 'ron@web3instant.com',
  twitter_url = 'https://x.com/ronsterling_crypto',
  linkedin_url = 'https://linkedin.com/in/rowneth'
WHERE slug = 'don-roneth' OR slug = 'crypto-ron' OR slug = 'ron-sterling' OR full_name = 'Don Roneth';
