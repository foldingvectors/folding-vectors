'use client'

import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CheckIcon, CopyIcon, DownloadIcon } from '@/components/icons'
import { SynthesisView } from '@/components/SynthesisView'
import { getPerspectiveById, PERSPECTIVE_CATEGORIES } from '@/lib/perspectives'
import { exportToPDF, exportToWord, exportSynthesisToPDF, exportSynthesisToWord } from '@/lib/export-utils'

interface Analysis {
  id: string
  title: string
  document_text: string
  perspectives: string[]
  results: Record<string, string>
  created_at: string
  status: string
}

// Extended ParsedResult to handle all 20 perspectives
interface ParsedResult {
  // Common
  summary?: string
  recommendation?: string
  recommendations?: string[]
  questions?: string[]

  // Investor
  opportunities?: string[]
  risks?: string[]

  // Customer
  pain_points_addressed?: string[]
  value_gaps?: string[]
  buying_objections?: string[]
  competitive_comparison?: string

  // Pragmatist
  resource_requirements?: string[]
  execution_risks?: string[]
  hidden_costs?: string[]
  timeline_reality?: string

  // Strategist
  competitive_position?: string
  strategic_risks?: string[]

  // Competitor
  attack_vectors?: string[]
  copyable_elements?: string[]
  true_moats?: string[]
  vulnerabilities?: string[]
  timeline_to_compete?: string

  // Futurist
  tailwinds?: string[]
  headwinds?: string[]
  disruption_risks?: string[]
  adaptation_needed?: string[]
  ten_year_verdict?: string

  // Systems Thinker
  dependencies?: string[]
  ripple_effects?: string[]
  feedback_loops?: string[]
  stakeholder_impacts?: string[]
  systemic_risks?: string[]

  // Historian
  precedents?: string[]
  patterns?: string[]
  lessons?: string[]
  whats_different?: string[]
  historical_warnings?: string[]

  // Legal
  red_flags?: string[]
  compliance?: string[]
  liability_exposure?: string[]

  // Auditor
  verification_needed?: string[]
  data_concerns?: string[]
  compliance_gaps?: string[]
  documentation_issues?: string[]
  audit_opinion?: string

  // Ethicist
  fairness_concerns?: string[]
  bias_risks?: string[]
  social_impact?: string[]
  transparency_gaps?: string[]
  ethical_verdict?: string

  // Environmentalist
  footprint_concerns?: string[]
  sustainability_gaps?: string[]
  green_opportunities?: string[]
  climate_risks?: string[]
  environmental_verdict?: string

  // Security Expert
  privacy_risks?: string[]
  security_gaps?: string[]
  security_verdict?: string

  // Technologist
  tech_strengths?: string[]
  tech_debt?: string[]
  scalability?: string
  innovation_level?: string
  obsolescence_risks?: string[]
  technical_verdict?: string

  // Data Scientist
  data_strengths?: string[]
  measurement_gaps?: string[]
  statistical_concerns?: string[]
  data_opportunities?: string[]
  data_verdict?: string

  // End-User Support
  friction_points?: string[]
  confusion_areas?: string[]
  onboarding_issues?: string[]
  support_drivers?: string[]
  ux_verdict?: string

  // Skeptic
  logical_gaps?: string[]
  happy_path_assumptions?: string[]
  cherry_picking?: string[]
  unstated_risks?: string[]
  skeptic_verdict?: string

  // Crisis Manager
  crisis_scenarios?: string[]
  failure_modes?: string[]
  reputation_risks?: string[]
  preparedness_gaps?: string[]
  crisis_verdict?: string

  // Storyteller
  story_strengths?: string[]
  emotional_hooks?: string[]
  narrative_gaps?: string[]
  memorability?: string
  storytelling_verdict?: string

  // HR/Culturalist
  morale_impacts?: string[]
  talent_implications?: string[]
  culture_fit?: string
  change_challenges?: string[]
  people_verdict?: string

