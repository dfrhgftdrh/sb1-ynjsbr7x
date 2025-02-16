/*
  # Initial Schema Setup for WallTones

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users id
      - `username` (text, unique)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      
    - `content_items`
      - `id` (uuid, primary key)
      - `title` (text)
      - `type` (text) - either 'wallpapers' or 'ringtones'
      - `url` (text)
      - `category` (text)
      - `user_id` (uuid) - references profiles
      - `created_at` (timestamp)
      - `downloads` (int)
      - `is_approved` (boolean)
      
    - `likes`
      - `content_id` (uuid) - references content_items
      - `user_id` (uuid) - references profiles
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create content_items table
CREATE TABLE content_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('wallpapers', 'ringtones')),
  url text NOT NULL,
  category text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  downloads int DEFAULT 0,
  is_approved boolean DEFAULT false
);

-- Create likes table
CREATE TABLE likes (
  content_id uuid REFERENCES content_items(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (content_id, user_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Content policies
CREATE POLICY "Content is viewable by everyone"
  ON content_items FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert content"
  ON content_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content"
  ON content_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own content"
  ON content_items FOR DELETE
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert likes"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);