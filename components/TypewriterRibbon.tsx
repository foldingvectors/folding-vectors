'use client'

import { useState, useEffect } from 'react'

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

export function TypewriterRibbon() {
  const [perspectiveIndex, setPerspectiveIndex] = useState(0)
  const [documentIndex, setDocumentIndex] = useState(0)
  const [displayedPerspective, setDisplayedPerspective] = useState('')
  const [displayedDocument, setDisplayedDocument] = useState('')
  const [isTypingPerspective, setIsTypingPerspective] = useState(true)
  const [isTypingDocument, setIsTypingDocument] = useState(false)
  const [phase, setPhase] = useState<'typing-perspective' | 'typing-document' | 'pause' | 'deleting-document' | 'deleting-perspective'>('typing-perspective')

  useEffect(() => {
    const perspective = PERSPECTIVES[perspectiveIndex]
    const document = DOCUMENTS[documentIndex]

    let timeout: NodeJS.Timeout

    switch (phase) {
      case 'typing-perspective':
        if (displayedPerspective.length < perspective.length) {
          timeout = setTimeout(() => {
            setDisplayedPerspective(perspective.slice(0, displayedPerspective.length + 1))
          }, 60)
        } else {
          timeout = setTimeout(() => {
            setPhase('typing-document')
          }, 200)
        }
        break

      case 'typing-document':
        if (displayedDocument.length < document.length) {
          timeout = setTimeout(() => {
            setDisplayedDocument(document.slice(0, displayedDocument.length + 1))
          }, 50)
        } else {
          timeout = setTimeout(() => {
            setPhase('pause')
          }, 2000)
        }
        break

      case 'pause':
        timeout = setTimeout(() => {
          setPhase('deleting-document')
        }, 100)
        break

      case 'deleting-document':
        if (displayedDocument.length > 0) {
          timeout = setTimeout(() => {
            setDisplayedDocument(displayedDocument.slice(0, -1))
          }, 30)
        } else {
          timeout = setTimeout(() => {
            setPhase('deleting-perspective')
            setDocumentIndex((documentIndex + 1) % DOCUMENTS.length)
          }, 100)
        }
        break

      case 'deleting-perspective':
        if (displayedPerspective.length > 0) {
          timeout = setTimeout(() => {
            setDisplayedPerspective(displayedPerspective.slice(0, -1))
          }, 40)
        } else {
          timeout = setTimeout(() => {
            setPerspectiveIndex((perspectiveIndex + 1) % PERSPECTIVES.length)
            setPhase('typing-perspective')
          }, 200)
        }
        break
    }

    return () => clearTimeout(timeout)
  }, [phase, displayedPerspective, displayedDocument, perspectiveIndex, documentIndex])

  return (
    <div className="border-y-2 border-[var(--border)] py-6 md:py-8 bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="text-center">
          <div className="text-lg md:text-2xl lg:text-3xl font-light tracking-tight">
            <div>
              <span className="opacity-50">What is the </span>
              <span className="font-black text-[var(--text)] inline-block min-w-[140px] md:min-w-[200px] text-left">
                {displayedPerspective}
                <span className={`inline-block w-[2px] h-[1em] bg-[var(--text)] ml-0.5 align-middle ${phase.includes('perspective') ? 'animate-blink' : 'opacity-0'}`} />
              </span>
            </div>
            <div>
              <span className="opacity-50">thinking about your </span>
              <span className="font-black text-[var(--text)] inline-block min-w-[120px] md:min-w-[180px] text-left">
                {displayedDocument}
                <span className={`inline-block w-[2px] h-[1em] bg-[var(--text)] ml-0.5 align-middle ${phase.includes('document') ? 'animate-blink' : 'opacity-0'}`} />
              </span>
              <span className="opacity-50">?</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
