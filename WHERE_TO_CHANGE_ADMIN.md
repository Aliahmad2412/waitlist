# Where to Change Admin Credentials

## Adding the Second Admin

When you receive the second admin's email and password, you need to update **TWO places**:

### 1. Update Password Hash in Code

**File:** `lib/auth.ts`

**Location:** Around line 6-10, in the `ADMIN_PASSWORDS` object

**What to do:**
1. Generate the password hash:
   ```bash
   node scripts/generate-hash.js "the-password"
   ```
2. Copy the generated hash
3. Add a new line in `ADMIN_PASSWORDS`:
   ```typescript
   const ADMIN_PASSWORDS: Record<string, string> = {
     'codnextech@gmail.com': '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
     'second-admin@example.com': 'paste-generated-hash-here',  // <-- Add this line
   }
   ```

### 2. Add Email to Supabase Database

**Where:** Supabase SQL Editor or Dashboard

**What to do:**
1. Go to your Supabase project
2. Open SQL Editor
3. Run this SQL:
   ```sql
   INSERT INTO admin_emails (email) 
   VALUES ('second-admin@example.com')
   ON CONFLICT (email) DO NOTHING;
   ```

## Current Configuration

**First Admin (Already Set Up):**
- Email: `codnextech@gmail.com`
- Password: `Sam@2412`
- Hash: Already configured in `lib/auth.ts`
- Database: Should be added via SQL (see SUPABASE_SETUP.md)

**Second Admin (To Be Added):**
- Email: (You'll provide this)
- Password: (You'll provide this)
- Hash: Generate using the script above
- Database: Add via SQL when ready

## Quick Reference

- **Password hash location:** `lib/auth.ts` → `ADMIN_PASSWORDS` object
- **Email whitelist location:** Supabase `admin_emails` table
- **Hash generator script:** `scripts/generate-hash.js`

