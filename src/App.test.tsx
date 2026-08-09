import '@testing-library/jest-dom/vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import type { CatalogGateway } from './features/catalog/CatalogProvider'
import type { Product } from './features/catalog/types'

const testProducts: Product[] = [
  {
    slug: 'levitating-globe-lamp',
    name: 'Levitating Globe Lamp',
    description: 'A warm sculptural light with a magnetic floating globe that turns an ordinary desk into a conversation piece.',
    category: 'Gadgets',
    image: '/products/globe-lamp.png',
    imageAlt: 'Black levitating globe lamp in a warm room',
    price: '$79.99',
    rating: '4.8',
    featuredRank: 1,
  },
  {
    slug: 'adjustable-dumbbell-set',
    name: 'Adjustable Dumbbell Set',
    description: 'A compact strength setup with quick weight changes and a clean footprint for smaller workout spaces.',
    category: 'Fitness',
    image: '/products/adjustable-dumbbells.png',
    imageAlt: 'Adjustable black and red dumbbell set',
    price: '$299.99',
    rating: '4.7',
    featuredRank: 2,
  },
  {
    slug: 'portable-pizza-oven',
    name: 'Portable Pizza Oven',
    description: 'A tabletop outdoor oven designed for crisp, flame-kissed pizza without taking over the whole patio.',
    category: 'Outdoors',
    image: '/products/pizza-oven.png',
    imageAlt: 'Portable outdoor pizza oven',
    price: '$129.99',
    rating: '4.9',
    featuredRank: 3,
  },
  {
    slug: 'wireless-earbuds',
    name: 'Pearl Wireless Earbuds',
    description: 'Minimal everyday earbuds with a pocketable case, balanced sound, and a softly rounded fit.',
    category: 'Tech',
    image: '/products/wireless-earbuds.png',
    imageAlt: 'White wireless earbuds in their charging case',
    price: '$89.99',
    rating: '4.6',
    featuredRank: 4,
  },
]

const testCatalog: CatalogGateway = {
  isAvailable: false,
  list: async () => testProducts,
}

function renderAt(path: string) {
  window.history.replaceState({}, '', path)
  return render(<App catalog={testCatalog} initialProducts={testProducts} />)
}

function renderWithCatalog(path: string, catalog: CatalogGateway, initialProducts: Product[] = []) {
  window.history.replaceState({}, '', path)
  return render(<App catalog={catalog} initialProducts={initialProducts} />)
}

