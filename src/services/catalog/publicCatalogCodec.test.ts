import { describe, expect, it } from 'vitest'
import { parsePublicCatalogPayload } from './publicCatalogCodec'

const publishedProduct = {
  slug: 'smart-reading-light',
  name: 'Smart Reading Light',
  description: 'A focused desk light with warm color modes.',
  category: 'Home',
  imageUrl: 'https://images.example.com/reading-light.jpg',
  imageAlt: 'Black reading light on a wooden desk',
  priceLabel: '$49.99',
  ratingLabel: '4.8',
  featuredRank: 4,
  amazonAsin: 'B012345678',
  retailerUrl: 'https://www.amazon.com/dp/B012345678',
}

describe('parsePublicCatalogPayload', () => {
  it('decodes the AWSJSON string returned by deployed AppSync queries', () => {
    expect(parsePublicCatalogPayload(JSON.stringify([publishedProduct]))).toEqual([{
      slug: publishedProduct.slug,
      name: publishedProduct.name,
      description: publishedProduct.description,
      category: publishedProduct.category,
      image: publishedProduct.imageUrl,
      imageAlt: publishedProduct.imageAlt,
      price: publishedProduct.priceLabel,
      rating: publishedProduct.ratingLabel,
      featuredRank: publishedProduct.featuredRank,
      source: 'managed',
    }])
  })

  it('accepts an already-decoded array and drops malformed records', () => {
    expect(parsePublicCatalogPayload([publishedProduct, { slug: 'missing-fields' }])).toHaveLength(1)
  })

  it('rejects malformed JSON instead of silently hiding managed products', () => {
    expect(() => parsePublicCatalogPayload('[invalid')).toThrow('invalid JSON')
  })
})
