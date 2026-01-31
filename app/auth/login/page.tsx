'use client'

import type { User } from '@supabase/supabase-js'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setMessage('Check your email for the magic link!')
    } catch (error: any) {
      setMessage(error.message || 'Error sending magic link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Folding Vectors
          </h1>
          <p className="text-slate-400">
            Sign in to start analyzing
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-lg text-sm ${
              message.includes('Check your email') 
                ? 'bg-green-900/50 border border-green-700 text-green-200'
                : 'bg-red-900/50 border border-red-700 text-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-500">
            No password needed. We'll email you a secure login link.
          </div>
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-slate-400 hover:text-slate-300 text-sm transition"
          >
            ← Back to home
          </button>
        </div>

      </div>
    </div>
  )
}