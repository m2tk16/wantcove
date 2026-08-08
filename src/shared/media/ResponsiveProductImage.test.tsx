import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ResponsiveProductImage } from './ResponsiveProductImage'

describe('ResponsiveProductImage', () => {
  it('maps a legacy catalog path to first-party AVIF and WebP variants', () => {
    const { container } = render(<ResponsiveProductImage alt="Globe lamp" sizes="50vw" src="/products/globe-lamp.png" />)
    const image = screen.getByRole('img', { name: 'Globe lamp' })
    const avif = container.querySelector('source[type="image/avif"]')

    expect(avif).toHaveAttribute('srcset', expect.stringContaining('/products/globe-lamp-1440.avif 1440w'))
    expect(image).toHaveAttribute('src', '/products/globe-lamp-1440.webp')
    expect(image).toHaveAttribute('srcset', expect.stringContaining('/products/globe-lamp-480.webp 480w'))
    expect(image).toHaveAttribute('sizes', '50vw')
    expect(image).toHaveAttribute('referrerpolicy', 'no-referrer')
  })

  it('preserves the picture sizing contract for an unknown first-party path without inventing variants', () => {
    const { container } = render(<ResponsiveProductImage alt="New product" loading="lazy" pictureClassName="admin-product-picture" src="/products/new-product.webp" />)
    const image = screen.getByRole('img', { name: 'New product' })
    const picture = container.querySelector('picture.admin-product-picture')

    expect(picture).toContainElement(image)
    expect(container.querySelector('source')).toBeNull()
    expect(image).toHaveAttribute('src', '/products/new-product.webp')
    expect(image).not.toHaveAttribute('srcset')
  })
})
