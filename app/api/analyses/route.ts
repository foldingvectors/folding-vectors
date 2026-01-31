import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const supabase = await createServerClient()

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please sign in to view analyses' },
        { status: 401 }
      )
    }

    // Parse query params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Get analyses count
    const { count } = await supabase
      .from('analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', user.email)

    // Get analyses with pagination
    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('id, title, perspectives, created_at, status')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      throw error
    }

    return NextResponse.json({
      analyses,
      totalCount: count || 0,
      page,
      limit,
      hasMore: (count || 0) > offset + limit,
    })
  } catch (error: unknown) {
    console.error('Error fetching analyses:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analyses'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
