'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChartIcon, ScalesIcon, ArrowIcon } from '@/components/icons'
import { Footer } from '@/components/Footer'

interface Analysis {
  id: string
  title: string
  perspectives: string[]
  created_at: string
  status: string
}

const PERSPECTIVE_ICONS: Record<string, typeof ChartIcon> = {
  investor: ChartIcon,
  legal: ScalesIcon,
  strategy: ArrowIcon,
}

const LOADING_MESSAGES = [
  'Loading your analyses...',
  'Fetching history...',
  'Gathering your insights...',
  'Retrieving saved documents...',
  'Almost ready...',
]

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0])
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const limit = 10

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      fetchAnalyses(1)
    })
  }, [router])

  const fetchAnalyses = async (pageNum: number) => {
    setLoading(true)
    setLoadingMessage(LOADING_MESSAGES[0])

    // Cycle through loading messages
    let messageIndex = 0
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length
      setLoadingMessage(LOADING_MESSAGES[messageIndex])
    }, 1500)

    try {
      const response = await fetch(`/api/analyses?page=${pageNum}&limit=${limit}`)
      const data = await response.json()

      if (response.ok) {
        setAnalyses(data.analyses)
        setTotalCount(data.totalCount)
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching analyses:', error)
    } finally {
      clearInterval(messageInterval)
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) {
      return
    }

    setDeleting(id)
    try {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setAnalyses(analyses.filter(a => a.id !== id))
        setTotalCount(totalCount - 1)
      }
    } catch (error) {
      console.error('Error deleting analysis:', error)
    } finally {
      setDeleting(null)
    }
  }

  const handleRename = (analysis: Analysis) => {
    setEditingId(analysis.id)
    setEditingTitle(analysis.title)
  }

  const handleSaveRename = async () => {
    if (!editingId || !editingTitle.trim()) return

    setSaving(true)
    try {
      const response = await fetch(`/api/analyses/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editingTitle.trim() }),
      })

      if (response.ok) {
        setAnalyses(analyses.map(a =>
          a.id === editingId ? { ...a, title: editingTitle.trim() } : a
        ))
        setEditingId(null)
        setEditingTitle('')
      }
    } catch (error) {
      console.error('Error renaming analysis:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalPages = Math.ceil(totalCount / limit)

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 fade-in">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-[var(--text)] rounded-full loading-pulse" style={{ animationDelay: '0s' }} />
            <span className="w-2 h-2 bg-[var(--text)] rounded-full loading-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 bg-[var(--text)] rounded-full loading-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
          <div className="text-sm opacity-60">Authenticating...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-light tracking-tight mb-1">
                Dashboard
              </h1>
              <p className="text-sm opacity-60">
                Your analysis history
              </p>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 border border-[var(--border)] rounded-md text-sm hover:opacity-60 transition"
              >
                New Analysis
              </button>
            </div>
          </div>
          <div className="border-b border-[var(--border)]" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-[var(--border)] rounded-md p-4">
            <div className="text-xs uppercase tracking-wider opacity-60 mb-1">
              Total Analyses
            </div>
            <div className="text-2xl font-light">{totalCount}</div>
          </div>
          <div className="border border-[var(--border)] rounded-md p-4">
            <div className="text-xs uppercase tracking-wider opacity-60 mb-1">
              Account
            </div>
            <div className="text-sm truncate">{user.email}</div>
          </div>
        </div>

        {/* Analysis List */}
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-wider opacity-60 mb-4">
            Recent Analyses
          </h2>

          {loading ? (
            <div className="space-y-4">
              {/* Loading message */}
              <div className="flex items-center gap-3 mb-6 fade-in">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-[var(--text)] rounded-full loading-pulse" style={{ animationDelay: '0s' }} />
                  <span className="w-2 h-2 bg-[var(--text)] rounded-full loading-pulse" style={{ animationDelay: '0.2s' }} />
                  <span className="w-2 h-2 bg-[var(--text)] rounded-full loading-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-sm opacity-70">{loadingMessage}</span>
              </div>

              {/* Skeleton cards */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`border border-[var(--border)] rounded-md p-4 slide-up stagger-${i}`}
                  style={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-5 loading-skeleton rounded w-3/5 mb-3" />
                      <div className="flex items-center gap-4">
                        <div className="h-3 loading-skeleton rounded w-20" />
                        <div className="flex gap-2">
                          <div className="h-4 w-4 loading-skeleton rounded" />
                          <div className="h-4 w-4 loading-skeleton rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-7 w-16 loading-skeleton rounded" />
                      <div className="h-7 w-16 loading-skeleton rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <div className="border border-[var(--border)] rounded-md p-8 text-center">
              <p className="opacity-60 mb-4">No analyses yet</p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary px-6 py-2 text-sm"
              >
                Create Your First Analysis
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="border border-[var(--border)] rounded-md p-4 flex items-center justify-between hover:opacity-80 transition"
                >
                  {editingId === analysis.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename()
                          if (e.key === 'Escape') handleCancelRename()
                        }}
                        className="flex-1 px-2 py-1 bg-transparent border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--text)]"
                        autoFocus
                        disabled={saving}
                      />
                      <button
                        onClick={handleSaveRename}
                        disabled={saving}
                        className="px-2 py-1 border border-[var(--border)] rounded text-xs hover:opacity-60 transition disabled:opacity-40"
                      >
                        {saving ? '...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelRename}
                        disabled={saving}
                        className="px-2 py-1 border border-[var(--border)] rounded text-xs hover:opacity-60 transition disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => router.push(`/dashboard/analysis/${analysis.id}`)}
                      >
                        <div className="font-medium mb-1">{analysis.title}</div>
                        <div className="flex items-center gap-4 text-xs opacity-60">
                          <span>{formatDate(analysis.created_at)}</span>
                          <div className="flex items-center gap-2">
                            {analysis.perspectives.map((p) => {
                              const Icon = PERSPECTIVE_ICONS[p] || ChartIcon
                              return <Icon key={p} size={14} />
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleRename(analysis)}
                          className="px-3 py-1 border border-[var(--border)] rounded-md text-xs hover:opacity-60 transition"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDelete(analysis.id)}
                          disabled={deleting === analysis.id}
                          className="px-3 py-1 border border-[var(--border)] rounded-md text-xs hover:opacity-60 transition disabled:opacity-40"
                        >
                          {deleting === analysis.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => fetchAnalyses(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 border border-[var(--border)] rounded-md text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm opacity-60">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => fetchAnalyses(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 border border-[var(--border)] rounded-md text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <Footer className="mt-16" />
    </div>
  )
}
