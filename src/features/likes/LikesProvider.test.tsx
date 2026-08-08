import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
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

  it('blocks repeat cloud mutations until the in-flight write settles', async () => {
    let resolveSet: ((liked: boolean) => void) | undefined
    const set = vi.fn(() => new Promise<boolean>((resolve) => {
      resolveSet = resolve
    }))
    const likes: ProductLikesGateway = {
      isAvailable: true,
      get: vi.fn().mockResolvedValue(false),
      set,
    }

    render(<PrivacyPreferencesProvider><LikesProvider likes={likes}>
      <LikeButton productSlug="levitating-globe-lamp" productName="Levitating Globe Lamp" />
    </LikesProvider></PrivacyPreferencesProvider>)

    const button = await screen.findByRole('button', { name: 'Like Levitating Globe Lamp' })
    await waitFor(() => expect(button).toBeEnabled())
    fireEvent.click(button)
    fireEvent.click(button)

    expect(set).toHaveBeenCalledOnce()
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')

    await act(async () => resolveSet?.(true))
    await waitFor(() => expect(button).toBeEnabled())
    expect(button).toHaveAccessibleName('Unlike Levitating Globe Lamp')
  })
})
