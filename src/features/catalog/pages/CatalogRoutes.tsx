import { useCatalog } from '../CatalogContext'
import { NotFoundPage } from '../../../shared/pages/NotFoundPage'
import { ListingPage } from './ListingPage'
import { ProductDetailPage } from './ProductDetailPage'

export function ProductRoute({ slug }: { slug: string }) {
  const { products } = useCatalog()
  const product = products.find((item) => item.slug === slug)
  return product ? <ProductDetailPage product={product} /> : <NotFoundPage />
}

export function CatalogListing({ title, intro, mode }: { title: string; intro: string; mode: 'new' | 'all' | 'deals' }) {
  const { products } = useCatalog()
  const items = mode === 'new' ? [...products].reverse() : mode === 'deals' ? products.slice(0, 2) : products
  return <ListingPage title={title} intro={intro} items={items} />
}
