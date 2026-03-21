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

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-serif text-3xl">Create account</h1>
        <p className="text-sm text-[var(--codex-sub)]">Follow politicians and track legislation</p>
      </div>

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-3 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-3 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[var(--codex-sub)]">
          Password
        </label>
        <input
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

      <div className="text-center text-xs text-[var(--codex-sub)]">
        Already have an account?{' '}
        <Link href="/login" className="hover:text-[var(--codex-text)]">
          Sign in
        </Link>
      </div>
    </form>
  )
}
