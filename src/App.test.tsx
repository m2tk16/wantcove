import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  window.history.replaceState({}, '', path)
  return render(<App />)
}

describe('WantCove discovery routes', () => {
  beforeEach(() => window.history.replaceState({}, '', '/'))

  it('renders the curated product home page', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { name: /cool stuff/i })).toBeInTheDocument()
    expect(screen.getAllByRole('article')).toHaveLength(8)
    expect(screen.getByRole('link', { name: /explore the find/i })).toHaveAttribute('href', '/products/levitating-globe-lamp')
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

  it('keeps Terms and Privacy available from the footer without primary navigation links', () => {
    const view = renderAt('/terms')
    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument()
    expect(screen.getByText(/affiliate or referral code/i)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Legal' })).toBeInTheDocument()
    view.unmount()

    renderAt('/privacy')
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByText(/link-click and referral information/i)).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })?.querySelector('a[href="/privacy"]')).toBeNull()
  })
})
