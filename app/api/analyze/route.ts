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

const LEGAL_PROMPT = `You are a senior corporate attorney reviewing this document for legal risks and compliance issues.

Analyze the following document and provide a structured analysis in JSON format:

{
  "summary": "2-3 sentence legal assessment",
  "risks": ["legal risk 1", "legal risk 2", "legal risk 3"],
  "compliance": ["compliance issue 1", "compliance issue 2"],
  "recommendations": ["legal action 1", "legal action 2", "legal action 3"],
  "red_flags": ["critical issue 1", "critical issue 2"]
}

Be practical, focus on deal-killers and major liabilities. Prioritize by severity.

Document to analyze:
`

const STRATEGY_PROMPT = `You are a strategy consultant evaluating competitive position and market dynamics.

Analyze the following document and provide a structured analysis in JSON format:

{
  "summary": "2-3 sentence strategic assessment",
  "competitive_position": "Assessment of market position and advantages",
  "strategic_risks": ["strategic risk 1", "strategic risk 2", "strategic risk 3"],
  "opportunities": ["strategic opportunity 1", "strategic opportunity 2"],
  "recommendations": ["strategic recommendation 1", "strategic recommendation 2", "strategic recommendation 3"]
}

Be frank about competitive dynamics and market realities. Focus on sustainable advantages.

Document to analyze:
`

export async function POST(request: Request) {
  try {
    const { text, email, perspectives = ['investor'] } = await request.json()

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

    // Map perspectives to prompts
    const promptMap: Record<string, string> = {
      investor: INVESTOR_PROMPT,
      legal: LEGAL_PROMPT,
      strategy: STRATEGY_PROMPT,
    }

    // Run all selected perspectives in parallel
    const analysisPromises = perspectives.map(async (perspective: string) => {
      const prompt = promptMap[perspective]
      if (!prompt) {
        throw new Error(`Unknown perspective: ${perspective}`)
      }

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt + text
        }]
      })

      const result = message.content[0].type === 'text' 
        ? message.content[0].text 
        : 'Error processing response'

      return { perspective, result }
    })

    // Wait for all analyses to complete
    const analyses = await Promise.all(analysisPromises)

    // Format results as an object
    const results = analyses.reduce((acc, { perspective, result }) => {
      acc[perspective] = result
      return acc
    }, {} as Record<string, string>)

    // Save to Supabase
    const { data: analysis, error } = await supabase
      .from('analyses')
      .insert({
        user_email: email || 'anonymous',
        title: text.substring(0, 50) + '...',
        document_text: text,
        perspectives: perspectives,
        results: results,
        status: 'completed'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
    }

    return NextResponse.json({ 
      results,
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