import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'
import type { ProductSlug } from '../../features/catalog/types'
import { hasAmplifyConfiguration } from '../amplify/configureAmplify'

const client = hasAmplifyConfiguration
  ? generateClient<Schema>({ authMode: 'identityPool' })
  : null

function requireClient() {
  if (!client) {
    throw new Error('Amplify is not configured for this build.')
  }

  return client
}

export const productLikesClient = {
  isAvailable: hasAmplifyConfiguration,
  async get(productSlug: ProductSlug) {
    const { data, errors } = await requireClient().queries.getViewerProductLike({ productSlug })
    if (errors?.length) throw new Error(errors[0].message)
    return data
  },
  async set(productSlug: ProductSlug, liked: boolean) {
    const { data, errors } = await requireClient().mutations.setViewerProductLike({ productSlug, liked })
    if (errors?.length) throw new Error(errors[0].message)
    return data
  },
}
