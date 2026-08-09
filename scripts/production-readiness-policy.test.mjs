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
  it('keeps the current release blocked only on the remaining unresolved items', () => {
    expect(validateProductionReadiness(currentProfile)).toEqual([
      'The operator legal identity has not been reviewed.',
      'Jurisdiction-specific requirements have not been reviewed.',
      'Qualified legal review is not complete.',
      'Affiliate links cannot be enabled before affiliate launch approval.',
    ])
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
