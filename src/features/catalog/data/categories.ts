import type { Product } from '../types'

export const productCategories = ['Gadgets', 'Tech', 'Home', 'Kitchen', 'Fitness', 'Outdoors', 'Gaming', 'Gear', 'Fun & weird'] as const

export const categories = ['Trending', 'New arrivals', ...productCategories] as const

export function trackedProductCategories(products: readonly Pick<Product, 'category'>[]) {
  const tracked: string[] = [...productCategories]
  const normalized = new Set(tracked.map((category) => category.toLocaleLowerCase()))
  for (const product of products) {
    const category = product.category.trim()
    const key = category.toLocaleLowerCase()
    if (category && !normalized.has(key)) {
      tracked.push(category)
      normalized.add(key)
    }
  }
  return tracked
}

export function categorySlug(category: string) {
  return category
    .normalize('NFKD')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function categoryPath(category: string) {
  return `/categories/${categorySlug(category)}`
}
