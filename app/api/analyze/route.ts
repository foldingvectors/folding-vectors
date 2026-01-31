import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Investor perspective prompt
const INVESTOR_PROMPT = `You are an experienced institutional investor analyzing a potential investment.

Analyze the following document and provide a structured analysis in JSON format:

{
  "summary": "2-3 sentence investment thesis",
  "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "questions": ["critical question 1", "critical question 2", "critical question 3"],
  "recommendation": "Pass / More diligence needed / Proceed with caution / Strong opportunity"
}

Be direct, skeptical, and focus on what matters for investment returns.

Document to analyze:
`

export async function POST(request: Request) {
  try {
    const { text, email } = await request.json()

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Document text is required' },
        { status: 400 }
      )
    }

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: INVESTOR_PROMPT + text
      }]
    })

    // Extract text response
    const result = message.content[0].type === 'text' 
      ? message.content[0].text 
      : 'Error processing response'

    // Save to Supabase
    const { data: analysis, error } = await supabase
      .from('analyses')
      .insert({
        user_email: email || 'anonymous',
        title: text.substring(0, 50) + '...',
        document_text: text,
        perspectives: ['investor'],
        results: { investor: result },
        status: 'completed'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
    }

    return NextResponse.json({ 
      result,
      analysisId: analysis?.id 
    })

  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Analysis failed' },
      { status: 500 }
    )
  }
}