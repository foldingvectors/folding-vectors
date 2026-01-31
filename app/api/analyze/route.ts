import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { getPerspectiveById } from '@/lib/perspectives'

// Load API key from .env file as fallback for Turbopack issue
function loadApiKey(): string {
  // First try environment variable
  if (process.env.ANTHROPIC_API_KEY) {
    return process.env.ANTHROPIC_API_KEY
  }

  // Fallback: read from .env file directly (Turbopack workaround)
  try {
    const envPath = join(process.cwd(), '.env')
    const envContent = readFileSync(envPath, 'utf-8')
    const match = envContent.match(/ANTHROPIC_API_KEY=(.+)/)
    if (match && match[1]) {
      return match[1].trim()
    }
  } catch {
    // .env file not found or not readable
  }

  throw new Error('ANTHROPIC_API_KEY environment variable is not set')
}

let _anthropic: Anthropic | null = null
function getAnthropic() {
  if (!_anthropic) {
    const apiKey = loadApiKey()
    _anthropic = new Anthropic({
      apiKey: apiKey,
    })
  }
  return _anthropic
}

// Admin emails with unlimited access
const UNLIMITED_EMAILS = [
  'hello@foldingvectors.com',
  'adrien.lafeuille@gmail.com',
]
const DAILY_LIMIT = 10

// Check if daily usage should be reset
function shouldResetDailyUsage(lastResetDate: string | null): boolean {
  if (!lastResetDate) return true

  const now = new Date()
  const lastReset = new Date(lastResetDate)

  // Reset if it's a new day (comparing dates only, not times)
  return now.toDateString() !== lastReset.toDateString()
}

export async function POST(request: Request) {
  const supabase = await createServerClient()

  try {
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please sign in to analyze documents' },
        { status: 401 }
      )
    }

    // Check if user has unlimited access
    const isUnlimited = UNLIMITED_EMAILS.includes(user.email || '')

    // Get user profile with usage info
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    let currentProfile = profile

    if (profileError || !profile) {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          analyses_count: 0,
          analyses_limit: DAILY_LIMIT,
          last_reset_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return NextResponse.json(
          { error: 'Error setting up account' },
          { status: 500 }
        )
      }

      currentProfile = newProfile
    }

    // Check for daily reset
    if (currentProfile && shouldResetDailyUsage(currentProfile.last_reset_date)) {
      const { error: resetError } = await supabase
        .from('profiles')
        .update({
          analyses_count: 0,
          last_reset_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (!resetError) {
        currentProfile = { ...currentProfile, analyses_count: 0 }
      }
    }

    // Ensure we have a valid profile
    if (!currentProfile) {
      return NextResponse.json(
        { error: 'Error loading profile' },
        { status: 500 }
      )
    }

    // Check if user has analyses remaining (skip for unlimited user)
    if (!isUnlimited && currentProfile.analyses_count >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: 'limit_reached',
          message: `You've used all ${DAILY_LIMIT} analyses for today. Your limit resets at midnight.`,
          analyses_count: currentProfile.analyses_count,
          analyses_limit: DAILY_LIMIT,
        },
        { status: 403 }
      )
    }

    const { text, perspectives = ['investor'] } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document text is required' },
        { status: 400 }
      )
    }

    if (!perspectives || perspectives.length === 0) {
      return NextResponse.json(
        { error: 'At least one perspective is required' },
        { status: 400 }
      )
    }

    // Validate all perspectives exist
    for (const perspectiveId of perspectives) {
      const perspective = getPerspectiveById(perspectiveId)
      if (!perspective) {
        return NextResponse.json(
          { error: `Unknown perspective: ${perspectiveId}` },
          { status: 400 }
        )
      }
    }

    // Run all selected perspectives in parallel
    const analysisPromises = perspectives.map(async (perspectiveId: string) => {
      const perspective = getPerspectiveById(perspectiveId)
      if (!perspective) {
        throw new Error(`Unknown perspective: ${perspectiveId}`)
      }

      const fullPrompt = `${perspective.prompt}

Document to analyze:
${text}`

      const message = await getAnthropic().messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: fullPrompt
        }]
      })

      const result = message.content[0].type === 'text'
        ? message.content[0].text
        : 'Error processing response'

      return { perspective: perspectiveId, result }
    })

    // Wait for all analyses to complete
    const analyses = await Promise.all(analysisPromises)

    // Format results as an object
    const results = analyses.reduce((acc, { perspective, result }) => {
      acc[perspective] = result
      return acc
    }, {} as Record<string, string>)

    // Save to database
    const { data: analysis, error: insertError } = await supabase
      .from('analyses')
      .insert({
        user_email: user.email,
        user_id: user.id,
        title: text.substring(0, 50) + '...',
        document_text: text,
        perspectives: perspectives,
        results: results,
        status: 'completed'
      })
      .select()
      .single()

    if (insertError) {
      console.error('Supabase insert error:', insertError)
    }

    // Increment user's analysis count (skip for unlimited user)
    if (!isUnlimited) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          analyses_count: currentProfile.analyses_count + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating count:', updateError)
      }
    }

    return NextResponse.json({
      results,
      analysisId: analysis?.id,
      analyses_remaining: isUnlimited ? 999999 : DAILY_LIMIT - (currentProfile.analyses_count + 1),
    })

  } catch (error: unknown) {
    console.error('Analysis error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
