import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useCatalog } from './CatalogContext'
import { CatalogProvider, type CatalogGateway } from './CatalogProvider'
import type { Product } from './types'

const initialProduct: Product = {
  slug: 'fixture-only-product',
  name: 'Fixture-only product',
  description: 'A test-only record that must disappear after the live catalog responds.',
  category: 'Tests',
  image: '/products/fixture-only.png',
}

const managedProduct: Product = {
  slug: 'managed-product',
  name: 'Managed product',
  description: 'A managed GraphQL record used to prove live replacement behavior.',
  category: 'Tests',
  image: '/products/managed.png',
}

function CatalogProbe() {
  const { products, loading, error } = useCatalog()
  return <div>
    <span>{loading ? 'loading' : 'ready'}</span>
    {error ? <span>{error}</span> : null}
    {products.map(({ slug }) => <span key={slug}>{slug}</span>)}
  </div>
}

function gateway(list: CatalogGateway['list']): CatalogGateway {
  return { isAvailable: true, list }
}

describe('CatalogProvider', () => {
  it('replaces initial test data with the managed GraphQL catalog instead of merging it', async () => {
    const list = vi.fn().mockResolvedValue([managedProduct])
    render(<CatalogProvider catalog={gateway(list)} initialProducts={[initialProduct]}><CatalogProbe /></CatalogProvider>)

    expect(screen.getByText('fixture-only-product')).toBeInTheDocument()
    expect(await screen.findByText('managed-product')).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('fixture-only-product')).not.toBeInTheDocument())
    expect(list).toHaveBeenCalledOnce()
  })

  it('fails closed when the managed GraphQL catalog cannot be read', async () => {
    const list = vi.fn().mockRejectedValue(new Error('network unavailable'))
    render(<CatalogProvider catalog={gateway(list)} initialProducts={[initialProduct]}><CatalogProbe /></CatalogProvider>)

    expect(await screen.findByText(/live catalog is temporarily unavailable/i)).toBeInTheDocument()
    expect(screen.queryByText('fixture-only-product')).not.toBeInTheDocument()
    expect(screen.getByText('ready')).toBeInTheDocument()
  })
})
