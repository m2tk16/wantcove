import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'
import type { Product } from '../../features/catalog/types'
import { hasAmplifyConfiguration } from '../amplify/configureAmplify'
import { parsePublicCatalogPayload } from './publicCatalogCodec'

const client = hasAmplifyConfiguration
  ? generateClient<Schema>({ authMode: 'apiKey' })
  : null

function requireClient() {
  if (!client) throw new Error('Amplify is not configured for this build.')
  return client
}

export const publicCatalogClient = {
  isAvailable: hasAmplifyConfiguration,
  async list(): Promise<Product[]> {
    const { data, errors } = await requireClient().queries.listPublishedProducts()
    if (errors?.length) throw new Error(errors[0].message)
    return parsePublicCatalogPayload(data)
  },
}
