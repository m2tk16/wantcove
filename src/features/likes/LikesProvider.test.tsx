import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PrivacyPreferencesProvider } from '../privacy/PrivacyPreferencesProvider'
import { LikeButton } from './LikeButton'
import { LikesProvider, type ProductLikesGateway } from './LikesProvider'

describe('LikesProvider', () => {
  beforeEach(() => {
    window.localStorage.setItem('wantcove-privacy-choice', 'preferences')
  })

  it('deduplicates repeated cards and does not retry-loop after cloud sync fails', async () => {
    const get = vi.fn().mockRejectedValue(new Error('identity unavailable'))
    const likes: ProductLikesGateway = {
      isAvailable: true,
      get,
      set: vi.fn(),
    }

    render(<PrivacyPreferencesProvider><LikesProvider likes={likes}>
      <LikeButton productSlug="levitating-globe-lamp" productName="Levitating Globe Lamp" />
      <LikeButton productSlug="levitating-globe-lamp" productName="Levitating Globe Lamp" />
    </LikesProvider></PrivacyPreferencesProvider>)

    await waitFor(() => {
      for (const button of screen.getAllByRole('button')) {
        expect(button).toHaveAttribute('title', 'Cloud sync is unavailable; this like is session-only.')
      }
    })
    await new Promise((resolve) => window.setTimeout(resolve, 25))
    expect(get).toHaveBeenCalledOnce()
  })
})
