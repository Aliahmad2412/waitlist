import { createServerClient } from './supabase'

// Server-side Supabase client for API routes
export const getServerSupabase = () => {
  return createServerClient()
}

