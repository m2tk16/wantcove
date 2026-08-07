export type ProductSlug = 'levitating-globe-lamp' | 'adjustable-dumbbell-set' | 'portable-pizza-oven' | 'wireless-earbuds'

export type Product = {
  slug: ProductSlug
  name: string
  price: string
  category: string
  image: string
  rating: string
  description: string
}
