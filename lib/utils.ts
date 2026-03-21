import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const fieldClass =
  'w-full border border-[var(--codex-input-border)] bg-[var(--codex-input-bg)] px-4 py-2.5 text-sm text-[var(--codex-text)] outline-none focus:border-[var(--codex-input-focus)]'

export const labelClass =
  'mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-[var(--codex-sub)]'
