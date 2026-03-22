import { describe, it, expect } from 'vitest'
import { cn, slugify } from '@/lib/utils'

describe('slugify', () => {
  it('converts a name to lowercase slug', () => {
    expect(slugify('John Smith')).toBe('john-smith')
  })

  it('strips special characters', () => {
    expect(slugify("O'Brien")).toBe('o-brien')
    expect(slugify('Smith, Jr.')).toBe('smith-jr')
  })

  it('collapses multiple dashes', () => {
    expect(slugify('A -- B')).toBe('a-b')
  })

  it('removes leading/trailing dashes', () => {
    expect(slugify('  Hello World  ')).toBe('hello-world')
    expect(slugify('--test--')).toBe('test')
  })

  it('handles empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('handles already-slugified string', () => {
    expect(slugify('already-slug')).toBe('already-slug')
  })

  it('handles numbers', () => {
    expect(slugify('District 5')).toBe('district-5')
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', true && 'visible')).toBe('base visible')
  })

  it('deduplicates tailwind classes (tailwind-merge)', () => {
    // tailwind-merge should resolve px-4 vs px-2 to px-2
    expect(cn('px-4', 'px-2')).toBe('px-2')
  })

  it('handles empty/null/undefined', () => {
    expect(cn('', null, undefined, 'foo')).toBe('foo')
  })
})
