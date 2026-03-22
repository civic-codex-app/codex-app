import { describe, it, expect } from 'vitest'
import {
  ISSUE_SUBTITLES,
  ISSUE_EXPLAINERS,
  getStanceContext,
} from '@/lib/data/educational-content'

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
]

describe('ISSUE_SUBTITLES', () => {
  it('has a subtitle for all 14 issues', () => {
    for (const slug of ALL_ISSUES) {
      expect(ISSUE_SUBTITLES[slug], `Missing subtitle for ${slug}`).toBeTruthy()
    }
  })

  it('subtitles are question-format strings', () => {
    for (const subtitle of Object.values(ISSUE_SUBTITLES)) {
      expect(subtitle.endsWith('?')).toBe(true)
    }
  })
})

describe('ISSUE_EXPLAINERS', () => {
  it('has an explainer for all 14 issues', () => {
    for (const slug of ALL_ISSUES) {
      expect(ISSUE_EXPLAINERS[slug], `Missing explainer for ${slug}`).toBeDefined()
    }
  })

  it('each explainer has all required fields', () => {
    for (const [slug, explainer] of Object.entries(ISSUE_EXPLAINERS)) {
      expect(explainer.description, `${slug} missing description`).toBeTruthy()
      expect(explainer.progressiveView, `${slug} missing progressiveView`).toBeTruthy()
      expect(explainer.conservativeView, `${slug} missing conservativeView`).toBeTruthy()
    }
  })
})

describe('getStanceContext', () => {
  it('returns progressive view for support stances', () => {
    const result = getStanceContext('healthcare-and-medicare', 'supports')
    expect(result).toBeTruthy()
    expect(result).toBe(ISSUE_EXPLAINERS['healthcare-and-medicare'].progressiveView)
  })

  it('returns conservative view for oppose stances', () => {
    const result = getStanceContext('healthcare-and-medicare', 'opposes')
    expect(result).toBeTruthy()
    expect(result).toBe(ISSUE_EXPLAINERS['healthcare-and-medicare'].conservativeView)
  })

  it('returns progressive for strongly_supports', () => {
    expect(getStanceContext('climate-and-environment', 'strongly_supports')).toBeTruthy()
  })

  it('returns conservative for strongly_opposes', () => {
    expect(getStanceContext('climate-and-environment', 'strongly_opposes')).toBeTruthy()
  })

  it('returns null for neutral/mixed/unknown', () => {
    expect(getStanceContext('healthcare-and-medicare', 'neutral')).toBeNull()
    expect(getStanceContext('healthcare-and-medicare', 'mixed')).toBeNull()
    expect(getStanceContext('healthcare-and-medicare', 'unknown')).toBeNull()
  })

  it('returns null for unknown issue slug', () => {
    expect(getStanceContext('fake-issue', 'supports')).toBeNull()
  })
})
