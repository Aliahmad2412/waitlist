import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// For server-side usage, we can optionally use the service role key for admin operations
// But for most cases, the anon key works fine with RLS policies
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if we're in a build environment
const isBuildTime = () => {
  return process.env.NEXT_PHASE === 'phase-production-build' || process.env.NODE_ENV === 'production'
}

export function getServerSupabase() {
  // During build, provide placeholder values to avoid errors
  if (isBuildTime() && (!supabaseUrl || !supabaseAnonKey)) {
    return createClient(
      'https://build-placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.build-placeholder-key',
      {
        auth: {
          persistSession: false,
        },
      }
    )
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.')
  }

  // Use service role key if available (bypasses RLS), otherwise use anon key
  const key = supabaseServiceRoleKey || supabaseAnonKey
  
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  })
}

