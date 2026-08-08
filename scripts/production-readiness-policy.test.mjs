import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { validateProductionReadiness } from './production-readiness-policy.mjs'

const currentProfile = JSON.parse(readFileSync('.agents/PRODUCTION_READINESS.json', 'utf8'))

function readyProfile() {
  return {
    schemaVersion: 1,
    operator: { publicName: 'WantCove', legalIdentityStatus: 'reviewed' },
    contact: { plannedEmail: 'support@example.com', verified: true, monitored: true },
    jurisdiction: { country: 'United States', region: 'Tennessee', reviewStatus: 'reviewed' },
    qualifiedLegalReview: { status: 'complete', completedAt: '2026-08-07' },
    affiliateLaunch: { approved: false, linksEnabled: false },
  }
}

describe('Production readiness policy', () => {
  it('keeps the current release blocked on every unresolved owner-supplied item', () => {
    expect(validateProductionReadiness(currentProfile)).toEqual(expect.arrayContaining([
      'The operator legal identity has not been reviewed.',
      'The public contact email has not been verified.',
      'The public contact email is not recorded as monitored.',
      'Jurisdiction-specific requirements have not been reviewed.',
      'Qualified legal review is not complete.',
    ]))
  })

  it('accepts a complete noncommercial Production Preview profile', () => {
    expect(validateProductionReadiness(readyProfile())).toEqual([])
  })

  it('rejects affiliate links without a separate launch approval', () => {
    const profile = readyProfile()
    profile.affiliateLaunch.linksEnabled = true
    expect(validateProductionReadiness(profile)).toContain('Affiliate links cannot be enabled before affiliate launch approval.')
  })
})
