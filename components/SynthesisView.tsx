'use client'

import { useMemo, useState } from 'react'
import { PERSPECTIVES } from '@/lib/perspectives'

interface CustomPerspective {
  id: string
  name: string
  prompt: string
}

interface SynthesisViewProps {
  perspectives: string[]
  results: Record<string, string>
  customPerspectives?: CustomPerspective[]
  onExportPDF?: () => void
  onExportWord?: () => void
}

interface ParsedResult {
  Summary?: string
  Opportunities?: string[]
  Risks?: string[]
  Recommendation?: string
  [key: string]: string | string[] | undefined
}

interface InsightItem {
  text: string
  sources: string[]
  type: 'agreement' | 'tension'
  details?: string
}

interface PerspectiveSummary {
  id: string
  name: string
  summary: string
  recommendation: string
  score: number
}

function parseResult(resultText: string): ParsedResult | null {
  try {
    const cleaned = resultText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

function getPerspectiveName(id: string, customPerspectives: CustomPerspective[] = []): string {
  // Check if it's a custom perspective
  if (id.startsWith('custom:')) {
    const customId = id.replace('custom:', '')
    const custom = customPerspectives.find(p => p.id === customId)
    return custom?.name || 'Custom Perspective'
  }
  // Built-in perspective
  const perspective = PERSPECTIVES.find(p => p.id === id)
  return perspective?.name || id
}

// Calculate a confidence score (1-10) based on text analysis
function calculateScore(text: string): number {
  const lowerText = text.toLowerCase()

  // Strong positive indicators
  const strongPositive = ['strongly recommend', 'highly recommend', 'excellent', 'outstanding', 'exceptional', 'compelling', 'clear opportunity']
  // Moderate positive
  const positive = ['recommend', 'proceed', 'invest', 'promising', 'favorable', 'good', 'solid', 'strong']
  // Neutral
  const neutral = ['mixed', 'balanced', 'moderate', 'depends', 'conditional']
  // Moderate negative
  const negative = ['concern', 'risk', 'caution', 'careful', 'uncertain', 'questionable', 'deficiencies']
  // Strong negative
  const strongNegative = ['avoid', 'reject', 'significant risk', 'major concern', 'not recommend', 'serious issues']

  let score = 5 // Default neutral

  if (strongPositive.some(term => lowerText.includes(term))) score = 9
  else if (strongNegative.some(term => lowerText.includes(term))) score = 2
  else if (positive.some(term => lowerText.includes(term))) score = 7
  else if (negative.some(term => lowerText.includes(term))) score = 4
  else if (neutral.some(term => lowerText.includes(term))) score = 5

  // Add some variance based on specific keywords
  if (lowerText.includes('but') || lowerText.includes('however')) score = Math.max(3, score - 1)
  if (lowerText.includes('despite') && score > 5) score = Math.min(8, score)

  return Math.min(10, Math.max(1, score))
}

// Extract themes and generate specific insights
function extractThemes(perspectives: string[], results: Record<string, string>, customPerspectives: CustomPerspective[] = []): {
  agreements: InsightItem[]
  tensions: InsightItem[]
  summaries: PerspectiveSummary[]
} {
  const allOpportunities: { text: string; source: string; sourceName: string }[] = []
  const allRisks: { text: string; source: string; sourceName: string }[] = []
  const summaries: PerspectiveSummary[] = []

  // Collect all insights
  perspectives.forEach(id => {
    const parsed = parseResult(results[id] || '')
    if (!parsed) return

    const name = getPerspectiveName(id, customPerspectives)
    const summary = parsed.Summary || parsed.summary || ''
    const recommendation = parsed.Recommendation || parsed.recommendation ||
                          (parsed.Recommendations ? parsed.Recommendations[0] : '') || ''

    const combinedText = `${summary} ${recommendation}`
    const score = calculateScore(combinedText)

    if (summary) {
      summaries.push({ id, name, summary: String(summary), recommendation: String(recommendation), score })
    }

    // Collect opportunities
    const oppKeys = Object.keys(parsed).filter(k =>
      k.toLowerCase().includes('opportunit') ||
      k.toLowerCase().includes('strength') ||
      k.toLowerCase().includes('tailwind') ||
      k.toLowerCase().includes('green')
    )
    oppKeys.forEach(key => {
      const value = parsed[key]
      if (Array.isArray(value)) {
        value.forEach(opp => {
          allOpportunities.push({ text: String(opp), source: id, sourceName: name })
        })
      }
    })

    // Collect risks
    const riskKeys = Object.keys(parsed).filter(k =>
      k.toLowerCase().includes('risk') ||
      k.toLowerCase().includes('concern') ||
      k.toLowerCase().includes('headwind') ||
      k.toLowerCase().includes('gap') ||
      k.toLowerCase().includes('flag')
    )
    riskKeys.forEach(key => {
      const value = parsed[key]
      if (Array.isArray(value)) {
        value.forEach(risk => {
          allRisks.push({ text: String(risk), source: id, sourceName: name })
        })
      }
    })
  })

  // Find agreements - themes mentioned positively by multiple perspectives
  const agreements: InsightItem[] = []
  const seenAgreements = new Set<string>()

  allOpportunities.forEach(opp1 => {
    allOpportunities.forEach(opp2 => {
      if (opp1.source >= opp2.source) return

      const words1 = opp1.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const words2 = opp2.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const overlap = words1.filter(w => words2.some(w2 => w.includes(w2) || w2.includes(w)))

      if (overlap.length >= 2) {
        const key = [opp1.source, opp2.source].sort().join('-')
        if (!seenAgreements.has(key)) {
          seenAgreements.add(key)
          agreements.push({
            text: `${opp1.sourceName} and ${opp2.sourceName} both see opportunity in: ${overlap.slice(0, 3).join(', ')}`,
            sources: [opp1.source, opp2.source],
            type: 'agreement',
            details: `${opp1.sourceName}: "${opp1.text}"\n\n${opp2.sourceName}: "${opp2.text}"`
          })
        }
      }
    })
  })

  // Also check for shared risk concerns as agreements
  allRisks.forEach(risk1 => {
    allRisks.forEach(risk2 => {
      if (risk1.source >= risk2.source) return

      const words1 = risk1.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const words2 = risk2.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const overlap = words1.filter(w => words2.some(w2 => w.includes(w2) || w2.includes(w)))

      if (overlap.length >= 2) {
        const key = [risk1.source, risk2.source].sort().join('-') + '-risk'
        if (!seenAgreements.has(key)) {
          seenAgreements.add(key)
          agreements.push({
            text: `${risk1.sourceName} and ${risk2.sourceName} share concerns about: ${overlap.slice(0, 3).join(', ')}`,
            sources: [risk1.source, risk2.source],
            type: 'agreement',
            details: `${risk1.sourceName}: "${risk1.text}"\n\n${risk2.sourceName}: "${risk2.text}"`
          })
        }
      }
    })
  })

  // Find tensions - where one sees opportunity and another sees risk
  const tensions: InsightItem[] = []
  const seenTensions = new Set<string>()

  allOpportunities.forEach(opp => {
    allRisks.forEach(risk => {
      if (opp.source === risk.source) return

      const oppWords = opp.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const riskWords = risk.text.toLowerCase().split(/\s+/).filter(w => w.length > 4)
      const overlap = oppWords.filter(w => riskWords.some(rw => w.includes(rw) || rw.includes(w)))

      if (overlap.length >= 2) {
        const key = [opp.source, risk.source].sort().join('-') + overlap[0]
        if (!seenTensions.has(key)) {
          seenTensions.add(key)
          const topic = overlap.slice(0, 2).join(' & ')
          tensions.push({
            text: `${opp.sourceName} sees opportunity in ${topic}, while ${risk.sourceName} flags it as a risk`,
            sources: [opp.source, risk.source],
            type: 'tension',
            details: `${opp.sourceName} (Opportunity): "${opp.text}"\n\n${risk.sourceName} (Risk): "${risk.text}"`
          })
        }
      }
    })
  })

  return {
    agreements: agreements.slice(0, 5),
    tensions: tensions.slice(0, 5),
    summaries
  }
}

// Expandable item component
function ExpandableItem({ item, icon }: { item: InsightItem; icon: string }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <li className="border-b border-[var(--border)] last:border-0 pb-2 last:pb-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-start gap-2 hover:opacity-80 transition"
      >
        <span className="opacity-40 mt-0.5">{icon}</span>
        <div className="flex-1">
          <span className="text-sm">{item.text}</span>
          <div className="text-xs opacity-40 mt-1">
            Click to {expanded ? 'collapse' : 'expand'}
          </div>
        </div>
        <span className="text-xs opacity-40">{expanded ? '-' : '+'}</span>
      </button>
      {expanded && item.details && (
        <div className="mt-2 ml-5 p-3 bg-[var(--hover-bg)] rounded-md text-xs whitespace-pre-wrap">
          {item.details}
        </div>
      )}
    </li>
  )
}

// Expandable summary row
function ExpandableSummaryRow({ summary, isLast }: { summary: PerspectiveSummary; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className={`cursor-pointer hover:bg-[var(--hover-bg)] transition ${!isLast && !expanded ? 'border-b border-[var(--border)]' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="p-3 font-medium">{summary.name}</td>
        <td className="p-3 text-xs opacity-80">
          {summary.summary.slice(0, 80)}{summary.summary.length > 80 ? '...' : ''}
          {summary.summary.length > 80 && (
            <span className="ml-1 opacity-40">[{expanded ? '-' : '+'}]</span>
          )}
        </td>
        <td className="p-3 text-center">
          <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
            summary.score >= 7 ? 'bg-[var(--text)] text-[var(--bg)]' :
            summary.score <= 4 ? 'border border-[var(--border)]' :
            'bg-[var(--mid)] text-[var(--bg)]'
          }`}>
            {summary.score}/10
          </span>
        </td>
      </tr>
      {expanded && (
        <tr className={!isLast ? 'border-b border-[var(--border)]' : ''}>
          <td colSpan={3} className="p-4 bg-[var(--hover-bg)]">
            <div className="text-sm mb-2">{summary.summary}</div>
            {summary.recommendation && (
              <div className="text-sm font-medium mt-2 pt-2 border-t border-[var(--border)]">
                Recommendation: {summary.recommendation}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  )
}

export function SynthesisView({ perspectives, results, customPerspectives = [], onExportPDF, onExportWord }: SynthesisViewProps) {
  const { agreements, tensions, summaries } = useMemo(
    () => extractThemes(perspectives, results, customPerspectives),
    [perspectives, results, customPerspectives]
  )

  // Calculate average score
  const avgScore = useMemo(() => {
    if (summaries.length === 0) return 0
    const total = summaries.reduce((acc, s) => acc + s.score, 0)
    return Math.round((total / summaries.length) * 10) / 10
  }, [summaries])

  if (perspectives.length === 0) {
    return (
      <div className="text-center py-12 opacity-60">
        No perspectives to synthesize
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div>
          <h2 className="text-lg font-bold mb-1">SYNTHESIS</h2>
          <p className="text-sm opacity-60">
            Cross-perspective analysis of {perspectives.length} viewpoints
          </p>
        </div>
        {(onExportPDF || onExportWord) && (
          <div className="flex gap-2">
            {onExportPDF && (
              <button
                onClick={onExportPDF}
                className="px-3 py-1.5 border border-[var(--border)] rounded-md text-xs hover:opacity-60 transition"
              >
                Export PDF
              </button>
            )}
            {onExportWord && (
              <button
                onClick={onExportWord}
                className="px-3 py-1.5 border border-[var(--border)] rounded-md text-xs hover:opacity-60 transition"
              >
                Export Word
              </button>
            )}
          </div>
        )}
      </div>

      {/* Overall Score */}
      <div className="border border-[var(--border)] rounded-md p-3 md:p-4">
        <h3 className="text-xs uppercase tracking-wider opacity-60 mb-4">Composite Score</h3>
        <div className="flex items-center gap-4">
          <div className={`text-4xl font-bold px-4 py-2 rounded-md ${
            avgScore >= 7 ? 'bg-[var(--text)] text-[var(--bg)]' :
            avgScore <= 4 ? 'border border-[var(--border)]' :
            'bg-[var(--mid)] text-[var(--bg)]'
          }`}>
            {avgScore}/10
          </div>
          <div className="flex-1">
            <div className="h-4 bg-transparent border border-[var(--border)] rounded-md overflow-hidden">
              <div
                className={`h-full transition-all ${
                  avgScore >= 7 ? 'bg-[var(--text)]' :
                  avgScore <= 4 ? 'bg-[var(--hover-bg)]' :
                  'bg-[var(--mid)]'
                }`}
                style={{ width: `${avgScore * 10}%` }}
              />
            </div>
            <div className="flex justify-between text-xs mt-1 opacity-40">
              <span>Cautious (1-4)</span>
              <span>Neutral (5-6)</span>
              <span>Positive (7-10)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Perspective Matrix */}
      <div className="border border-[var(--border)] rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--hover-bg)]">
              <th className="text-left p-3 font-bold text-xs uppercase tracking-wider">Perspective</th>
              <th className="text-left p-3 font-bold text-xs uppercase tracking-wider">Key Insight (click to expand)</th>
              <th className="text-center p-3 font-bold text-xs uppercase tracking-wider w-24">Score</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((s, i) => (
              <ExpandableSummaryRow
                key={s.id}
                summary={s}
                isLast={i === summaries.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Agreement & Tension Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {/* Agreements */}
        <div className="border border-[var(--border)] rounded-md p-3 md:p-4">
          <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2 md:mb-3 flex items-center gap-2">
            <span className="w-3 h-3 bg-[var(--text)] rounded-full" />
            Points of Agreement ({agreements.length})
          </h3>
          {agreements.length > 0 ? (
            <ul className="space-y-2">
              {agreements.map((item, i) => (
                <ExpandableItem key={i} item={item} icon="+" />
              ))}
            </ul>
          ) : (
            <p className="text-sm opacity-40">No strong agreements detected between perspectives</p>
          )}
        </div>

        {/* Tensions */}
        <div className="border border-[var(--border)] rounded-md p-3 md:p-4">
          <h3 className="text-xs uppercase tracking-wider opacity-60 mb-2 md:mb-3 flex items-center gap-2">
            <span className="w-3 h-3 border border-[var(--border)] rounded-full" />
            Points of Tension ({tensions.length})
          </h3>
          {tensions.length > 0 ? (
            <ul className="space-y-2">
              {tensions.map((item, i) => (
                <ExpandableItem key={i} item={item} icon="~" />
              ))}
            </ul>
          ) : (
            <p className="text-sm opacity-40">No major tensions detected between perspectives</p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs opacity-60 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[var(--text)] text-[var(--bg)] rounded text-xs font-bold">7-10</span>
          <span>Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[var(--mid)] text-[var(--bg)] rounded text-xs font-bold">5-6</span>
          <span>Neutral</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 border border-[var(--border)] rounded text-xs font-bold">1-4</span>
          <span>Cautious</span>
        </div>
      </div>
    </div>
  )
}
