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

  it('rejects elevated or pull-request-target workflows', () => {
    const weakened = workflow
      .replace('contents: read', 'contents: write')
      .replace('pull_request:', 'pull_request_target:')
    expect(validateCiPolicy(weakened)).toContain('CI repository contents permission must remain read-only.')
    expect(validateCiPolicy(weakened)).toContain('CI must not use pull_request_target for untrusted changes.')
  })
})
