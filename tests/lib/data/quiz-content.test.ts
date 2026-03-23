import { describe, it, expect } from 'vitest'
import { QUIZ_CONTENT } from '@/lib/data/quiz-content'

const ALL_ISSUES = [
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
  'reproductive-rights',
  'lgbtq-rights',
  'drug-policy',
  'voting-rights',
  'taxes-and-spending',
  'labor-and-unions',
  'privacy-and-surveillance',
  'trade-and-tariffs',
]

describe('QUIZ_CONTENT', () => {
  it('has content for all 22 issues', () => {
    for (const slug of ALL_ISSUES) {
      expect(QUIZ_CONTENT[slug], `Missing quiz content for ${slug}`).toBeDefined()
    }
  })

  it('each issue has a question', () => {
    for (const [slug, content] of Object.entries(QUIZ_CONTENT)) {
      expect(content.question, `${slug} missing question`).toBeTruthy()
      expect(content.question.endsWith('?'), `${slug} question should end with ?`).toBe(true)
    }
  })

  it('each issue has whyItMatters', () => {
    for (const [slug, content] of Object.entries(QUIZ_CONTENT)) {
      expect(content.whyItMatters, `${slug} missing whyItMatters`).toBeTruthy()
    }
  })

  it('each issue has supportsMeans and opposesMeans', () => {
    for (const [slug, content] of Object.entries(QUIZ_CONTENT)) {
      expect(content.supportsMeans, `${slug} missing supportsMeans`).toBeTruthy()
      expect(content.opposesMeans, `${slug} missing opposesMeans`).toBeTruthy()
    }
  })

  it('each issue has exactly 5 positions', () => {
    for (const [slug, content] of Object.entries(QUIZ_CONTENT)) {
      expect(content.positions, `${slug} should have 5 positions`).toHaveLength(5)
    }
  })

  it('positions span the full stance spectrum', () => {
    for (const [slug, content] of Object.entries(QUIZ_CONTENT)) {
      const stances = content.positions.map(p => p.stance)
      expect(stances, `${slug} missing strongly_supports`).toContain('strongly_supports')
      expect(stances, `${slug} missing supports`).toContain('supports')
      expect(stances, `${slug} missing neutral`).toContain('neutral')
      expect(stances, `${slug} missing opposes`).toContain('opposes')
      expect(stances, `${slug} missing strongly_opposes`).toContain('strongly_opposes')
    }
  })

  it('each position has label, description, and stance', () => {
    for (const [slug, content] of Object.entries(QUIZ_CONTENT)) {
      for (const pos of content.positions) {
        expect(pos.label, `${slug} position missing label`).toBeTruthy()
        expect(pos.description, `${slug} position missing description`).toBeTruthy()
        expect(pos.stance, `${slug} position missing stance`).toBeTruthy()
      }
    }
  })
})
