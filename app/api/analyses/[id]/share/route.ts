import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { randomBytes } from 'crypto'

// Generate a share token for an analysis
export async function POST(
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
        { error: 'Please sign in to share analysis' },
        { status: 401 }
      )
    }

    // Generate a unique share token
    const shareToken = randomBytes(16).toString('hex')

    // Verify ownership and update with share token
    const { data: analysis, error } = await supabase
      .from('analyses')
      .update({ share_token: shareToken })
      .eq('id', id)
      .eq('user_email', user.email)
      .select('id, share_token')
      .single()

    if (error) {
      throw error
    }

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      shareToken: analysis.share_token,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://foldingvectors.com'}/share/${analysis.share_token}`
    })
  } catch (error: unknown) {
    console.error('Error creating share link:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create share link'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Get share status for an analysis
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
        { error: 'Please sign in' },
        { status: 401 }
      )
    }

    // Get analysis share token
    const { data: analysis, error } = await supabase
      .from('analyses')
      .select('id, share_token')
      .eq('id', id)
      .eq('user_email', user.email)
      .single()

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    if (!analysis.share_token) {
      return NextResponse.json({ shared: false })
    }

    return NextResponse.json({
      shared: true,
      shareToken: analysis.share_token,
      shareUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://foldingvectors.com'}/share/${analysis.share_token}`
    })
  } catch (error: unknown) {
    console.error('Error getting share status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to get share status'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Remove share token (make private)
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
        { error: 'Please sign in' },
        { status: 401 }
      )
    }

    // Remove share token
    const { error } = await supabase
      .from('analyses')
      .update({ share_token: null })
      .eq('id', id)
      .eq('user_email', user.email)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error removing share link:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove share link'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
