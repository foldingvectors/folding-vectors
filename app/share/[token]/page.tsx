'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CheckIcon, CopyIcon, DownloadIcon } from '@/components/icons'
import { SynthesisView } from '@/components/SynthesisView'
import { getPerspectiveById } from '@/lib/perspectives'
import { exportToPDF, exportToWord, exportSynthesisToPDF, exportSynthesisToWord } from '@/lib/export-utils'

interface Analysis {
  id: string
  title: string
  document_text: string
  perspectives: string[]
  results: Record<string, string>
  created_at: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ParsedResult = Record<string, any>

// Category icons
const CATEGORY_ICONS: Record<string, string> = {
  business: '$',
  strategic: '→',
  compliance: '§',
  technical: '</>',
  human: '♦',
}

// Helper to format field labels
const formatFieldLabel = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
}

// Get icon for field type
const getFieldIcon = (key: string): string => {
  const keyLower = key.toLowerCase()
  if (keyLower.includes('opportunit') || keyLower.includes('strength') || keyLower.includes('tailwind') || keyLower.includes('green')) return '+'
  if (keyLower.includes('risk') || keyLower.includes('gap') || keyLower.includes('concern') || keyLower.includes('headwind') || keyLower.includes('weakness')) return '-'
  if (keyLower.includes('flag') || keyLower.includes('critical') || keyLower.includes('attack') || keyLower.includes('vulnerab')) return '!'
  if (keyLower.includes('question')) return '?'
  if (keyLower.includes('recommend')) return '>'
  return '*'
}

