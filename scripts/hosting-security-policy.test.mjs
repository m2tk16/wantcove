import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'
import { readHeaderValue, validateHostingSecurityPolicy } from './hosting-security-policy.mjs'

const currentPolicy = await readFile('customHttp.yml', 'utf8')

describe('Amplify Hosting security policy', () => {
  it('keeps the committed policy restrictive and complete', () => {
    expect(validateHostingSecurityPolicy(currentPolicy)).toEqual([])
    expect(readHeaderValue(currentPolicy, 'Content-Security-Policy')).toContain("img-src 'self' data:")
  })

  it('fails when a required boundary is removed', () => {
    const weakened = currentPolicy.replace("frame-ancestors 'none'; ", '')
    expect(validateHostingSecurityPolicy(weakened)).toContain("Content-Security-Policy is missing: frame-ancestors 'none'")
  })

  it('fails when inline scripts or external image origins are allowed', () => {
    const weakened = currentPolicy.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'")
      .replace("img-src 'self' data:", "img-src https: 'self' data:")
    expect(validateHostingSecurityPolicy(weakened)).toEqual(expect.arrayContaining([
      "Content-Security-Policy must not include: 'unsafe-inline'",
      'Content-Security-Policy must not include: img-src https:',
    ]))
  })
})
