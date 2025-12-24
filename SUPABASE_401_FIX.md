# Fixing Supabase 401 Error

## Understanding the 401 Error

A 401 error from Supabase typically means one of these issues:

1. **Missing or Invalid API Keys** - The Supabase URL or anon key is not set correctly
2. **Row Level Security (RLS) Policy Missing** - The database policy doesn't allow the operation
3. **Wrong Environment Variables** - Variables are not set in GitHub Pages secrets

## Solution Steps

### Step 1: Add UPDATE Policy to Supabase

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

