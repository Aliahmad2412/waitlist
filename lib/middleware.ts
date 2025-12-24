import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { isAdminEmail } from './auth'

export async function requireAuth(request: NextRequest): Promise<{ email: string; authenticated: true } | NextResponse> {
  const cookieStore = cookies()
  const session = cookieStore.get('admin_session')

  if (!session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  try {
    // Decode session to get email
    const decoded = Buffer.from(session.value, 'base64').toString('utf-8')
    const email = decoded.split(':')[0]

    // Verify email is still allowed
    const isAllowed = await isAdminEmail(email)
    if (!isAllowed) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return { email, authenticated: true }
  } catch (error) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

