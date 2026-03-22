'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--codex-sub)] transition-colors hover:text-[var(--codex-text)] print:hidden"
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      &larr; Back
    </button>
  )
}
