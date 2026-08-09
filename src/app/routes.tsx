import { AdminPage } from '../features/admin/pages/AdminPage'
import { AdminPasswordRecoveryPage } from '../features/admin/pages/AdminPasswordRecoveryPage'
import { CategoriesPage } from '../features/catalog/pages/CategoriesPage'
import { CatalogListing, CategoryRoute, ProductRoute } from '../features/catalog/pages/CatalogRoutes'
import { HomePage } from '../features/catalog/pages/HomePage'
import { ContactPage } from '../features/contact/pages/ContactPage'
import { PrivacyPage } from '../features/legal/pages/PrivacyPage'
import { TermsPage } from '../features/legal/pages/TermsPage'
import { NotFoundPage } from '../shared/pages/NotFoundPage'

export function resolveRoute(path: string) {
  if (path.startsWith('/products/')) return <ProductRoute slug={path.slice('/products/'.length)} />
  if (path.startsWith('/categories/')) return <CategoryRoute slug={path.slice('/categories/'.length)} />

  switch (path) {
    case '/': return <HomePage />
    case '/categories': return <CategoriesPage />
    case '/new-arrivals': return <CatalogListing title="New arrivals" intro="The latest interesting things to land in the cove." mode="new" />
    case '/top-picks': return <CatalogListing title="Top picks" intro="The finds people keep coming back to." mode="all" />
    case '/deals': return <CatalogListing title="Deals worth seeing" intro="Useful things at prices worth a second look." mode="deals" />
    case '/admin': return <AdminPage />
    case '/admin/forgot-password': return <AdminPasswordRecoveryPage />
    case '/terms': return <TermsPage />
    case '/privacy': return <PrivacyPage />
    case '/contact': return <ContactPage />
    default: return <NotFoundPage />
  }
}
