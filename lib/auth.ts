import { getServerSupabase } from './supabase-server'
import bcrypt from 'bcryptjs'

// Admin password hashes
// To generate a new hash, run: node scripts/generate-hash.js <password>
const ADMIN_PASSWORDS: Record<string, string> = {
  'codnextech@gmail.com': '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', // Sam@2412
  // Add second admin here when you have the email and password
  // 'second-admin@example.com': 'paste-hash-here',
}

export async function verifyAdmin(email: string, password: string): Promise<boolean> {
  // First check if email is allowed in Supabase
  const isAllowed = await isAdminEmail(email)
  if (!isAllowed) {
    return false
  }

  // Get password hash for this email
  const passwordHash = ADMIN_PASSWORDS[email.toLowerCase()]
  if (!passwordHash) {
    return false
  }

  // Verify password
  return await bcrypt.compare(password, passwordHash)
}

export async function isAdminEmail(email: string): Promise<boolean> {
  // During build, API routes won't work, so just check local passwords
  const isBuildTime = 
    process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SUPABASE_URL)
  
  if (isBuildTime) {
    return email.toLowerCase() in ADMIN_PASSWORDS
  }

  try {
    const supabase = getServerSupabase()
    
    // Check in Supabase admin_emails table
    const { data, error } = await supabase
      .from('admin_emails')
      .select('email')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !data) {
      // Fallback: check if email has a password configured
      return email.toLowerCase() in ADMIN_PASSWORDS
    }

    return true
  } catch (error) {
    // If Supabase is not available (e.g., during build), fallback to local check
    return email.toLowerCase() in ADMIN_PASSWORDS
  }
}

