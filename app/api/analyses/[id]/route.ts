import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient()
  const { id } = await params

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please sign in to view analysis' },
        { status: 401 }
      )
    }

    // Get analysis
    const { data: analysis, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .eq('user_email', user.email)
      .single()

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ analysis })
  } catch (error: unknown) {
    console.error('Error fetching analysis:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analysis'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerClient()
  const { id } = await params

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please sign in to delete analysis' },
        { status: 401 }
      )
    }

    // Verify ownership and delete
    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('id', id)
      .eq('user_email', user.email)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error deleting analysis:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete analysis'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
