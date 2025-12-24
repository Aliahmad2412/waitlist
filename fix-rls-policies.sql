-- Fix RLS Policies for Waitlist Table
-- Run this in Supabase SQL Editor to fix the 42501 error
-- This script drops existing policies and recreates them correctly

-- ============================================
-- Step 1: Drop existing policies (if they exist)
-- ============================================
DROP POLICY IF EXISTS "Allow public insert on waitlist" ON waitlist;
DROP POLICY IF EXISTS "Allow public update on waitlist" ON waitlist;
DROP POLICY IF EXISTS "Allow public select on waitlist" ON waitlist;
DROP POLICY IF EXISTS "Allow service role read on waitlist" ON waitlist;
DROP POLICY IF EXISTS "Allow admin read on waitlist" ON waitlist;

-- ============================================
-- Step 2: Recreate policies with correct permissions
-- ============================================

-- Policy: Allow anonymous users to INSERT (for public waitlist form)
-- This is the critical one that was failing
CREATE POLICY "Allow public insert on waitlist"
  ON waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Allow anonymous users to UPDATE (needed for upsert operations)
CREATE POLICY "Allow public update on waitlist"
  ON waitlist
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow anonymous users to SELECT (needed for upsert conflict checking)
-- This allows checking if an email already exists
CREATE POLICY "Allow public select on waitlist"
  ON waitlist
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: Allow service role to read (for admin dashboard)
CREATE POLICY "Allow service role read on waitlist"
  ON waitlist
  FOR SELECT
  TO service_role
  USING (true);

-- ============================================
-- Step 3: Verify policies were created
-- ============================================
SELECT 
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'waitlist'
ORDER BY policyname;

-- ============================================
-- Step 4: Test the policies (optional)
-- ============================================
-- You can test if the policies work by running this as the anon role:
-- (This is just for verification, you don't need to run it)
-- 
-- SET ROLE anon;
-- INSERT INTO waitlist (email, first_name, last_name, gdpr_consent)
-- VALUES ('test@example.com', 'Test', 'User', true);
-- RESET ROLE;

