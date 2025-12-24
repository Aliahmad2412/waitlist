import { NextRequest, NextResponse } from 'next/server'
import { verifyAdmin, isAdminEmail } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if email is allowed
    const isAllowed = await isAdminEmail(email)
    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyAdmin(email, password)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Create session token (simple approach - in production use JWT or Supabase sessions)
    const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64')
    
    // Set cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to process login' },
      { status: 500 }
    )
  }
}

