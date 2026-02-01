'use client'

import { useState, useEffect, useCallback, type ReactElement } from 'react'

const PERSPECTIVES = [
  'Investor',
  'Customer',
  'Pragmatist',
  'Strategist',
  'Competitor',
  'Futurist',
  'Systems Thinker',
  'Historian',
  'Legal Counsel',
  'Auditor',
  'Ethicist',
  'Environmentalist',
  'Security Expert',
  'Technologist',
  'Data Scientist',
  'End-User',
  'Skeptic',
  'Crisis Manager',
  'Storyteller',
  'HR Expert',
  'Globalist',
]

const DOCUMENTS = [
  'business plan',
  'contract',
  'proposal',
  'pitch deck',
  'term sheet',
  'partnership agreement',
  'acquisition offer',
  'investment memo',
  'due diligence report',
  'strategic plan',
  'vendor agreement',
  'employment contract',
  'NDA',
  'licensing deal',
  'merger agreement',
  'board presentation',
  'financial projection',
  'product roadmap',
  'policy document',
  'compliance report',
  'risk assessment',
  'market analysis',
  'competitive analysis',
  'white paper',
]

// Question templates with placeholders: {p1} = perspective 1, {p2} = perspective 2, {doc} = document
const QUESTION_TEMPLATES = [
  { line1: 'Where are the {p1} and {p2}', line2: 'disagreeing on your {doc}?' },
  { line1: 'How are the {p1} and {p2}', line2: 'aligned on your {doc}?' },
  { line1: 'What would the {p1} and {p2}', line2: 'both miss in your {doc}?' },
  { line1: 'Where do the {p1} and {p2}', line2: 'clash on your {doc}?' },
  { line1: 'How would the {p1} challenge the {p2}', line2: 'on your {doc}?' },
  { line1: 'What tensions exist between the {p1} and {p2}', line2: 'reviewing your {doc}?' },
  { line1: 'Where would the {p1} and {p2}', line2: 'find common ground on your {doc}?' },
  { line1: 'How might the {p1} and {p2}', line2: 'interpret your {doc} differently?' },
  { line1: 'What would the {p1} see that the {p2}', line2: 'overlooks in your {doc}?' },
  { line1: 'Where are the {p1} and {p2}', line2: 'contradicting each other on your {doc}?' },
  { line1: 'What risks would the {p1} and {p2}', line2: 'both flag in your {doc}?' },
  { line1: 'How do the {p1} and {p2}', line2: 'prioritize differently in your {doc}?' },
  { line1: 'What blind spots do the {p1} and {p2}', line2: 'share about your {doc}?' },
  { line1: 'Where would the {p1} push back on the {p2}', line2: 'regarding your {doc}?' },
  { line1: 'What questions would the {p1} and {p2}', line2: 'both ask about your {doc}?' },
  { line1: 'How do the {p1} and {p2}', line2: 'weigh the tradeoffs in your {doc}?' },
  { line1: 'What concerns unite the {p1} and {p2}', line2: 'about your {doc}?' },
  { line1: 'Where would the {p1} and {p2}', line2: 'demand changes to your {doc}?' },
  { line1: 'How might the {p1} and {p2}', line2: 'negotiate your {doc} differently?' },
  { line1: 'What would reconcile the {p1} and {p2}', line2: 'on your {doc}?' },
]

// Get two different random perspectives
const getRandomPerspectives = (): [string, string] => {
  const idx1 = Math.floor(Math.random() * PERSPECTIVES.length)
  let idx2 = Math.floor(Math.random() * PERSPECTIVES.length)
  while (idx2 === idx1) {
    idx2 = Math.floor(Math.random() * PERSPECTIVES.length)
  }
  return [PERSPECTIVES[idx1], PERSPECTIVES[idx2]]
}

const getRandomDocument = (): string => {
  return DOCUMENTS[Math.floor(Math.random() * DOCUMENTS.length)]
}

const getRandomTemplate = (): { line1: string; line2: string } => {
  return QUESTION_TEMPLATES[Math.floor(Math.random() * QUESTION_TEMPLATES.length)]
}

interface QuestionState {
  template: { line1: string; line2: string }
  perspective1: string
  perspective2: string
  document: string
}

const generateQuestion = (): QuestionState => {
  const [p1, p2] = getRandomPerspectives()
  return {
    template: getRandomTemplate(),
    perspective1: p1,
    perspective2: p2,
    document: getRandomDocument(),
  }
}

type Phase = 'typing-line1' | 'typing-line2' | 'pause' | 'deleting-line2' | 'deleting-line1'

