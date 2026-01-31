'use client'

import { useState } from 'react'

export default function Home() {
  const [text, setText] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze')
      return
    }

    setLoading(true)
    setError('')
    setResult('')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, email })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.result)
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
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-2">
            Folding Vectors
          </h1>
          <p className="text-slate-400 text-lg">
            Multi-perspective document analysis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left: Input */}
          <div>
            <div className="mb-4">
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Your Email (optional)
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
              <label className="block text-slate-300 mb-2 text-sm font-medium">
                Document to Analyze
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your investment memo, contract, proposal, or any document..."
                className="w-full h-96 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono text-sm"
              />
            </div>

            <button
              onClick={analyze}
              disabled={loading || !text.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              {loading ? 'Analyzing...' : 'Analyze with Investor Perspective'}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right: Results */}
          <div>
            <label className="block text-slate-300 mb-2 text-sm font-medium">
              Analysis Results
            </label>
            <div className="h-[500px] px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg overflow-auto">
              {loading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Analyzing from investor perspective...</p>
                  </div>
                </div>
              )}

              {result && !loading && (
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                  {result}
                </pre>
              )}

              {!result && !loading && (
                <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                  Results will appear here...
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-600 text-sm">
          <p>Powered by Claude AI • Built with Next.js</p>
        </div>

      </div>
    </div>
  )
}