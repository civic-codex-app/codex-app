import { describe, it, expect } from 'vitest'
import { MESSAGE_TEMPLATES, type MessageTemplate } from '@/lib/data/message-templates'

const EXPECTED_ISSUES = [
  'economy-and-jobs',
  'healthcare-and-medicare',
  'immigration-and-border-security',
  'education-and-student-debt',
  'national-defense-and-military',
  'climate-and-environment',
  'criminal-justice-reform',
  'foreign-policy-and-diplomacy',
  'technology-and-ai-regulation',
  'social-security-and-medicare',
  'gun-policy-and-2nd-amendment',
  'infrastructure-and-transportation',
  'housing-and-affordability',
  'energy-policy-and-oil-gas',
]

describe('MESSAGE_TEMPLATES', () => {
  it('has templates for all 14 issues', () => {
    for (const slug of EXPECTED_ISSUES) {
      expect(MESSAGE_TEMPLATES[slug]).toBeDefined()
      expect(MESSAGE_TEMPLATES[slug].length).toBeGreaterThanOrEqual(1)
    }
  })

  it('each template has required fields', () => {
    for (const [slug, templates] of Object.entries(MESSAGE_TEMPLATES)) {
      for (const t of templates) {
        expect(t.id, `${slug} template missing id`).toBeTruthy()
        expect(t.subject, `${slug} template missing subject`).toBeTruthy()
        expect(t.body, `${slug} template missing body`).toBeTruthy()
        expect(t.label, `${slug} template missing label`).toBeTruthy()
        expect(['formal', 'personal']).toContain(t.tone)
      }
    }
  })

  it('all templates contain {name} placeholder', () => {
    for (const [slug, templates] of Object.entries(MESSAGE_TEMPLATES)) {
      for (const t of templates) {
        expect(t.body, `${slug}/${t.id} missing {name}`).toContain('{name}')
      }
    }
  })

  it('all templates contain {state} placeholder', () => {
    for (const [slug, templates] of Object.entries(MESSAGE_TEMPLATES)) {
      for (const t of templates) {
        expect(t.body, `${slug}/${t.id} missing {state}`).toContain('{state}')
      }
    }
  })

  it('template IDs are unique across all issues', () => {
    const allIds: string[] = []
    for (const templates of Object.values(MESSAGE_TEMPLATES)) {
      for (const t of templates) {
        allIds.push(t.id)
      }
    }
    expect(new Set(allIds).size).toBe(allIds.length)
  })

  it('each issue has at least one formal template', () => {
    for (const [slug, templates] of Object.entries(MESSAGE_TEMPLATES)) {
      const hasFormal = templates.some(t => t.tone === 'formal')
      expect(hasFormal, `${slug} has no formal template`).toBe(true)
    }
  })
})
