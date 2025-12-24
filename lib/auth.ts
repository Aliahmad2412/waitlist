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
}