describe('WantCove discovery routes', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
    window.localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('renders the curated product home page', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: /cool stuff/i })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(8)
    expect(screen.getByRole('link', { name: /explore the find/i })).toHaveAttribute('href', '/products/levitating-globe-lamp')
    expect(screen.getAllByRole('img').every((image) => image.getAttribute('referrerpolicy') === 'no-referrer')).toBe(true)
  })

  it('renders a product detail route with disclosure', () => {
    renderAt('/products/adjustable-dumbbell-set')
    expect(screen.getByRole('heading', { name: 'Adjustable Dumbbell Set' })).toBeInTheDocument()
    expect(screen.getByText(/WantCove may earn a commission if you buy through them/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /view retailer/i })).toBeDisabled()
  })

  it('waits for the live catalog before deciding that a product deep link is missing', async () => {
    let resolveCatalog: (products: Product[]) => void = () => undefined
    const delayedCatalog: CatalogGateway = {
      isAvailable: true,
      list: () => new Promise((resolve) => { resolveCatalog = resolve }),
    }

    renderWithCatalog('/products/levitating-globe-lamp', delayedCatalog)

    expect(screen.getByRole('status')).toHaveTextContent(/finding that product/i)
    expect(screen.queryByRole('heading', { name: /wandered off/i })).not.toBeInTheDocument()

    await act(async () => { resolveCatalog(testProducts) })

    expect(await screen.findByRole('heading', { name: 'Levitating Globe Lamp' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /wandered off/i })).not.toBeInTheDocument()
  })

  it('shows catalog availability failures instead of misreporting a missing product', async () => {
    const unavailableCatalog: CatalogGateway = {
      isAvailable: true,
      list: async () => { throw new Error('offline') },
    }

    renderWithCatalog('/products/levitating-globe-lamp', unavailableCatalog)

    expect(await screen.findByRole('alert')).toHaveTextContent(/temporarily unavailable/i)
    expect(screen.queryByRole('heading', { name: /wandered off/i })).not.toBeInTheDocument()
  })

  it('renders a genuine product 404 only after the live catalog finishes loading', async () => {
    const emptyCatalog: CatalogGateway = {
      isAvailable: true,
      list: async () => [],
    }

    renderWithCatalog('/products/missing-product', emptyCatalog)

    expect(await screen.findByRole('heading', { name: /wandered off/i })).toBeInTheDocument()
  })

  it('opens and closes the accessible mobile menu', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }))
    expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /close menu/i }))
    expect(screen.queryByLabelText('Mobile navigation')).not.toBeInTheDocument()
  })

  it('provides category and not-found routes', () => {
    const view = renderAt('/categories')
    expect(screen.getByRole('heading', { name: 'Categories' })).toBeInTheDocument()
    view.unmount()
    renderAt('/missing')
    expect(screen.getByRole('heading', { name: /wandered off/i })).toBeInTheDocument()
  })

  it('keeps the admin route out of public navigation and closed without backend configuration', async () => {
    const view = renderAt('/admin')
    expect(await screen.findByRole('heading', { name: 'Admin sign in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in securely' })).toBeDisabled()
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', '/admin/forgot-password')
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })?.querySelector('a[href="/admin"]')).toBeNull()
    view.unmount()

    renderAt('/admin/forgot-password')
    expect(screen.getByRole('heading', { name: 'Administrator recovery' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Send recovery code' })).toBeDisabled()
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })?.querySelector('a[href="/admin/forgot-password"]')).toBeNull()
  })

  it('keeps Contact, Terms, and Privacy available from the footer without primary navigation links', () => {
    const contactView = renderAt('/contact')
    expect(screen.getByRole('heading', { name: 'Contact WantCove' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Email wantcove@gmail.com' })).toHaveAttribute('href', 'mailto:wantcove@gmail.com')
    expect(screen.getByText(/does not operate a website contact form/i)).toBeInTheDocument()
    expect(screen.getByText(/never ask you to send a password or multifactor-authentication code/i)).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })?.querySelector('a[href="/contact"]')).toBeNull()
    expect(screen.getByRole('navigation', { name: 'Legal and support' })).toBeInTheDocument()
    contactView.unmount()

    const view = renderAt('/terms')
    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument()
    expect(screen.getAllByText('As an Amazon Associate I earn from qualifying purchases.')).toHaveLength(2)
    expect(screen.getByText(/affiliate or referral code/i)).toBeInTheDocument()
    expect(screen.getByText(/Password recovery does not remove MFA/i)).toBeInTheDocument()
    expect(screen.getByText(/being developed from Tennessee, United States/i)).toBeInTheDocument()
    expect(screen.getByText(/WantCove is the recorded public operator name/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'wantcove@gmail.com' })).toHaveAttribute('href', 'mailto:wantcove@gmail.com')
    expect(screen.getByRole('navigation', { name: 'Legal and support' })).toBeInTheDocument()
    view.unmount()

    renderAt('/privacy')
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByText(/link-click and referral information/i)).toBeInTheDocument()
    expect(screen.getByText(/approximately 180 days/i)).toBeInTheDocument()
    expect(screen.getByText(/do not use a raw IP address as their application identifier/i)).toBeInTheDocument()
    expect(screen.getByText(/short-lived request counters/i)).toBeInTheDocument()
    expect(screen.getByText(/operational metrics do not include the guest identity, product identifier, or IP address/i)).toBeInTheDocument()
    expect(screen.getByText(/repeated attempts to save the same active like do not extend that period/i)).toBeInTheDocument()
    expect(screen.getByText(/Rate-limit counters are set to expire approximately 10 minutes/i)).toBeInTheDocument()
    expect(screen.getByText(/Public user registration is disabled/i)).toBeInTheDocument()
    expect(screen.getByText(/time-based one-time-password multifactor authentication/i)).toBeInTheDocument()
    expect(screen.getByText(/short-lived recovery codes and replacement passwords/i)).toBeInTheDocument()
    expect(screen.getByText(/being developed from Tennessee, United States/i)).toBeInTheDocument()
    expect(screen.getByText(/Google provides the Gmail service/i)).toBeInTheDocument()
    expect(screen.getByText(/Product images are served from WantCove's first-party `\/products\/` path/i)).toBeInTheDocument()
    expect(screen.getAllByText('August 8, 2026')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'wantcove@gmail.com' })).toHaveAttribute('href', 'mailto:wantcove@gmail.com')
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })?.querySelector('a[href="/privacy"]')).toBeNull()
  })

  it('offers explicit storage choices and keeps essential-only preferences session based', () => {
    renderAt('/')

    expect(screen.getByRole('dialog', { name: /your privacy choices/i })).toHaveTextContent(/do not use advertising cookies or your IP address/i)
    fireEvent.click(screen.getByRole('button', { name: /essential only/i }))

    expect(screen.queryByRole('dialog', { name: /your privacy choices/i })).not.toBeInTheDocument()
    expect(window.localStorage.getItem('wantcove-privacy-choice')).toBe('essential')
    expect(window.localStorage.getItem('wantcove-theme')).toBeNull()
  })

  it('switches between accessible high-contrast theme states', () => {
    renderAt('/')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')

    fireEvent.click(screen.getByRole('button', { name: /use dark theme/i }))
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(screen.getByRole('button', { name: /use light theme/i })).toBeInTheDocument()
  })

  it('keeps anonymous likes synchronized across repeated product cards in the session', () => {
    renderAt('/')
    fireEvent.click(screen.getByRole('button', { name: /essential only/i }))

    const likeButtons = screen.getAllByRole('button', { name: /like levitating globe lamp/i })
    fireEvent.click(likeButtons[0])

    expect(screen.getAllByRole('button', { name: /unlike levitating globe lamp/i })).toHaveLength(likeButtons.length)
  })
})
