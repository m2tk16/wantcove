import { createContext, useContext } from 'react'
import type { ProductSlug } from '../catalog/types'

export type LikeState = { liked: boolean; loading: boolean; loaded: boolean; source?: 'session' | 'cloud'; error?: string }
export type LikesContextValue = {
  getState: (slug: ProductSlug) => LikeState
  load: (slug: ProductSlug) => void
  toggle: (slug: ProductSlug) => void
}

export const LikesContext = createContext<LikesContextValue | null>(null)

export function useLikes() {
  const context = useContext(LikesContext)
  if (!context) throw new Error('useLikes must be used inside LikesProvider')
  return context
}
