import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { publicCatalogClient } from '../../services/catalog/publicCatalogClient'
import { CatalogContext } from './CatalogContext'
import type { Product } from './types'

export type CatalogGateway = {
  isAvailable: boolean
  list(): Promise<Product[]>
}

export function CatalogProvider({
  children,
  catalog = publicCatalogClient,
  initialProducts = [],
}: {
  children: ReactNode
  catalog?: CatalogGateway
  initialProducts?: Product[]
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(catalog.isAvailable)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!catalog.isAvailable) return
    let active = true
    void catalog.list()
      .then((managedProducts) => {
        if (active) {
          setProducts(managedProducts)
          setError(undefined)
        }
      })
      .catch(() => {
        if (active) {
          setProducts([])
          setError('The live catalog is temporarily unavailable. Please try again soon.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [catalog])

  const value = useMemo(() => ({ products, loading, error }), [error, loading, products])
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}
