'use client'

import { useState } from 'react'

const PERSPECTIVES = [
  { id: 'investor', name: 'Investor', icon: '📊', description: 'Risk/return, valuation, competitive moat' },
  { id: 'legal', name: 'Legal', icon: '⚖️', description: 'Compliance, liability, contract risk' },
  { id: 'strategy', name: 'Strategy', icon: '📈', description: 'Market position, competitive dynamics' },
]

export default function Home() {
  const [text, setText] = useState('')
  const [email, setEmail] = useState('')
  const [selectedPerspectives, setSelectedPerspectives] = useState<string[]>(['investor'])
  const [results, setResults] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const togglePerspective = (id: string) => {
    if (selectedPerspectives.includes(id)) {
      // Don't allow deselecting if it's the only one
      if (selectedPerspectives.length === 1) return
      setSelectedPerspectives(selectedPerspectives.filter(p => p !== id))
    } else {
      setSelectedPerspectives([...selectedPerspectives, id])
    }
  }

  const analyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    setLoading(true)
    setError('')
    setResults({})

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          email,
          perspectives: selectedPerspectives 
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResults(data.results)
      } else {
        setError(data.error || 'Analysis failed')
      }
    } catch (err) {
      setError('Network error - please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">
            Folding Vectors
          </h1>
          <p className="text-slate-400 text-lg">
            Fold complexity into clarity
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left: Input */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-slate-300 mb-3 text-sm font-medium">
                Select Perspectives
              </label>
              <div className="space-y-2">
                {PERSPECTIVES.map((perspective) => (
                  <button
                    key={perspective.id}
                    onClick={() => togglePerspective(perspective.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                      selectedPerspectives.includes(perspective.id)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{perspective.icon}</span>
                      <div className="flex-1">
                        <div className="font-semibold">{perspective.name}</div>
                        <div className="text-xs opacity-75 mt-1">
                          {perspective.description}
                        </div>
                      </div>
                      {selectedPerspectives.includes(perspective.id) && (
                        <span className="text-white">✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Document to Analyze
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your investment memo, contract, proposal, or any document..."
                className="w-full h-64 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
            </div>

            <button
              onClick={analyze}
              disabled={loading || !text.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              {loading 
                ? `Analyzing with ${selectedPerspectives.length} perspective${selectedPerspectives.length > 1 ? 's' : ''}...`
                : `Analyze (${selectedPerspectives.length} selected)`
              }
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-2">
            <label className="block text-slate-300 mb-3 text-sm font-medium">
              Analysis Results
            </label>

            {loading && (
              <div className="flex items-center justify-center h-96 bg-slate-800 border border-slate-700 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-400">
                    Analyzing from {selectedPerspectives.length} perspective{selectedPerspectives.length > 1 ? 's' : ''}...
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    This may take 10-30 seconds
                  </p>
                </div>
              </div>
            )}

            {Object.keys(results).length > 0 && !loading && (
              <div className="space-y-4">
                {selectedPerspectives.map((perspectiveId) => {
                  const perspective = PERSPECTIVES.find(p => p.id === perspectiveId)
                  const result = results[perspectiveId]
                  
                  if (!result) return null

                  return (
                    <div key={perspectiveId} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                      <div className="px-4 py-3 bg-slate-900 border-b border-slate-700 flex items-center gap-3">
                        <span className="text-2xl">{perspective?.icon}</span>
                        <div>
                          <div className="font-semibold text-white">{perspective?.name} Perspective</div>
                          <div className="text-xs text-slate-400">{perspective?.description}</div>
                        </div>
                      </div>
                      <div className="p-4">
                        <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                          {result}
                        </pre>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {Object.keys(results).length === 0 && !loading && (
              <div className="flex items-center justify-center h-96 bg-slate-800 border border-slate-700 rounded-lg">
                <div className="text-center text-slate-500">
                  <div className="text-4xl mb-4">📄</div>
                  <p>Results will appear here...</p>
                  <p className="text-sm mt-2">Select perspectives and paste a document to analyze</p>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-600 text-sm">
          <p>Powered by Claude Sonnet 4 • Built with Next.js • Multi-perspective analysis in seconds</p>
        </div>

      </div>
    </div>
  )
}