/*
  # Add role column and set admin user
  
  1. Changes
    - Add role column to profiles table
    - Set default role as 'user'
    - Update specific user to admin role
  
  2. Security
    - Only admins can update roles
*/

-- Add role column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles ADD COLUMN role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Update specific user to admin
DO $$ 
BEGIN
  UPDATE profiles
  SET role = 'admin'
  FROM auth.users
  WHERE 
    auth.users.email = 'subashismahato@gmail.com' 
    AND profiles.id = auth.users.id;
END $$;

-- Add RLS policy for role updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Enable role updates for admins'
  ) THEN
    CREATE POLICY "Enable role updates for admins"
      ON profiles
      FOR UPDATE
      USING (auth.jwt() ->> 'role' = 'admin')
      WITH CHECK (auth.jwt() ->> 'role' = 'admin');
  END IF;
END $$;