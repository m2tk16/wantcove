import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { publicCatalogClient } from '../../services/catalog/publicCatalogClient'
import { CatalogContext } from './CatalogContext'
import { products as fixtureProducts } from './data/products'
import type { Product } from './types'

function mergeCatalog(managedProducts: Product[]) {
  const managedSlugs = new Set(managedProducts.map((product) => product.slug))
  return [...managedProducts, ...fixtureProducts.filter((product) => !managedSlugs.has(product.slug))]
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fixtureProducts)
  const [loading, setLoading] = useState(publicCatalogClient.isAvailable)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!publicCatalogClient.isAvailable) return
    let active = true
    void publicCatalogClient.list()
      .then((managedProducts) => {
        if (active) setProducts(mergeCatalog(managedProducts))
      })
      .catch(() => {
        if (active) setError('The live catalog is temporarily unavailable. Showing the curated starter collection.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [])

  const value = useMemo(() => ({ products, loading, error }), [error, loading, products])
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
