import { describe, expect, it } from 'vitest'
import { safeRetailerUrl } from './retailerLinks'

describe('safeRetailerUrl', () => {
  it('accepts tagged Amazon URLs and Amazon-issued short links', () => {
    expect(safeRetailerUrl('https://www.amazon.com/dp/B012345678?tag=wantcove-20')).toContain('tag=wantcove-20')
    expect(safeRetailerUrl('https://amzn.to/4fMjHIN')).toBe('https://amzn.to/4fMjHIN')
  })

  it('rejects untagged, deceptive, credentialed, and non-HTTPS destinations', () => {
    expect(safeRetailerUrl('https://www.amazon.com/dp/B012345678')).toBeUndefined()
    expect(safeRetailerUrl('https://amazon.com.example.com/item?tag=wantcove-20')).toBeUndefined()
    expect(safeRetailerUrl('https://user:pass@amazon.com/item?tag=wantcove-20')).toBeUndefined()
    expect(safeRetailerUrl('http://amazon.com/item?tag=wantcove-20')).toBeUndefined()
  })
})
