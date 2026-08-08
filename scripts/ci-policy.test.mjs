import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { validateCiPolicy } from './ci-policy.mjs'

const workflow = readFileSync('.github/workflows/ci.yml', 'utf8')

describe('CI branch policy', () => {
  it('protects Beta with the fast gate and Production with the full gate', () => {
    expect(validateCiPolicy(workflow)).toEqual([])
  })

  it('rejects removal of the Production full gate', () => {
    const weakened = workflow.replace('run: npm run check:full', 'run: npm run check:fast')
    expect(validateCiPolicy(weakened)).toContain('CI is missing Production full gate.')
  })

  it('rejects removal of the Production readiness gate', () => {
    const weakened = workflow.replace('run: npm run verify:release', 'run: npm run check:fast')
    expect(validateCiPolicy(weakened)).toContain('CI is missing Production readiness gate.')
  })

  it('rejects moving the Production readiness gate off main', () => {
    const weakened = workflow.replace(
      "if: github.base_ref == 'main' || github.ref == 'refs/heads/main'\n        run: npm run verify:release",
      "if: github.base_ref == 'beta' || github.ref == 'refs/heads/beta'\n        run: npm run verify:release",
    )
    expect(validateCiPolicy(weakened)).toContain('CI is missing Production readiness gate.')
  })

  it('rejects elevated or pull-request-target workflows', () => {
    const weakened = workflow
      .replace('contents: read', 'contents: write')
      .replace('pull_request:', 'pull_request_target:')
    expect(validateCiPolicy(weakened)).toContain('CI repository contents permission must remain read-only.')
    expect(validateCiPolicy(weakened)).toContain('CI must not use pull_request_target for untrusted changes.')
  })
})
