# Fixing Supabase 401/42501 Error

## Understanding the Error

### Error Code 401
A 401 error from Supabase typically means one of these issues:
1. **Missing or Invalid API Keys** - The Supabase URL or anon key is not set correctly
2. **Row Level Security (RLS) Policy Missing** - The database policy doesn't allow the operation
3. **Wrong Environment Variables** - Variables are not set in GitHub Pages secrets

### Error Code 42501: "new row violates row-level security policy"
This specific error means the INSERT policy is not working correctly. Common causes:
1. **Policy doesn't exist** - The policy was never created
2. **Policy is incorrect** - The policy syntax or role is wrong
3. **Policy conflict** - Multiple policies are conflicting
4. **Policy needs to include both roles** - Should allow both `anon` and `authenticated` roles

## Quick Fix for Error 42501

If you're getting **"new row violates row-level security policy"**, run this SQL script in Supabase SQL Editor:

**Use the file `fix-rls-policies.sql`** - It will drop and recreate all policies correctly.

Or manually run:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert on waitlist" ON waitlist;
DROP POLICY IF EXISTS "Allow public update on waitlist" ON waitlist;

-- Recreate INSERT policy (include both anon and authenticated)
CREATE POLICY "Allow public insert on waitlist"
  ON waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Recreate UPDATE policy (include both anon and authenticated)
CREATE POLICY "Allow public update on waitlist"
  ON waitlist
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
```

## Solution Steps

### Step 1: Fix RLS Policies in Supabase

The code uses `upsert` which requires both INSERT and UPDATE permissions. Run this SQL in your Supabase SQL Editor:

```sql
-- Policy: Allow anyone to update (needed for upsert operations)
CREATE POLICY "Allow public update on waitlist"
  ON waitlist
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
```

Or drop and recreate the policy if it already exists:

```sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public update on waitlist" ON waitlist;

-- Create the update policy
CREATE POLICY "Allow public update on waitlist"
  ON waitlist
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
```

### Step 2: Verify GitHub Pages Secrets

Make sure your GitHub repository has the correct secrets set:

1. Go to your repository: `https://github.com/Aliahmad2412/Anchored`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Verify these secrets exist:
   - `NEXT_PUBLIC_SUPABASE_URL` - Should be `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key (not the service role key!)

### Step 3: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use for `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

⚠️ **Important**: Use the **anon key**, NOT the service_role key!

### Step 4: Update GitHub Secrets

1. In GitHub, go to **Settings** → **Secrets and variables** → **Actions**
2. Update or create:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key-here`
3. Save the secrets

### Step 5: Rebuild and Deploy

After updating secrets, trigger a new deployment:

1. Push a commit to the `main` branch, OR
2. Go to **Actions** tab → **Deploy to GitHub Pages** → **Run workflow**

### Step 6: Verify RLS Policies

In Supabase SQL Editor, run this to check your policies:

```sql
-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'waitlist';
```

You should see:
- `Allow public insert on waitlist` (FOR INSERT)
- `Allow public update on waitlist` (FOR UPDATE) ← **This one is critical!**

## Testing Locally

To test if it works locally:

1. Create `.env.local` in your project root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Run `npm run dev`
3. Try submitting the form
4. Check browser console for errors

## Common Issues

### "Missing NEXT_PUBLIC_SUPABASE_URL"
- **Cause**: Environment variable not set
- **Fix**: Add it to GitHub Secrets or `.env.local`

### "permission denied for table waitlist"
- **Cause**: RLS policy missing or incorrect
- **Fix**: Add the UPDATE policy (see Step 1)

### "Invalid API key"
- **Cause**: Using wrong key (service_role instead of anon)
- **Fix**: Use the **anon/public** key from Supabase Settings → API

### Still getting 401 after fixes?
1. Check browser console for the full error message
2. Verify secrets are set correctly in GitHub
3. Make sure you triggered a new deployment after updating secrets
4. Check Supabase dashboard → **Authentication** → **Policies** to verify RLS is set up

## Quick Checklist

- [ ] UPDATE policy exists in Supabase (run SQL from Step 1)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` secret is set in GitHub
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` secret is set in GitHub
- [ ] Using the **anon key**, not service_role key
- [ ] Triggered a new deployment after updating secrets
- [ ] Checked browser console for detailed error messages

