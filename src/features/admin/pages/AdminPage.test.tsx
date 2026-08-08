import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { AdminAuthGateway, AdminProduct, AdminProductGateway } from '../types'
import { AdminPage } from './AdminPage'

const product: AdminProduct = {
  slug: 'smart-reading-light',
  name: 'Smart Reading Light',
  description: 'A focused desk light with a flexible arm and warm color modes.',
  category: 'Home',
  imageUrl: '/products/reading-light.webp',
  imageAlt: 'Black reading light on a wooden desk',
  amazonAsin: 'B012345678',
  retailerUrl: 'https://www.amazon.com/dp/B012345678',
  featuredRank: 4,
  status: 'DRAFT',
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
}

function adminAuth(): AdminAuthGateway {
  return {
    isAvailable: true,
    current: vi.fn().mockResolvedValue({ email: 'admin@example.com', isAdmin: true }),
    signIn: vi.fn(),
    confirm: vi.fn(),
    signOut: vi.fn(),
  }
}

function catalog(products: AdminProduct[] = []): AdminProductGateway {
  return {
    list: vi.fn().mockResolvedValue(products),
    create: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    migrateStarters: vi.fn().mockResolvedValue(undefined),
    publish: vi.fn().mockResolvedValue(undefined),
    archive: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  }
}

describe('AdminPage', () => {
  it('does not call Cognito when Amplify outputs are unavailable', async () => {
    const current = vi.fn()
    const auth: AdminAuthGateway = {
      isAvailable: false,
      current,
      signIn: vi.fn(),
      confirm: vi.fn(),
      signOut: vi.fn(),
    }
    render(<AdminPage auth={auth} catalog={catalog()} />)

    expect(await screen.findByRole('heading', { name: 'Admin sign in' })).toBeInTheDocument()
    expect(current).not.toHaveBeenCalled()
  })

  it('completes the required TOTP challenge before showing the catalog', async () => {
    const auth: AdminAuthGateway = {
      isAvailable: true,
      current: vi.fn().mockResolvedValue(null),
      signIn: vi.fn().mockResolvedValue({ kind: 'totpCode' }),
      confirm: vi.fn().mockResolvedValue({ kind: 'signedIn', session: { email: 'admin@example.com', isAdmin: true } }),
      signOut: vi.fn(),
    }
    render(<AdminPage auth={auth} catalog={catalog()} />)

    fireEvent.change(await screen.findByLabelText('Email'), { target: { value: 'admin@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'temporary-password' } })
    fireEvent.click(screen.getByRole('button', { name: 'Sign in securely' }))

    fireEvent.change(await screen.findByLabelText('Six-digit code'), { target: { value: '123456' } })
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(await screen.findByText(/Signed in as/)).toHaveTextContent('admin@example.com')
    expect(auth.confirm).toHaveBeenCalledWith('123456')
  })

  it('creates drafts and never offers a status field in the editor', async () => {
    const productCatalog = catalog()
    render(<AdminPage auth={adminAuth()} catalog={productCatalog} />)

    fireEvent.change(await screen.findByLabelText('Slug'), { target: { value: product.slug } })
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: product.name } })
    fireEvent.change(screen.getByLabelText('Category'), { target: { value: product.category } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: product.description } })
    fireEvent.change(screen.getByLabelText('Image location'), { target: { value: product.imageUrl } })
    fireEvent.change(screen.getByLabelText('Image alt text'), { target: { value: product.imageAlt } })
    fireEvent.click(screen.getByRole('button', { name: 'Create draft' }))

    await waitFor(() => expect(productCatalog.create).toHaveBeenCalledWith(expect.objectContaining({
      slug: product.slug,
      name: product.name,
    })))
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Image location')).toHaveAttribute('pattern', expect.stringContaining('/products/'))
    expect(screen.getByText(/Product images must use a first-party \/products\//)).toBeInTheDocument()
  })

  it('offers the guarded starter migration and refreshes the catalog after it completes', async () => {
    const productCatalog = catalog()
    render(<AdminPage auth={adminAuth()} catalog={productCatalog} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Migrate starter catalog' }))

    await waitFor(() => expect(productCatalog.migrateStarters).toHaveBeenCalledOnce())
    expect(productCatalog.list).toHaveBeenCalledTimes(2)
    expect(screen.getByText(/Existing records will never be overwritten/)).toBeInTheDocument()
  })

  it('allows normal lifecycle actions for migrated starters after fixture removal', async () => {
    const starter = { ...product, slug: 'levitating-globe-lamp', status: 'PUBLISHED' as const }
    render(<AdminPage auth={adminAuth()} catalog={catalog([starter])} />)

    expect(await screen.findByRole('button', { name: 'Archive' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
    expect(screen.queryByText('Fallback protected')).not.toBeInTheDocument()
  })

  it('exposes edit, publish, and guarded delete actions to an authorized admin', async () => {
    const productCatalog = catalog([product])
    render(<AdminPage auth={adminAuth()} catalog={productCatalog} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('heading', { level: 2, name: product.name })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(productCatalog.update).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Publish' }))
    await waitFor(() => expect(productCatalog.publish).toHaveBeenCalledWith(product.slug))

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(productCatalog.remove).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))
    await waitFor(() => expect(productCatalog.remove).toHaveBeenCalledWith(product.slug))
  })
})
