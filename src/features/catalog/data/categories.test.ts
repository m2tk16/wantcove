import { describe, expect, it } from 'vitest'
import { categoryPath, trackedProductCategories } from './categories'

describe('tracked product categories', () => {
  it('combines configured and live GraphQL product values without case duplicates', () => {
    const categories = trackedProductCategories([{ category: 'Automotive' }, { category: 'gadgets' }, { category: ' Automotive ' }])
    expect(categories).toContain('Gadgets')
    expect(categories).toContain('Automotive')
    expect(categories.filter((category) => category.toLocaleLowerCase() === 'automotive')).toHaveLength(1)
    expect(categoryPath('Fun & weird')).toBe('/categories/fun-weird')
  })
})
