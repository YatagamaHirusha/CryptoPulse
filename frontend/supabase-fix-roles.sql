-- Add system_role column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS system_role TEXT DEFAULT 'author';

-- Update existing profiles to have 'author' system_role by default
UPDATE profiles SET system_role = 'author' WHERE system_role IS NULL;

-- Restore the display role for the superadmin (optional, user can do it in UI)
-- But we need to make sure the superadmin has the correct system_role
UPDATE profiles 
SET system_role = 'superadmin' 
WHERE email = 'wadroneth@gmail.com';

-- Update helper functions to use system_role
CREATE OR REPLACE FUNCTION is_superadmin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND system_role = 'superadmin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND system_role = 'moderator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to use the new functions (they already use the functions, so just updating functions is enough)
-- But we need to make sure the policies are still valid.
-- The policies call is_superadmin() and is_moderator(), which we just updated.

-- Update the profiles RLS to allow superadmin to update system_role
-- (The previous policy "Allow superadmin update profiles" uses is_superadmin(), so it should still work)
