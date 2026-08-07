import type { Product } from '../../features/catalog/types'

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

export function parsePublicCatalogPayload(value: unknown): Product[] {
  let payload = value
  if (typeof payload === 'string') {
    try {
      payload = JSON.parse(payload) as unknown
    } catch {
      throw new Error('The public catalog returned invalid JSON.')
    }
  }

  if (payload == null) return []
  if (!Array.isArray(payload)) throw new Error('The public catalog returned an invalid product list.')
  return payload.map(parseProduct).filter((product): product is Product => product !== null)
}
