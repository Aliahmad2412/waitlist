import { createClient } from '@supabase/supabase-js'

// Support both Next.js (process.env) and Vite (import.meta.env) environment variables
// In Vite, import.meta.env.VITE_* variables are available at runtime in the browser
// In Next.js, process.env.NEXT_PUBLIC_* variables are available
const getEnvVar = (viteKey: string, nextKey: string): string | undefined => {
  // In browser runtime, check for Vite's import.meta.env
  if (typeof window !== 'undefined') {
    try {
      // @ts-ignore - import.meta exists in Vite but not in Next.js
      const viteValue = import.meta?.env?.[viteKey]
      if (viteValue) {
        return viteValue
      }
    } catch {
      // import.meta not available (Next.js environment)
    }
  }
  // Fall back to process.env (Next.js or Node.js)
  return process.env[nextKey] || process.env[viteKey]
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY')

// Check if we're in a build environment
const isBuildTime = () => {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.env.NODE_ENV === 'production' && !supabaseUrl && typeof window === 'undefined')
  )
}

// Check if URL is a placeholder
const isPlaceholderUrl = (url: string) => {
  return url.includes('build-placeholder') || url.includes('placeholder')
}

// Only throw error at runtime, not during build
// During static export build, provide placeholder values
const getSupabaseUrl = () => {
  if (!supabaseUrl || isPlaceholderUrl(supabaseUrl)) {
    if (isBuildTime() || (typeof window !== 'undefined' && isPlaceholderUrl(supabaseUrl || ''))) {
      // Use a valid URL format that Supabase client will accept
      return 'https://build-placeholder.supabase.co'
    }
    if (typeof window !== 'undefined') {
      // In browser, if no valid URL, return placeholder to avoid errors
      console.warn('NEXT_PUBLIC_SUPABASE_URL is not set. Form submission will not work.')
      return 'https://build-placeholder.supabase.co'
    }
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
  }
  // Validate URL format
  try {
    new URL(supabaseUrl)
    return supabaseUrl
  } catch {
    if (isBuildTime() || typeof window !== 'undefined') {
      console.warn('Invalid NEXT_PUBLIC_SUPABASE_URL. Using placeholder.')
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
let _supabaseUrl: string | null = null

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const url = getSupabaseUrl()
  _supabaseUrl = url
  return !url.includes('build-placeholder') && !url.includes('placeholder') && url.includes('.supabase.co')
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    if (!_supabaseClient) {
      _supabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey())
    }
    return (_supabaseClient as any)[prop]
  }
})


