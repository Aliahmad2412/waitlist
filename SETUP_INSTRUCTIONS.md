# Supabase Setup Instructions

Follow these steps to set up Supabase for your book author waitlist application.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in:
   - **Name**: `book-author` (or your preferred name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is fine for development
4. Click "Create new project"
5. Wait 2-3 minutes for the project to be created

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon public key**: Copy this (starts with `eyJ...`)
   - **service_role key**: Copy this (starts with `eyJ...`) - **KEEP THIS SECRET!**

## Step 3: Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click "Run" (or press Ctrl+Enter)
5. You should see "Success. No rows returned"

## Step 4: Create Environment File

1. In your project root, create a file named `.env.local`
2. Copy the contents from `env.example` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. Replace the placeholder values with your actual keys from Step 2

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000`
3. Try submitting the waitlist form
4. Check in Supabase dashboard → **Table Editor** → **waitlist** to see if the entry was created

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `.env.local` exists in the project root
- Make sure the variable names match exactly (no typos)
- Restart your dev server after creating/updating `.env.local`

### "Failed to save to waitlist"
- Check that you ran the SQL setup script
- Verify RLS policies are created correctly
- Check Supabase dashboard → **Table Editor** to see if the `waitlist` table exists

### Database connection issues
- Verify your Project URL is correct
- Check that your project is not paused (free tier projects pause after inactivity)
- Make sure you're using the correct keys (anon key for client, service role for server)

## Next Steps

Once setup is complete:
- The waitlist form will save entries to Supabase
- You can view entries in Supabase dashboard → **Table Editor** → **waitlist**
- To add admin functionality later, you can restore the admin pages

## Security Notes

- ⚠️ **Never commit `.env.local` to git** - it's already in `.gitignore`
- ⚠️ **Never share your service_role key** - it has full database access
- ✅ The anon key is safe to use in client-side code
- ✅ Row Level Security (RLS) protects your data

