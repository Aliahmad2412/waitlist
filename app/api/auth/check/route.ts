import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/auth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const session = cookieStore.get('admin_session')

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Decode session to get email
    const decoded = Buffer.from(session.value, 'base64').toString('utf-8')
    const email = decoded.split(':')[0]

    // Verify email is still allowed
    const isAllowed = await isAdminEmail(email)
    if (!isAllowed) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true, email })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}

