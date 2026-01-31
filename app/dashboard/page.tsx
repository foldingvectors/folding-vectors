'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChartIcon, ScalesIcon, ArrowIcon } from '@/components/icons'

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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<string | null>(null)
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
        <div className="opacity-60">Loading...</div>
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
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-[var(--border)] rounded-md p-4">
                  <div className="h-4 bg-[var(--text)] opacity-10 w-1/2 mb-2" />
                  <div className="h-3 bg-[var(--text)] opacity-5 w-1/4" />
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
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    disabled={deleting === analysis.id}
                    className="px-3 py-1 border border-[var(--border)] rounded-md text-xs hover:opacity-60 transition disabled:opacity-40"
                  >
                    {deleting === analysis.id ? '...' : 'Delete'}
                  </button>
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
    </div>
  )
}
