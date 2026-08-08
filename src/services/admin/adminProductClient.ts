import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'
import type { AdminProduct, AdminProductGateway, ProductDraft, ProductStatus } from '../../features/admin/types'
import { hasAmplifyConfiguration } from '../amplify/configureAmplify'

const client = hasAmplifyConfiguration
  ? generateClient<Schema>({ authMode: 'userPool' })
  : null

function requireClient() {
  if (!client) throw new Error('Amplify is not configured for this build.')
  return client
}

function isStatus(value: unknown): value is ProductStatus {
  return value === 'DRAFT' || value === 'PUBLISHED' || value === 'ARCHIVED'
}

function parseProduct(value: unknown): AdminProduct | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  if (
    typeof record.slug !== 'string' ||
    typeof record.name !== 'string' ||
    typeof record.description !== 'string' ||
    typeof record.category !== 'string' ||
    typeof record.imageUrl !== 'string' ||
    typeof record.imageAlt !== 'string' ||
    !isStatus(record.status) ||
    typeof record.createdAt !== 'string' ||
    typeof record.updatedAt !== 'string'
  ) return null

  return {
    slug: record.slug,
    name: record.name,
    description: record.description,
    category: record.category,
    imageUrl: record.imageUrl,
    imageAlt: record.imageAlt,
    priceLabel: typeof record.priceLabel === 'string' ? record.priceLabel : undefined,
    ratingLabel: typeof record.ratingLabel === 'string' ? record.ratingLabel : undefined,
    amazonAsin: typeof record.amazonAsin === 'string' ? record.amazonAsin : undefined,
    retailerUrl: typeof record.retailerUrl === 'string' ? record.retailerUrl : undefined,
    featuredRank: typeof record.featuredRank === 'number' ? record.featuredRank : undefined,
    status: record.status,
    publishedAt: typeof record.publishedAt === 'string' ? record.publishedAt : undefined,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

function operationInput(product: ProductDraft) {
  return {
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    priceLabel: product.priceLabel,
    ratingLabel: product.ratingLabel,
    amazonAsin: product.amazonAsin,
    retailerUrl: product.retailerUrl,
    featuredRank: product.featuredRank,
  }
}

async function manage(action: 'PUBLISH' | 'ARCHIVE' | 'DELETE', slug: string) {
  const { errors } = await requireClient().mutations.manageProduct({ action, slug })
  if (errors?.length) throw new Error(errors[0].message)
}

export const adminProductClient: AdminProductGateway = {
  async list() {
    const { data, errors } = await requireClient().models.Product.list({ limit: 500 })
    if (errors?.length) throw new Error(errors[0].message)
    return data
      .map(parseProduct)
      .filter((product): product is AdminProduct => product !== null)
      .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  },
  async create(product) {
    const { errors } = await requireClient().mutations.manageProduct({ action: 'CREATE', ...operationInput(product) })
    if (errors?.length) throw new Error(errors[0].message)
  },
  async update(product) {
    const { errors } = await requireClient().mutations.manageProduct({ action: 'UPDATE', ...operationInput(product) })
    if (errors?.length) throw new Error(errors[0].message)
  },
  async migrateStarters() {
    const { errors } = await requireClient().mutations.migrateStarterProducts()
    if (errors?.length) throw new Error(errors[0].message)
  },
  publish: (slug) => manage('PUBLISH', slug),
  archive: (slug) => manage('ARCHIVE', slug),
  remove: (slug) => manage('DELETE', slug),
}
