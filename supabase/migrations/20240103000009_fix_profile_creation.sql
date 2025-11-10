-- Fix profiles table to allow user creation
-- Make all columns nullable or have defaults

-- First, ensure preferred_language has a default and is nullable
ALTER TABLE profiles ALTER COLUMN preferred_language DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN preferred_language SET DEFAULT 'en';

-- Update any NULL values
UPDATE profiles SET preferred_language = 'en' WHERE preferred_language IS NULL;

-- Ensure other potentially problematic columns are nullable or have defaults
ALTER TABLE profiles ALTER COLUMN bio DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN avatar_url DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN phone_number DROP NOT NULL;

-- Create or replace the trigger function for new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, preferred_language, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'en',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
