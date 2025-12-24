# Admin Panel Setup Guide

## Current Admin Credentials

**Email 1:**
- Email: `codnextech@gmail.com`
- Password: `Sam@2412`

**Email 2:**
- Email: (To be provided)
- Password: (To be provided)

## Adding the Second Admin

When you have the second admin's email and password:

### Step 1: Generate Password Hash

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Generate the password hash:
   ```bash
   node scripts/generate-hash.js "your-password-here"
   ```

3. Copy the generated hash.

### Step 2: Update the Code

1. Open `lib/auth.ts`
2. Find the `ADMIN_PASSWORDS` object
3. Add the new admin:
   ```typescript
   const ADMIN_PASSWORDS: Record<string, string> = {
     'codnextech@gmail.com': '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'second-admin@example.com': 'paste-generated-hash-here',
   }
   ```

### Step 3: Add Email to Supabase

1. Go to your Supabase SQL Editor
2. Run:
   ```sql
   INSERT INTO admin_emails (email) 
   VALUES ('second-admin@example.com')
   ON CONFLICT (email) DO NOTHING;
   ```

## Accessing the Admin Panel

1. Navigate to `/admin/login`
2. Sign in with one of the allowed admin emails
3. After successful login, you'll be redirected to `/admin` where you can view all waitlist entries

## Security Notes

- Only emails in the `admin_emails` Supabase table can log in
- Passwords are hashed using bcrypt
- Session cookies are httpOnly and secure in production
- Admin panel is protected by authentication middleware

