import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ProductSlug } from '../catalog/types'
import { usePrivacyPreferences } from '../privacy/PrivacyPreferencesContext'
import { productLikesClient } from '../../services/likes/productLikesClient'
import { LikesContext, type LikeState, type LikesContextValue } from './LikesContext'

const EMPTY_STATE: LikeState = { liked: false, loading: false, loaded: false }

export type ProductLikesGateway = {
  isAvailable: boolean
  get(productSlug: ProductSlug): Promise<boolean>
  set(productSlug: ProductSlug, liked: boolean): Promise<boolean>
}

export function LikesProvider({ children, likes = productLikesClient }: { children: ReactNode; likes?: ProductLikesGateway }) {
  const { choice } = usePrivacyPreferences()
  const [states, setStates] = useState<Partial<Record<ProductSlug, LikeState>>>({})
  const statesRef = useRef(states)
  const loading = useRef(new Set<ProductSlug>())
  statesRef.current = states

  const load = useCallback((slug: ProductSlug) => {
    const currentState = statesRef.current[slug]
    const cloudEnabled = choice === 'preferences' && likes.isAvailable
    if ((currentState?.loaded && (!cloudEnabled || currentState.source === 'cloud')) || loading.current.has(slug)) return
    if (!cloudEnabled) {
      setStates((current) => ({ ...current, [slug]: { ...(current[slug] ?? EMPTY_STATE), loaded: true, source: 'session' } }))
      return
    }

    loading.current.add(slug)
    setStates((current) => ({ ...current, [slug]: { ...(current[slug] ?? EMPTY_STATE), loading: true } }))
    const operation = currentState?.source === 'session' && currentState.liked
      ? likes.set(slug, true)
      : likes.get(slug)
    void operation
      .then((liked) => setStates((current) => ({ ...current, [slug]: { liked, loading: false, loaded: true, source: 'cloud' } })))
      .catch(() => setStates((current) => ({ ...current, [slug]: { ...(current[slug] ?? EMPTY_STATE), loading: false, loaded: true, source: 'session', error: 'Cloud sync is unavailable; this like is session-only.' } })))
      .finally(() => loading.current.delete(slug))
  }, [choice, likes])

  const toggle = useCallback((slug: ProductSlug) => {
    if (loading.current.has(slug)) return
    const liked = !(statesRef.current[slug]?.liked ?? false)
    const cloudEnabled = choice === 'preferences' && likes.isAvailable
    setStates((current) => ({ ...current, [slug]: { liked, loading: cloudEnabled, loaded: true, source: cloudEnabled ? 'cloud' : 'session' } }))

    if (cloudEnabled) {
      loading.current.add(slug)
      void likes.set(slug, liked)
        .then((savedLike) => setStates((current) => ({ ...current, [slug]: { liked: savedLike, loading: false, loaded: true, source: 'cloud' } })))
        .catch(() => setStates((current) => ({ ...current, [slug]: { liked, loading: false, loaded: true, source: 'session', error: 'Cloud sync is unavailable; this like is session-only.' } })))
        .finally(() => loading.current.delete(slug))
    }
  }, [choice, likes])

  const value = useMemo<LikesContextValue>(() => ({
    getState: (slug) => states[slug] ?? EMPTY_STATE,
    load,
    toggle,
  }), [load, states, toggle])

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>
}
