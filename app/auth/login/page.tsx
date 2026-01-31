'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type AuthMode = 'magic' | 'password' | 'signup'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<AuthMode>('magic')
  const router = useRouter()

  const handleMagicLink = async (e: React.FormEvent) => {
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

      setMessage('Check your email for the magic link')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error sending magic link'
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing in'
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setMessage('Check your email to confirm your account')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing up'
      setMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error signing in with Google'
      setMessage(errorMessage)
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    if (mode === 'magic') {
      handleMagicLink(e)
    } else if (mode === 'password') {
      handlePasswordLogin(e)
    } else {
      handleSignUp(e)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex items-center justify-center p-8">
      <div className="max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light tracking-tight mb-1">
            Folding Vectors
          </h1>
          <p className="text-sm opacity-60">
            Sign in to start analyzing
          </p>
        </div>

        {/* Login Form */}
        <div className="border border-[var(--border)] rounded-md p-8">

          {/* Auth Mode Tabs */}
          <div className="flex border-b border-[var(--border)] mb-6">
            <button
              onClick={() => setMode('magic')}
              className={`flex-1 py-2 text-sm transition ${
                mode === 'magic'
                  ? 'border-b-2 border-[var(--text)] font-medium'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Magic Link
            </button>
            <button
              onClick={() => setMode('password')}
              className={`flex-1 py-2 text-sm transition ${
                mode === 'password'
                  ? 'border-b-2 border-[var(--text)] font-medium'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Password
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-sm transition ${
                mode === 'signup'
                  ? 'border-b-2 border-[var(--text)] font-medium'
                  : 'opacity-60 hover:opacity-100'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider mb-2 opacity-60">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                required
                className="w-full px-4 py-3 bg-transparent border border-[var(--border)] rounded-md text-[var(--text)] placeholder:opacity-40 focus:outline-none focus:ring-1 focus:ring-[var(--text)]"
              />
            </div>

            {(mode === 'password' || mode === 'signup') && (
              <div>
                <label className="block text-xs uppercase tracking-wider mb-2 opacity-60">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-transparent border border-[var(--border)] rounded-md text-[var(--text)] placeholder:opacity-40 focus:outline-none focus:ring-1 focus:ring-[var(--text)]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 font-medium"
            >
              {loading
                ? 'Loading...'
                : mode === 'magic'
                ? 'Send Magic Link'
                : mode === 'password'
                ? 'Sign In'
                : 'Create Account'
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-[var(--border)]" />
            <span className="text-xs opacity-40">or</span>
            <div className="flex-1 border-t border-[var(--border)]" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 border border-[var(--border)] rounded-md text-sm flex items-center justify-center gap-3 hover:opacity-60 transition disabled:opacity-40"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {message && (
            <div className="mt-4 p-4 border border-[var(--border)] rounded-md text-sm">
              {message}
            </div>
          )}

          {mode === 'magic' && (
            <div className="mt-6 text-center text-xs opacity-40">
              No password needed. We will email you a secure login link.
            </div>
          )}
        </div>

        {/* Back */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-sm opacity-60 hover:opacity-100 transition"
          >
            Back to home
          </button>
        </div>

      </div>
    </div>
  )
}