export function TypewriterRibbon() {
  const [question, setQuestion] = useState<QuestionState>(() => generateQuestion())
  const [displayedLine1, setDisplayedLine1] = useState('')
  const [displayedLine2, setDisplayedLine2] = useState('')
  const [phase, setPhase] = useState<Phase>('typing-line1')

  // Build the full lines with substitutions
  const fullLine1 = question.template.line1
    .replace('{p1}', question.perspective1)
    .replace('{p2}', question.perspective2)
    .replace('{doc}', question.document)

  const fullLine2 = question.template.line2
    .replace('{p1}', question.perspective1)
    .replace('{p2}', question.perspective2)
    .replace('{doc}', question.document)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    switch (phase) {
      case 'typing-line1':
        if (displayedLine1.length < fullLine1.length) {
          timeout = setTimeout(() => {
            setDisplayedLine1(fullLine1.slice(0, displayedLine1.length + 1))
          }, 45)
        } else {
          timeout = setTimeout(() => {
            setPhase('typing-line2')
          }, 150)
        }
        break

      case 'typing-line2':
        if (displayedLine2.length < fullLine2.length) {
          timeout = setTimeout(() => {
            setDisplayedLine2(fullLine2.slice(0, displayedLine2.length + 1))
          }, 45)
        } else {
          timeout = setTimeout(() => {
            setPhase('pause')
          }, 2500)
        }
        break

      case 'pause':
        timeout = setTimeout(() => {
          setPhase('deleting-line2')
        }, 100)
        break

      case 'deleting-line2':
        if (displayedLine2.length > 0) {
          timeout = setTimeout(() => {
            // Delete word by word (find last space or delete all if no space)
            const lastSpace = displayedLine2.lastIndexOf(' ')
            if (lastSpace > 0) {
              setDisplayedLine2(displayedLine2.slice(0, lastSpace))
            } else {
              setDisplayedLine2('')
            }
          }, 60)
        } else {
          timeout = setTimeout(() => {
            setPhase('deleting-line1')
          }, 80)
        }
        break

      case 'deleting-line1':
        if (displayedLine1.length > 0) {
          timeout = setTimeout(() => {
            // Delete word by word (find last space or delete all if no space)
            const lastSpace = displayedLine1.lastIndexOf(' ')
            if (lastSpace > 0) {
              setDisplayedLine1(displayedLine1.slice(0, lastSpace))
            } else {
              setDisplayedLine1('')
            }
          }, 60)
        } else {
          timeout = setTimeout(() => {
            setQuestion(generateQuestion())
            setPhase('typing-line1')
          }, 300)
        }
        break
    }

    return () => clearTimeout(timeout)
  }, [phase, displayedLine1, displayedLine2, fullLine1, fullLine2])

  // Helper to render text with bold perspectives and document
  const renderWithHighlights = (text: string) => {
    const parts: ReactElement[] = []
    let remaining = text
    let key = 0

    const highlights = [question.perspective1, question.perspective2, question.document]

    while (remaining.length > 0) {
      let foundMatch = false

      for (const highlight of highlights) {
        if (remaining.startsWith(highlight)) {
          parts.push(
            <span key={key++} className="font-black">
              {highlight}
            </span>
          )
          remaining = remaining.slice(highlight.length)
          foundMatch = true
          break
        }
      }

      if (!foundMatch) {
        // Find the next highlight position
        let nextHighlightPos = remaining.length
        for (const highlight of highlights) {
          const pos = remaining.indexOf(highlight)
          if (pos !== -1 && pos < nextHighlightPos) {
            nextHighlightPos = pos
          }
        }

        // Add the text before the next highlight
        const normalText = remaining.slice(0, nextHighlightPos)
        if (normalText) {
          parts.push(
            <span key={key++} className="opacity-50">
              {normalText}
            </span>
          )
        }
        remaining = remaining.slice(nextHighlightPos)
      }
    }

    return parts
  }

  const showCursorLine1 = phase === 'typing-line1' || phase === 'deleting-line1'
  const showCursorLine2 = phase === 'typing-line2' || phase === 'deleting-line2'

  return (
    <div className="border-y-2 border-[var(--border)] py-6 md:py-8 bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center">
          {/* Fixed height: 4 lines on mobile, 2 lines on desktop */}
          <div className="h-[6em] md:h-[3.5em] flex flex-col justify-center text-base md:text-2xl lg:text-3xl font-light tracking-tight leading-relaxed">
            <div>
              {renderWithHighlights(displayedLine1)}
              {showCursorLine1 && (
                <span className="inline-block w-[2px] h-[1em] bg-[var(--text)] ml-0.5 align-middle animate-blink" />
              )}
            </div>
            <div>
              {renderWithHighlights(displayedLine2)}
              {showCursorLine2 && (
                <span className="inline-block w-[2px] h-[1em] bg-[var(--text)] ml-0.5 align-middle animate-blink" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
