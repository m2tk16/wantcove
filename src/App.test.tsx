import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  window.history.replaceState({}, '', path)
  return render(<App />)
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
    renderAt('/admin')
    expect(await screen.findByRole('heading', { name: 'Admin sign in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in securely' })).toBeDisabled()
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })?.querySelector('a[href="/admin"]')).toBeNull()
  })

  it('keeps Terms and Privacy available from the footer without primary navigation links', () => {
    const view = renderAt('/terms')
    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument()
    expect(screen.getByText(/affiliate or referral code/i)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Legal' })).toBeInTheDocument()
    view.unmount()

    renderAt('/privacy')
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByText(/link-click and referral information/i)).toBeInTheDocument()
    expect(screen.getByText(/approximately 180 days/i)).toBeInTheDocument()
    expect(screen.getByText(/does not send WantCove a raw IP address/i)).toBeInTheDocument()
    expect(screen.getByText(/Public user registration is disabled/i)).toBeInTheDocument()
    expect(screen.getByText(/time-based one-time-password multifactor authentication/i)).toBeInTheDocument()
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
