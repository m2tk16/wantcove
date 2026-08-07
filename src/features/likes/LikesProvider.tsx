import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ProductSlug } from '../catalog/types'
import { usePrivacyPreferences } from '../privacy/PrivacyPreferencesContext'
import { productLikesClient } from '../../services/likes/productLikesClient'
import { LikesContext, type LikeState, type LikesContextValue } from './LikesContext'

const EMPTY_STATE: LikeState = { liked: false, loading: false, loaded: false }

export function LikesProvider({ children }: { children: ReactNode }) {
  const { choice } = usePrivacyPreferences()
  const [states, setStates] = useState<Partial<Record<ProductSlug, LikeState>>>({})
  const loading = useRef(new Set<ProductSlug>())

  const load = useCallback((slug: ProductSlug) => {
    const currentState = states[slug]
    const cloudEnabled = choice === 'preferences' && productLikesClient.isAvailable
    if ((currentState?.loaded && (!cloudEnabled || currentState.source === 'cloud')) || loading.current.has(slug)) return
    if (!cloudEnabled) {
      setStates((current) => ({ ...current, [slug]: { ...(current[slug] ?? EMPTY_STATE), loaded: true, source: 'session' } }))
      return
    }

    loading.current.add(slug)
    setStates((current) => ({ ...current, [slug]: { ...(current[slug] ?? EMPTY_STATE), loading: true } }))
    const operation = currentState?.source === 'session' && currentState.liked
      ? productLikesClient.set(slug, true)
      : productLikesClient.get(slug)
    void operation
      .then((liked) => setStates((current) => ({ ...current, [slug]: { liked, loading: false, loaded: true, source: 'cloud' } })))
      .catch(() => setStates((current) => ({ ...current, [slug]: { ...(current[slug] ?? EMPTY_STATE), loading: false, loaded: true, source: 'session', error: 'Cloud sync is unavailable; this like is session-only.' } })))
      .finally(() => loading.current.delete(slug))
  }, [choice, states])

  const toggle = useCallback((slug: ProductSlug) => {
    const liked = !(states[slug]?.liked ?? false)
    setStates((current) => ({ ...current, [slug]: { liked, loading: false, loaded: true, source: choice === 'preferences' && productLikesClient.isAvailable ? 'cloud' : 'session' } }))

    if (choice === 'preferences' && productLikesClient.isAvailable) {
      void productLikesClient.set(slug, liked)
        .catch(() => setStates((current) => ({ ...current, [slug]: { liked, loading: false, loaded: true, source: 'session', error: 'Cloud sync is unavailable; this like is session-only.' } })))
    }
  }, [choice, states])

  const value = useMemo<LikesContextValue>(() => ({
    getState: (slug) => states[slug] ?? EMPTY_STATE,
    load,
    toggle,
  }), [load, states, toggle])

  return <LikesContext.Provider value={value}>{children}</LikesContext.Provider>
}
