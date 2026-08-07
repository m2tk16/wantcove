export type ProductSlug = string

export type Product = {
  slug: ProductSlug
  name: string
  price?: string
  category: string
  image: string
  imageAlt?: string
  rating?: string
  description: string
  amazonAsin?: string
  retailerUrl?: string
  featuredRank?: number
  source?: 'fixture' | 'managed'
}
