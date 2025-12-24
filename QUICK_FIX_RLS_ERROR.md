# Quick Fix: "new row violates row-level security policy" Error

## Problem
You're getting this error when submitting the waitlist form:
```
new row violates row-level security policy for table "waitlist"
```

This happens because the Row-Level Security (RLS) policies in Supabase are not configured correctly to allow inserts.

## Solution (5 minutes)

### Step 1: Open Supabase SQL Editor
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Run the Fix Script
1. Open the file `fix-rls-policies.sql` in your project
2. Copy the **entire contents** of that file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

### Step 3: Verify It Worked
After running the script, you should see a table showing the policies. You should see:
- `Allow public insert on waitlist` (INSERT command)
- `Allow public update on waitlist` (UPDATE command)
- `Allow service role read on waitlist` (SELECT command)

### Step 4: Test the Form
1. Go back to your application
2. Try submitting the waitlist form again
3. It should work now! ✅

## What the Fix Does

The script:
1. **Drops** any existing incorrect policies
2. **Creates** new policies that allow:
   - **INSERT** for anonymous users (so they can submit the form)
   - **UPDATE** for anonymous users (needed for upsert operations)
   - **SELECT** for service role (so you can view entries in the dashboard)

## Still Not Working?

If you still get errors after running the script:

1. **Check if RLS is enabled:**
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE tablename = 'waitlist';
   ```
   `rowsecurity` should be `true`

2. **Verify your policies:**
   ```sql
   SELECT policyname, roles, cmd 
   FROM pg_policies 
   WHERE tablename = 'waitlist';
   ```
   You should see policies for `anon` role with `INSERT` and `UPDATE` commands

3. **Check your environment variables:**
   - Make sure `NEXT_PUBLIC_SUPABASE_URL` is set correctly
   - Make sure `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly (use the **anon key**, not service_role key)

4. **Clear browser cache** and try again

## Need More Help?

If the error persists, check:
- Browser console for the full error message
- Supabase dashboard → Authentication → Policies to see if policies are visible there
- Make sure you're using the correct Supabase project (check the URL matches your environment variables)