// Render all fields from parsed result dynamically
const renderParsedResult = (parsed: ParsedResult) => {
  const summaryKey = Object.keys(parsed).find(k => k.toLowerCase() === 'summary')
  const recommendationKey = Object.keys(parsed).find(k => k.toLowerCase() === 'recommendation')

  const otherKeys = Object.keys(parsed).filter(k =>
    k.toLowerCase() !== 'summary' && k.toLowerCase() !== 'recommendation'
  )

  const summaryValue = summaryKey ? parsed[summaryKey] : null
  const recommendationValue = recommendationKey ? parsed[recommendationKey] : null

  return (
    <div className="space-y-6">
      {summaryValue && (
        <div>
          <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Summary</h3>
          <p className="leading-relaxed">{String(summaryValue)}</p>
        </div>
      )}

      {otherKeys.map(key => {
        const value = parsed[key]
        if (!value) return null

        const label = formatFieldLabel(key)
        const icon = getFieldIcon(key)

        if (Array.isArray(value) && value.length > 0) {
          return (
            <div key={key}>
              <h3 className="text-xs uppercase tracking-wider opacity-60 mb-3">{label}</h3>
              <ul className="space-y-2">
                {(value as string[]).map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="opacity-40">{icon}</span>
                    <span>{String(item)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        } else if (typeof value === 'string') {
          return (
            <div key={key}>
              <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">{label}</h3>
              <p className="leading-relaxed">{value}</p>
            </div>
          )
        }
        return null
      })}

      {recommendationValue && (
        <div className="mt-6 pt-6 border-t border-[var(--border)]">
          <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Recommendation</h3>
          <p className="font-medium">{String(recommendationValue)}</p>
        </div>
      )}
    </div>
  )
}

const LOADING_MESSAGES = [
  'Loading shared analysis...',
  'Retrieving perspectives...',
  'Fetching insights...',
  'Almost ready...',
]

export default function SharedAnalysisPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'synthesis'>('list')
  const router = useRouter()

  useEffect(() => {
    fetchSharedAnalysis()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const fetchSharedAnalysis = async () => {
    setLoading(true)
    setLoadingMessage(LOADING_MESSAGES[0])

    let messageIndex = 0
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[messageIndex])
    }, 1500)

    try {
      const response = await fetch(`/api/share/${token}`)
      const data = await response.json()

      if (response.ok) {
        setAnalysis(data.analysis)
      } else {
        setError(data.error || 'Analysis not found')
      }
    } catch (err) {
      console.error('Error fetching shared analysis:', err)
      setError('Failed to load analysis')
    } finally {
      clearInterval(messageInterval)
      setLoading(false)
    }
  }

  const handleCopy = async (perspectiveId: string, resultText: string) => {
    try {
      await navigator.clipboard.writeText(resultText)
      setCopiedId(perspectiveId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // Ignore clipboard errors
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8 fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 loading-skeleton rounded w-32" />
              <div className="h-8 w-8 loading-skeleton rounded" />
            </div>
            <div className="h-7 loading-skeleton rounded w-2/3 mb-2" />
            <div className="h-4 loading-skeleton rounded w-40" />
          </div>

          {/* Loading message */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[var(--text)] rounded-full loading-pulse" style={{ animationDelay: '0s' }} />
              <span className="w-2 h-2 bg-[var(--text)] rounded-full loading-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 bg-[var(--text)] rounded-full loading-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm opacity-70">{loadingMessage}</span>
          </div>

          {/* Results skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`border border-[var(--border)] rounded-md slide-up stagger-${i}`}
                style={{ opacity: 0 }}
              >
                <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-6 loading-skeleton rounded" />
                    <div>
                      <div className="h-4 loading-skeleton rounded w-32 mb-1" />
                      <div className="h-3 loading-skeleton rounded w-48" />
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-4 loading-skeleton rounded w-full" />
                  <div className="h-4 loading-skeleton rounded w-5/6" />
                  <div className="h-4 loading-skeleton rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4">Analysis Not Found</h1>
          <p className="opacity-60 mb-6">{error || 'This shared analysis may have been removed or the link is invalid.'}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary px-6 py-2"
          >
            Go to Folding Vectors
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="text-sm opacity-60 hover:opacity-100 transition"
            >
              Folding Vectors
            </button>
            <div className="flex items-center gap-4">
              <span className="text-xs px-2 py-1 border border-[var(--border)] rounded opacity-60">
                Read Only
              </span>
              <ThemeToggle />
            </div>
          </div>

          <h1 className="text-xl md:text-2xl font-light tracking-tight mb-2">
            {analysis.title}
          </h1>
          <p className="text-sm opacity-60">
            {formatDate(analysis.created_at)}
          </p>
        </div>

        {/* View Toggle and Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('synthesis')}
              className={`px-4 py-2 border text-sm transition rounded-l-md ${
                viewMode === 'synthesis'
                  ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--border)]'
                  : 'border-[var(--border)] hover:opacity-60'
              }`}
            >
              Synthesis
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 border text-sm transition rounded-r-md ${
                viewMode === 'list'
                  ? 'bg-[var(--text)] text-[var(--bg)] border-[var(--border)]'
                  : 'border-[var(--border)] hover:opacity-60'
              }`}
            >
              Details
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportToPDF(analysis.perspectives, analysis.results, analysis.title)}
              className="px-3 py-2 border border-[var(--border)] rounded-md text-sm flex items-center gap-2 hover:opacity-60 transition"
            >
              <DownloadIcon size={14} />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportToWord(analysis.perspectives, analysis.results, analysis.title)}
              className="px-3 py-2 border border-[var(--border)] rounded-md text-sm flex items-center gap-2 hover:opacity-60 transition"
            >
              <DownloadIcon size={14} />
              <span>Word</span>
            </button>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'list' ? (
          <div className="space-y-6">
            {analysis.perspectives.map((perspectiveId, index) => {
              const perspective = getPerspectiveById(perspectiveId)
              const resultText = analysis.results[perspectiveId]

              if (!resultText || !perspective) return null

              let parsedResult: ParsedResult | null = null
              try {
                const cleaned = resultText
                  .replace(/```json\n?/g, '')
                  .replace(/```\n?/g, '')
                  .trim()
                parsedResult = JSON.parse(cleaned) as ParsedResult
              } catch {
                parsedResult = null
              }

              return (
                <div
                  key={perspectiveId}
                  className="border border-[var(--border)] rounded-md slide-up"
                  style={{ animationDelay: `${0.1 * (index + 1)}s`, opacity: 0 }}
                >
                  {/* Header */}
                  <div className="px-4 md:px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{CATEGORY_ICONS[perspective.category]}</span>
                      <div>
                        <div className="font-medium">{perspective.name}</div>
                        <div className="text-xs opacity-60 hidden md:block">{perspective.coreFocus}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCopy(perspectiveId, resultText)}
                      className="px-3 py-1.5 border border-[var(--border)] rounded-md text-xs flex items-center gap-2 hover:opacity-60 transition"
                    >
                      {copiedId === perspectiveId ? (
                        <>
                          <CheckIcon size={12} />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4 md:p-6">
                    {parsedResult ? (
                      renderParsedResult(parsedResult)
                    ) : (
                      <pre className="text-sm whitespace-pre-wrap font-mono opacity-80">
                        {resultText}
                      </pre>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="border border-[var(--border)] rounded-md p-4 md:p-6 slide-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <SynthesisView
              perspectives={analysis.perspectives}
              results={analysis.results}
              onExportPDF={() => exportSynthesisToPDF(analysis.perspectives, analysis.results, `${analysis.title} Synthesis`)}
              onExportWord={() => exportSynthesisToWord(analysis.perspectives, analysis.results, `${analysis.title} Synthesis`)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-[var(--border)] text-center">
          <p className="text-sm opacity-60 mb-4">
            Analyzed with Folding Vectors
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary px-6 py-2 text-sm"
          >
            Try Folding Vectors
          </button>
        </div>

      </div>
    </div>
  )
}
