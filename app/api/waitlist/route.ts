import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, gdprConsent } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !gdprConsent) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    const supabase = getServerSupabase()

    // Insert or update waitlist entry
    const { data, error } = await supabase
      .from('waitlist')
      .upsert(
        {
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          gdpr_consent: gdprConsent,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email',
        }
      )
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save to waitlist' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Waitlist submission error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process request' },
      { status: 500 }
    )
  }
}
