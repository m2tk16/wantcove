const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export function validateProductionReadiness(profile) {
  const failures = []

  if (profile?.schemaVersion !== 1) failures.push('Production readiness schema version must be 1.')
  if (typeof profile?.operator?.publicName !== 'string' || profile.operator.publicName.trim() === '') {
    failures.push('A public operator name is required.')
  }
  if (profile?.operator?.legalIdentityStatus !== 'reviewed') {
    failures.push('The operator legal identity has not been reviewed.')
  }

  if (!EMAIL_PATTERN.test(profile?.contact?.plannedEmail ?? '')) {
    failures.push('A valid public contact email is required.')
  }
  if (profile?.contact?.verified !== true) failures.push('The public contact email has not been verified.')
  if (profile?.contact?.monitored !== true) failures.push('The public contact email is not recorded as monitored.')

  if (typeof profile?.jurisdiction?.country !== 'string' || profile.jurisdiction.country.trim() === '') {
    failures.push('A governing country is required.')
  }
  if (typeof profile?.jurisdiction?.region !== 'string' || profile.jurisdiction.region.trim() === '') {
    failures.push('A governing state or region is required.')
  }
  if (profile?.jurisdiction?.reviewStatus !== 'reviewed') {
    failures.push('Jurisdiction-specific requirements have not been reviewed.')
  }

  if (profile?.qualifiedLegalReview?.status !== 'complete') {
    failures.push('Qualified legal review is not complete.')
  } else if (!DATE_PATTERN.test(profile?.qualifiedLegalReview?.completedAt ?? '')) {
    failures.push('Completed legal review must include a YYYY-MM-DD date.')
  }

  if (profile?.affiliateLaunch?.linksEnabled === true && profile?.affiliateLaunch?.approved !== true) {
    failures.push('Affiliate links cannot be enabled before affiliate launch approval.')
  }

  return failures
}
