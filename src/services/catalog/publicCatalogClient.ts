import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'
import type { Product } from '../../features/catalog/types'
import { hasAmplifyConfiguration } from '../amplify/configureAmplify'

const client = hasAmplifyConfiguration
  ? generateClient<Schema>({ authMode: 'apiKey' })
  : null

function readString(record: Record<string, unknown>, key: string) {
  return typeof record[key] === 'string' ? record[key] : undefined
}

function parseProduct(value: unknown): Product | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const slug = readString(record, 'slug')
  const name = readString(record, 'name')
  const description = readString(record, 'description')
  const category = readString(record, 'category')
  const image = readString(record, 'imageUrl')
  if (!slug || !name || !description || !category || !image) return null

  return {
    slug,
    name,
    description,
    category,
    image,
    imageAlt: readString(record, 'imageAlt') ?? name,
    featuredRank: typeof record.featuredRank === 'number' ? record.featuredRank : undefined,
    source: 'managed',
  }
}

function requireClient() {
  if (!client) throw new Error('Amplify is not configured for this build.')
  return client
}

export const publicCatalogClient = {
  isAvailable: hasAmplifyConfiguration,
  async list(): Promise<Product[]> {
    const { data, errors } = await requireClient().queries.listPublishedProducts()
    if (errors?.length) throw new Error(errors[0].message)
    if (!Array.isArray(data)) return []
    return data.map(parseProduct).filter((product): product is Product => product !== null)
  },
}
