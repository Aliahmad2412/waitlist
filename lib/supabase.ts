import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if we're in a build environment
const isBuildTime = () => {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.NODE_ENV === 'production' && !supabaseUrl ||
    typeof window === 'undefined' && !supabaseUrl
  )
}

// Only throw error at runtime, not during build
// During static export build, provide placeholder values
const getSupabaseUrl = () => {
  if (!supabaseUrl) {
    if (isBuildTime()) {
      // Use a valid URL format that Supabase client will accept
      return 'https://build-placeholder.supabase.co'
    }
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  // Validate URL format
  try {
    new URL(supabaseUrl)
    return supabaseUrl
  } catch {
    if (isBuildTime()) {
      return 'https://build-placeholder.supabase.co'
    }
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL: Must be a valid HTTP or HTTPS URL')
  }
}

const getSupabaseAnonKey = () => {
  if (!supabaseAnonKey) {
    if (isBuildTime()) {
      // Return a placeholder key that looks valid (starts with eyJ like JWT tokens)
      return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.build-placeholder-key'
    }
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return supabaseAnonKey
}

// Lazy initialization to avoid errors during build
let _supabaseClient: ReturnType<typeof createClient> | null = null

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!_supabaseClient) {
      _supabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey())
    }
    return (_supabaseClient as any)[prop]
  }
})

// Server-side Supabase client (uses service role key for admin operations)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  // During build time, return a placeholder client that will fail gracefully
  if (isBuildTime()) {
    return createClient(
      getSupabaseUrl(),
      serviceRoleKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.build-placeholder-service-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  }

  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

