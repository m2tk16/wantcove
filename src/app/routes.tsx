import { CategoriesPage } from '../features/catalog/pages/CategoriesPage'
import { HomePage } from '../features/catalog/pages/HomePage'
import { ListingPage } from '../features/catalog/pages/ListingPage'
import { ProductDetailPage } from '../features/catalog/pages/ProductDetailPage'
import { products } from '../features/catalog/data/products'
import { PrivacyPage } from '../features/legal/pages/PrivacyPage'
import { TermsPage } from '../features/legal/pages/TermsPage'
import { NotFoundPage } from '../shared/pages/NotFoundPage'

export function resolveRoute(path: string) {
  const product = products.find((item) => path === `/products/${item.slug}`)
  if (product) return <ProductDetailPage product={product} />

  switch (path) {
    case '/': return <HomePage />
    case '/categories': return <CategoriesPage />
    case '/new-arrivals': return <ListingPage title="New arrivals" intro="The latest interesting things to land in the cove." items={[products[2], products[3], products[0], products[1]]} />
    case '/top-picks': return <ListingPage title="Top picks" intro="The finds people keep coming back to." items={products} />
    case '/deals': return <ListingPage title="Deals worth seeing" intro="Useful things at prices worth a second look." items={[products[0], products[3]]} />
    case '/terms': return <TermsPage />
    case '/privacy': return <PrivacyPage />
    default: return <NotFoundPage />
  }
}
