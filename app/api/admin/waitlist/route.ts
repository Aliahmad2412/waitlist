import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/middleware'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const auth = await requireAuth(request)
    if (auth instanceof NextResponse) {
      return auth // Redirect response
    }

    const supabase = getServerSupabase()

    // Fetch all waitlist entries
    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch waitlist' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Waitlist fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