  // Globalist
  cultural_challenges?: string[]
  regional_differences?: string[]
  localization_needs?: string[]
  global_regulations?: string[]
  global_verdict?: string
}

// Category icons
const CATEGORY_ICONS: Record<string, string> = {
  business: '$',
  strategic: '→',
  compliance: '§',
  technical: '</>',
  human: '♦',
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

// Helper to render array fields
function renderArrayField(items: string[] | undefined, label: string, icon: string, highlight = false) {
  if (!Array.isArray(items) || items.length === 0) return null
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider opacity-60 mb-3">
        {label}
      </h3>
      <ul className="space-y-2">
        {items.map((item: string, i: number) => (
          <li
            key={i}
            className={`flex items-start gap-3 ${
              highlight ? 'p-3 border border-[var(--border)] rounded-md' : ''
            }`}
          >
            <span className="opacity-40">{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Helper to render string fields
function renderStringField(value: string | undefined, label: string) {
  if (!value) return null
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">
        {label}
      </h3>
      <p className="leading-relaxed">
        {value}
      </p>
    </div>
  )
}

export default function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'synthesis'>('list')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push('/auth/login')
        return
      }
      setUser(session.user)
      fetchAnalysis()
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const fetchAnalysis = async () => {
    setLoading(true)
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
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center">
        <div className="opacity-60">Loading...</div>
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

        {/* Document Preview */}
        <div className="mb-8">
          <h2 className="text-xs uppercase tracking-wider opacity-60 mb-2">
            Document
          </h2>
          <div className="border border-[var(--border)] rounded-md p-4 max-h-48 overflow-y-auto">
            <pre className="text-sm whitespace-pre-wrap font-mono opacity-80">
              {analysis.document_text}
            </pre>
          </div>
        </div>

        {/* Results */}
        {viewMode === 'list' ? (
          <div className="space-y-6">
            {analysis.perspectives.map((perspectiveId) => {
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
                <div key={perspectiveId} className="border border-[var(--border)] rounded-md">
                  {/* Header */}
                  <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{CATEGORY_ICONS[perspective.category]}</span>
                      <div>
                        <div className="font-medium">{perspective.name}</div>
                        <div className="text-xs opacity-60">{perspective.coreFocus}</div>
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
                      <div className="space-y-6">
                        {/* Summary - common to all */}
                        {parsedResult.summary && (
                          <div>
                            <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">
                              Summary
                            </h3>
                            <p className="leading-relaxed">
                              {parsedResult.summary}
                            </p>
                          </div>
                        )}

                        {/* Render all array fields dynamically */}
                        {renderArrayField(parsedResult.opportunities, 'Opportunities', '+')}
                        {renderArrayField(parsedResult.risks, 'Risks', '-')}
                        {renderArrayField(parsedResult.strategic_risks, 'Strategic Risks', '-')}
                        {renderArrayField(parsedResult.red_flags, 'Critical Issues', '!', true)}
                        {renderArrayField(parsedResult.compliance, 'Compliance Issues', '*')}
                        {renderArrayField(parsedResult.questions, 'Critical Questions', '?')}
                        {renderArrayField(parsedResult.recommendations, 'Recommendations', '>')}
                        {renderArrayField(parsedResult.pain_points_addressed, 'Pain Points Addressed', '+')}
                        {renderArrayField(parsedResult.value_gaps, 'Value Gaps', '-')}
                        {renderArrayField(parsedResult.buying_objections, 'Buying Objections', '-')}
                        {renderArrayField(parsedResult.resource_requirements, 'Resource Requirements', '*')}
                        {renderArrayField(parsedResult.execution_risks, 'Execution Risks', '-')}
                        {renderArrayField(parsedResult.hidden_costs, 'Hidden Costs', '$')}
                        {renderArrayField(parsedResult.attack_vectors, 'Attack Vectors', '!')}
                        {renderArrayField(parsedResult.copyable_elements, 'Copyable Elements', '~')}
                        {renderArrayField(parsedResult.true_moats, 'True Moats', '+')}
                        {renderArrayField(parsedResult.vulnerabilities, 'Vulnerabilities', '-')}
                        {renderArrayField(parsedResult.tailwinds, 'Tailwinds', '+')}
                        {renderArrayField(parsedResult.headwinds, 'Headwinds', '-')}
                        {renderArrayField(parsedResult.disruption_risks, 'Disruption Risks', '!')}
                        {renderArrayField(parsedResult.adaptation_needed, 'Adaptation Needed', '>')}
                        {renderArrayField(parsedResult.dependencies, 'Dependencies', '*')}
                        {renderArrayField(parsedResult.ripple_effects, 'Ripple Effects', '~')}
                        {renderArrayField(parsedResult.feedback_loops, 'Feedback Loops', '∞')}
                        {renderArrayField(parsedResult.stakeholder_impacts, 'Stakeholder Impacts', '•')}
                        {renderArrayField(parsedResult.systemic_risks, 'Systemic Risks', '-')}
                        {renderArrayField(parsedResult.precedents, 'Precedents', '«')}
                        {renderArrayField(parsedResult.patterns, 'Patterns', '~')}
                        {renderArrayField(parsedResult.lessons, 'Lessons', '+')}
                        {renderArrayField(parsedResult.whats_different, "What's Different", '!')}
                        {renderArrayField(parsedResult.historical_warnings, 'Historical Warnings', '-')}
                        {renderArrayField(parsedResult.liability_exposure, 'Liability Exposure', '!')}
                        {renderArrayField(parsedResult.verification_needed, 'Verification Needed', '?')}
                        {renderArrayField(parsedResult.data_concerns, 'Data Concerns', '-')}
                        {renderArrayField(parsedResult.compliance_gaps, 'Compliance Gaps', '!')}
                        {renderArrayField(parsedResult.documentation_issues, 'Documentation Issues', '*')}
                        {renderArrayField(parsedResult.fairness_concerns, 'Fairness Concerns', '-')}
                        {renderArrayField(parsedResult.bias_risks, 'Bias Risks', '!')}
                        {renderArrayField(parsedResult.social_impact, 'Social Impact', '•')}
                        {renderArrayField(parsedResult.transparency_gaps, 'Transparency Gaps', '-')}
                        {renderArrayField(parsedResult.footprint_concerns, 'Footprint Concerns', '-')}
                        {renderArrayField(parsedResult.sustainability_gaps, 'Sustainability Gaps', '-')}
                        {renderArrayField(parsedResult.green_opportunities, 'Green Opportunities', '+')}
                        {renderArrayField(parsedResult.climate_risks, 'Climate Risks', '!')}
                        {renderArrayField(parsedResult.privacy_risks, 'Privacy Risks', '!')}
                        {renderArrayField(parsedResult.security_gaps, 'Security Gaps', '-')}
                        {renderArrayField(parsedResult.tech_strengths, 'Technical Strengths', '+')}
                        {renderArrayField(parsedResult.tech_debt, 'Technical Debt', '-')}
                        {renderArrayField(parsedResult.obsolescence_risks, 'Obsolescence Risks', '!')}
                        {renderArrayField(parsedResult.data_strengths, 'Data Strengths', '+')}
                        {renderArrayField(parsedResult.measurement_gaps, 'Measurement Gaps', '-')}
                        {renderArrayField(parsedResult.statistical_concerns, 'Statistical Concerns', '?')}
                        {renderArrayField(parsedResult.data_opportunities, 'Data Opportunities', '+')}
                        {renderArrayField(parsedResult.friction_points, 'Friction Points', '-')}
                        {renderArrayField(parsedResult.confusion_areas, 'Confusion Areas', '?')}
                        {renderArrayField(parsedResult.onboarding_issues, 'Onboarding Issues', '-')}
                        {renderArrayField(parsedResult.support_drivers, 'Support Drivers', '!')}
                        {renderArrayField(parsedResult.logical_gaps, 'Logical Gaps', '!')}
                        {renderArrayField(parsedResult.happy_path_assumptions, 'Happy Path Assumptions', '-')}
                        {renderArrayField(parsedResult.cherry_picking, 'Cherry Picking', '-')}
                        {renderArrayField(parsedResult.unstated_risks, 'Unstated Risks', '!')}
                        {renderArrayField(parsedResult.crisis_scenarios, 'Crisis Scenarios', '!')}
                        {renderArrayField(parsedResult.failure_modes, 'Failure Modes', '-')}
                        {renderArrayField(parsedResult.reputation_risks, 'Reputation Risks', '!')}
                        {renderArrayField(parsedResult.preparedness_gaps, 'Preparedness Gaps', '-')}
                        {renderArrayField(parsedResult.story_strengths, 'Story Strengths', '+')}
                        {renderArrayField(parsedResult.emotional_hooks, 'Emotional Hooks', '♥')}
                        {renderArrayField(parsedResult.narrative_gaps, 'Narrative Gaps', '-')}
                        {renderArrayField(parsedResult.morale_impacts, 'Morale Impacts', '•')}
                        {renderArrayField(parsedResult.talent_implications, 'Talent Implications', '•')}
                        {renderArrayField(parsedResult.change_challenges, 'Change Challenges', '-')}
                        {renderArrayField(parsedResult.cultural_challenges, 'Cultural Challenges', '-')}
                        {renderArrayField(parsedResult.regional_differences, 'Regional Differences', '•')}
                        {renderArrayField(parsedResult.localization_needs, 'Localization Needs', '*')}
                        {renderArrayField(parsedResult.global_regulations, 'Global Regulations', '§')}

                        {/* String fields */}
                        {renderStringField(parsedResult.competitive_position, 'Competitive Position')}
                        {renderStringField(parsedResult.competitive_comparison, 'Competitive Comparison')}
                        {renderStringField(parsedResult.timeline_reality, 'Timeline Reality')}
                        {renderStringField(parsedResult.timeline_to_compete, 'Timeline to Compete')}
                        {renderStringField(parsedResult.ten_year_verdict, 'Ten Year Verdict')}
                        {renderStringField(parsedResult.audit_opinion, 'Audit Opinion')}
                        {renderStringField(parsedResult.ethical_verdict, 'Ethical Verdict')}
                        {renderStringField(parsedResult.environmental_verdict, 'Environmental Verdict')}
                        {renderStringField(parsedResult.security_verdict, 'Security Verdict')}
                        {renderStringField(parsedResult.scalability, 'Scalability')}
                        {renderStringField(parsedResult.innovation_level, 'Innovation Level')}
                        {renderStringField(parsedResult.technical_verdict, 'Technical Verdict')}
                        {renderStringField(parsedResult.data_verdict, 'Data Verdict')}
                        {renderStringField(parsedResult.ux_verdict, 'UX Verdict')}
                        {renderStringField(parsedResult.skeptic_verdict, 'Skeptic Verdict')}
                        {renderStringField(parsedResult.crisis_verdict, 'Crisis Verdict')}
                        {renderStringField(parsedResult.memorability, 'Memorability')}
                        {renderStringField(parsedResult.storytelling_verdict, 'Storytelling Verdict')}
                        {renderStringField(parsedResult.culture_fit, 'Culture Fit')}
                        {renderStringField(parsedResult.people_verdict, 'People Verdict')}
                        {renderStringField(parsedResult.global_verdict, 'Global Verdict')}

                        {/* Final recommendation */}
                        {parsedResult.recommendation && (
                          <div className="mt-6 pt-6 border-t border-[var(--border)]">
                            <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2">
                              Recommendation
                            </h3>
                            <p className="font-medium">
                              {parsedResult.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
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
              onExportPDF={() => exportSynthesisToPDF(analysis.perspectives, analysis.results, `${analysis.title} Synthesis`, user?.email || undefined)}
              onExportWord={() => exportSynthesisToWord(analysis.perspectives, analysis.results, `${analysis.title} Synthesis`, user?.email || undefined)}
            />
          </div>
        )}

      </div>
    </div>
  )
}
