import { createContext, useContext } from 'react'
import type { Product } from './types'

export type CatalogContextValue = {
  products: Product[]
  loading: boolean
  error?: string
}

export const CatalogContext = createContext<CatalogContextValue | null>(null)

export function useCatalog() {
  const value = useContext(CatalogContext)
  if (!value) throw new Error('useCatalog must be used inside CatalogProvider.')
  return value
}
