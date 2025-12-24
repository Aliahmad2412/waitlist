# Quick Start Guide

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up Supabase

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL from `SUPABASE_SETUP.md` to create tables
3. Get your API keys from Settings → API

## 3. Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 4. Generate Password Hash for First Admin

The first admin is already configured:
- Email: `codnextech@gmail.com`
- Password: `Sam@2412`

To verify or generate a new hash:
```bash
node scripts/generate-hash.js "Sam@2412"
```

## 5. Add Second Admin (When Ready)

1. Generate password hash:
   ```bash
   node scripts/generate-hash.js "second-admin-password"
   ```

2. Update `lib/auth.ts`:
   ```typescript
   const ADMIN_PASSWORDS: Record<string, string> = {
     'codnextech@gmail.com': '$2a$10$...',
     'second-admin@example.com': 'paste-hash-here',
   }
   ```

3. Add email to Supabase:
   ```sql
   INSERT INTO admin_emails (email) 
   VALUES ('second-admin@example.com');
   ```

## 6. Run Development Server

```bash
npm run dev
```

## 7. Access Pages

- Waitlist: http://localhost:3000/anchored
- Admin Login: http://localhost:3000/admin/login
- Admin Panel: http://localhost:3000/admin (after login)

## Current Admin Credentials

- **Email:** codnextech@gmail.com
- **Password:** Sam@2412

