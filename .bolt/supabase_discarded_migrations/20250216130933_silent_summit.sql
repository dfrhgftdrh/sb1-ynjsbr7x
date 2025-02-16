/*
  # Add Token Refund System

  1. New Tables
    - refund_requests
      - id (uuid, primary key)
      - user_id (uuid, references profiles)
      - content_id (uuid, references content_items)
      - reason (text)
      - status (text: pending, approved, rejected)
      - created_at (timestamptz)
      - updated_at (timestamptz)

  2. Security
    - Enable RLS on refund_requests table
    - Add policies for users to create and view their refunds
    - Add policies for admins to manage refunds
*/

-- Create refund_requests table
CREATE TABLE refund_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content_id uuid REFERENCES content_items(id) ON DELETE CASCADE NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own refund requests"
  ON refund_requests
  FOR SELECT
  USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

CREATE POLICY "Users can create refund requests"
  ON refund_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update refund requests"
  ON refund_requests
  FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  ));

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_refund_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_refund_requests_timestamp
  BEFORE UPDATE ON refund_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_refund_requests_updated_at();

-- Create function to handle refund approval
CREATE OR REPLACE FUNCTION handle_refund_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Decrement download count when refund is approved
    UPDATE content_items
    SET downloads = downloads - 1
    WHERE id = NEW.content_id
    AND downloads > 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_refund_approval_trigger
  AFTER UPDATE ON refund_requests
  FOR EACH ROW
  WHEN (NEW.status = 'approved' AND OLD.status = 'pending')
  EXECUTE FUNCTION handle_refund_approval();