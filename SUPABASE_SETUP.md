# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings → API

## Step 2: Set Up Database Tables

Run these SQL commands in the Supabase SQL Editor:

### Waitlist Table

```sql
-- Create waitlist table
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

-- Policy: Only authenticated admins can read
CREATE POLICY "Allow admin read on waitlist"
  ON waitlist
  FOR SELECT
  TO authenticated
  USING (true);
```

### Admin Emails Table

```sql
-- Create admin_emails table
CREATE TABLE IF NOT EXISTS admin_emails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the first admin email
INSERT INTO admin_emails (email) 
VALUES ('codnextech@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can read/write (for security)
-- This table should only be accessed server-side
```

## Step 3: Get Service Role Key

1. In Supabase Dashboard, go to Settings → API
2. Copy the `service_role` key (keep this secret!)
3. This is needed for server-side operations

## Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Step 5: Add Second Admin Email

To add the second admin email later:

1. Go to Supabase SQL Editor
2. Run:
```sql
INSERT INTO admin_emails (email) 
VALUES ('second-admin@example.com')
ON CONFLICT (email) DO NOTHING;
```

3. Update the password hash in `lib/auth.ts`:
   - Generate a hash for the new password using bcrypt
   - Update the `ADMIN_EMAILS` array with the new email and hash

## Step 6: Generate Password Hash

To generate a password hash for the second admin:

```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('your-password', 10);
console.log(hash);
```

Then update `lib/auth.ts` with the new hash.

## Security Notes

- The service role key has full access to your database - keep it secret!
- Admin emails are stored in Supabase for easy management
- Passwords are hashed using bcrypt
- Only emails in the `admin_emails` table can log in

