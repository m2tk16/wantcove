import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'
import type { ContactSubmissionGateway } from '../../features/contact/types'
import { hasAmplifyConfiguration } from '../amplify/configureAmplify'

const client = hasAmplifyConfiguration
  ? generateClient<Schema>({ authMode: 'identityPool' })
  : null

export const contactSubmissionClient: ContactSubmissionGateway = {
  isAvailable: hasAmplifyConfiguration,
  async submit(draft) {
    if (!client) throw new Error('Contact messaging is not available in this build.')
    const { data, errors } = await client.mutations.submitContactMessage(draft)
    if (errors?.length) throw new Error(errors[0].message)
    if (!data) throw new Error('Your message could not be accepted. Please try again.')
  },
}
