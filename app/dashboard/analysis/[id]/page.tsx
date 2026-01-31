'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CheckIcon, CopyIcon, DownloadIcon, ShareIcon } from '@/components/icons'
import { SynthesisView } from '@/components/SynthesisView'
import { getPerspectiveById, PERSPECTIVE_CATEGORIES } from '@/lib/perspectives'
import { exportToPDF, exportToWord, exportSynthesisToPDF, exportSynthesisToWord } from '@/lib/export-utils'
import { Footer } from '@/components/Footer'

interface Analysis {
  id: string
  title: string
  document_text: string
  perspectives: string[]
  results: Record<string, string>
  created_at: string
  status: string
}

interface CustomPerspective {
  id: string
  name: string
  prompt: string
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
  custom: '★',
}

// Copy to clipboard helper
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
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

  // Get all other keys (not summary or recommendation)
  const otherKeys = Object.keys(parsed).filter(k =>
    k.toLowerCase() !== 'summary' && k.toLowerCase() !== 'recommendation'
  )

  const summaryValue = summaryKey ? parsed[summaryKey] : null
  const recommendationValue = recommendationKey ? parsed[recommendationKey] : null

  return (
    <div className="space-y-6">
      {/* Summary first */}
      {summaryValue && (
        <div>
          <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">Summary</h3>
          <p className="leading-relaxed">{String(summaryValue)}</p>
        </div>
      )}

      {/* All other fields */}
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

      {/* Recommendation last */}
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
  'Loading analysis...',
  'Retrieving perspectives...',
  'Fetching insights...',
  'Preparing results...',
  'Almost ready...',
]

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [customPerspectives, setCustomPerspectives] = useState<CustomPerspective[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'synthesis'>('list')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [sharing, setSharing] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      fetchAnalysis()
      fetchShareStatus()
      fetchCustomPerspectives()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const fetchCustomPerspectives = async () => {
    try {
      const response = await fetch('/api/custom-perspectives')
      const data = await response.json()
      if (response.ok && data.perspectives) {
        setCustomPerspectives(data.perspectives)
      }
    } catch (error) {
      console.error('Error fetching custom perspectives:', error)
    }
  }

  const fetchShareStatus = async () => {
    try {
      const response = await fetch(`/api/analyses/${id}/share`)
      const data = await response.json()
      if (response.ok && data.shared) {
        setShareUrl(data.shareUrl)
      }
    } catch (error) {
      console.error('Error fetching share status:', error)
    }
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      const response = await fetch(`/api/analyses/${id}/share`, {
        method: 'POST',
      })
      const data = await response.json()
      if (response.ok) {
        setShareUrl(data.shareUrl)
        // Copy to clipboard
        await navigator.clipboard.writeText(data.shareUrl)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 2000)
      }
    } catch (error) {
      console.error('Error creating share link:', error)
    } finally {
      setSharing(false)
    }
  }

  const handleCopyShareUrl = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl)
      setShareCopied(true)
      setTimeout(() => setShareCopied(false), 2000)
    }
  }

  const fetchAnalysis = async () => {
    setLoading(true)
    setLoadingMessage(LOADING_MESSAGES[0])

    // Cycle through loading messages
    let messageIndex = 0
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[messageIndex])
    }, 1500)

    try {
      const response = await fetch(`/api/analyses/${id}`)
      const data = await response.json()

      if (response.ok) {
        setAnalysis(data.analysis)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error fetching analysis:', error)
      router.push('/dashboard')
    } finally {
      clearInterval(messageInterval)
      setLoading(false)
    }
  }

  const handleCopy = async (perspectiveId: string, resultText: string) => {
    const success = await copyToClipboard(resultText)
    if (success) {
      setCopiedId(perspectiveId)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
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

          {/* Document skeleton */}
          <div className="mb-8 slide-up stagger-1" style={{ opacity: 0 }}>
            <div className="h-3 loading-skeleton rounded w-20 mb-2" />
            <div className="border border-[var(--border)] rounded-md p-4">
              <div className="space-y-2">
                <div className="h-3 loading-skeleton rounded w-full" />
                <div className="h-3 loading-skeleton rounded w-5/6" />
                <div className="h-3 loading-skeleton rounded w-4/5" />
              </div>
            </div>
          </div>

          {/* Results skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`border border-[var(--border)] rounded-md slide-up stagger-${i + 1}`}
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
                  <div className="h-7 w-16 loading-skeleton rounded" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-3 loading-skeleton rounded w-16 mb-2" />
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

  if (!analysis) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
        <div className="opacity-60">Analysis not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm opacity-60 hover:opacity-100 transition"
            >
              Back to Dashboard
            </button>
            <ThemeToggle />
          </div>

          <h1 className="text-2xl font-light tracking-tight mb-2">
            {analysis.title}
          </h1>
          <p className="text-sm opacity-60">
            {formatDate(analysis.created_at)}
          </p>
        </div>

        {/* View Toggle and Export */}
        <div className="flex items-center justify-between mb-6">
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
            {shareUrl ? (
              <button
                onClick={handleCopyShareUrl}
                className="px-3 py-2 border border-[var(--border)] rounded-md text-sm flex items-center gap-2 hover:opacity-60 transition"
              >
                {shareCopied ? (
                  <>
                    <CheckIcon size={14} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <ShareIcon size={14} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleShare}
                disabled={sharing}
                className="px-3 py-2 border border-[var(--border)] rounded-md text-sm flex items-center gap-2 hover:opacity-60 transition disabled:opacity-40"
              >
                <ShareIcon size={14} />
                <span>{sharing ? 'Creating...' : 'Share'}</span>
              </button>
            )}
            <button
              onClick={() => exportToPDF(analysis.perspectives, analysis.results, analysis.title, user?.email || undefined)}
              className="px-3 py-2 border border-[var(--border)] rounded-md text-sm flex items-center gap-2 hover:opacity-60 transition"
            >
              <DownloadIcon size={14} />
              <span>PDF</span>
            </button>
            <button
              onClick={() => exportToWord(analysis.perspectives, analysis.results, analysis.title, user?.email || undefined)}
              className="px-3 py-2 border border-[var(--border)] rounded-md text-sm flex items-center gap-2 hover:opacity-60 transition"
            >
              <DownloadIcon size={14} />
              <span>Word</span>
            </button>
          </div>
        </div>

        {/* Share URL display */}
        {shareUrl && (
          <div className="mb-6 p-4 border border-[var(--border)] rounded-md bg-[var(--hover-bg)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-xs uppercase tracking-wider opacity-60 mb-1">Shareable Link</div>
                <div className="text-sm font-mono truncate opacity-80">{shareUrl}</div>
              </div>
              <button
                onClick={handleCopyShareUrl}
                className="px-3 py-1.5 border border-[var(--border)] rounded-md text-xs flex items-center gap-2 hover:opacity-60 transition shrink-0"
              >
                {shareCopied ? (
                  <>
                    <CheckIcon size={12} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon size={12} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {viewMode === 'list' ? (
          <div className="space-y-6">
            {analysis.perspectives.map((perspectiveId) => {
              const isCustom = perspectiveId.startsWith('custom:')
              const perspective = !isCustom ? getPerspectiveById(perspectiveId) : null
              const resultText = analysis.results[perspectiveId]

              if (!resultText) return null
              if (!isCustom && !perspective) return null

              // For custom perspectives, look up the name from fetched custom perspectives
              const customPerspective = isCustom
                ? customPerspectives.find(p => `custom:${p.id}` === perspectiveId)
                : null
              const perspectiveName = isCustom
                ? (customPerspective?.name || 'Custom Perspective')
                : perspective!.name
              const perspectiveDescription = isCustom ? 'Custom perspective' : perspective!.coreFocus
              const categoryIcon = isCustom ? CATEGORY_ICONS.custom : CATEGORY_ICONS[perspective!.category]

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
                <div key={perspectiveId} className="border border-[var(--border)] rounded-md">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{categoryIcon}</span>
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {perspectiveName}
                          {isCustom && (
                            <span className="text-xs px-1.5 py-0.5 border border-[var(--border)] rounded opacity-60">Custom</span>
                          )}
                        </div>
                        <div className="text-xs opacity-60">{perspectiveDescription}</div>
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
                  <div className="p-6">
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
          <div className="border border-[var(--border)] rounded-md p-6">
            <SynthesisView
              perspectives={analysis.perspectives}
              results={analysis.results}
              customPerspectives={customPerspectives}
              onExportPDF={() => exportSynthesisToPDF(analysis.perspectives, analysis.results, `${analysis.title} Synthesis`, user?.email || undefined)}
              onExportWord={() => exportSynthesisToWord(analysis.perspectives, analysis.results, `${analysis.title} Synthesis`, user?.email || undefined)}
            />
          </div>
        )}

      </div>

      {/* Footer */}
      <Footer className="mt-16" />
    </div>
  )
}
