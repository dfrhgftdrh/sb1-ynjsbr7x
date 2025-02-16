/*
  # Add Messages Table for Chat History

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `content` (text)
      - `user_id` (uuid, references profiles)
      - `is_response` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `messages` table
    - Add policies for user access
*/

-- Create messages table
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_response boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX messages_user_id_idx ON messages(user_id);
CREATE INDEX messages_created_at_idx ON messages(created_at);