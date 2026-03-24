'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Create account</h1>
        <p className="text-sm text-[var(--codex-sub)]">Follow politicians and track legislation</p>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="signup-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">
          Name
        </label>
        <input
          id="signup-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-3 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]"
        />
      </div>

      <div>
        <label htmlFor="signup-email" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">
          Email
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-3 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]"
        />
      </div>

      <div>
        <label htmlFor="signup-password" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-3 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Creating account...' : 'Create account'}
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-[var(--codex-border)]" />
        <span className="text-[11px] text-[var(--codex-faint)]">or</span>
        <div className="h-px flex-1 bg-[var(--codex-border)]" />
      </div>

      <button
        type="button"
        onClick={async () => {
          const supabase = createClient()
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/auth/callback` },
          })
        }}
        className="flex w-full items-center justify-center gap-3 rounded-md border border-[var(--codex-border)] bg-[var(--codex-card)] px-4 py-3 text-sm text-[var(--codex-text)] transition-colors hover:bg-[var(--codex-hover)]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </button>

      <div className="text-center text-xs text-[var(--codex-sub)]">
        Already have an account?{' '}
        <Link href="/login" className="hover:text-[var(--codex-text)]">
          Sign in
        </Link>
      </div>
    </form>
  )
}
