import { useEffect } from 'react'
import type { ProductSlug } from '../catalog/types'
import { useLikes } from './LikesContext'

export function LikeButton({ productSlug, productName, className }: { productSlug: ProductSlug; productName: string; className?: string }) {
  const { getState, load, toggle } = useLikes()
  const state = getState(productSlug)

  useEffect(() => load(productSlug), [load, productSlug])

  return <button
    className={[className, state.liked ? 'liked' : ''].filter(Boolean).join(' ')}
    type="button"
    aria-label={`${state.liked ? 'Unlike' : 'Like'} ${productName}`}
    aria-pressed={state.liked}
    aria-busy={state.loading}
    disabled={state.loading}
    title={state.error}
    onClick={() => toggle(productSlug)}
  >
    <span aria-hidden="true">{state.liked ? '♥' : '♡'}</span>
  </button>
}
