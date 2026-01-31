import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

// Get public analysis by share token (no auth required)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const supabase = await createServerClient()
  const { token } = await params

  try {
    // Get analysis by share token
    const { data: analysis, error } = await supabase
      .from('analyses')
      .select('id, title, document_text, perspectives, results, created_at')
      .eq('share_token', token)
      .single()

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found or not shared' },
        { status: 404 }
      )
    }

    return NextResponse.json({ analysis })
  } catch (error: unknown) {
    console.error('Error fetching shared analysis:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analysis'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
