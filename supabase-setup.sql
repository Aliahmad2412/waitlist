-- Supabase Database Setup Script
-- Run this in the Supabase SQL Editor
-- This creates the waitlist table to store form submissions from the anchored page

-- ============================================
-- Create Waitlist Table
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gdpr_consent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Enable Row Level Security (RLS)
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for the waitlist form)
CREATE POLICY "Allow public insert on waitlist"
  ON waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow service role to read (for viewing entries in Supabase dashboard)
-- This allows you to view entries using the service role key
CREATE POLICY "Allow service role read on waitlist"
  ON waitlist
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================
-- Verify Table
-- ============================================
-- Check if table was created successfully
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'waitlist';

