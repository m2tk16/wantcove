import { generateClient } from 'aws-amplify/data'
import type { Schema } from '../../../amplify/data/resource'
import type { AdminContactGateway, AdminContactMessage } from '../../features/admin/types'
import { hasAmplifyConfiguration } from '../amplify/configureAmplify'

const client = hasAmplifyConfiguration ? generateClient<Schema>({ authMode: 'userPool' }) : null

function parsePayload(value: unknown) {
  let payload = value
  if (typeof payload === 'string') payload = JSON.parse(payload) as unknown
  if (!Array.isArray(payload)) throw new Error('The contact inbox returned invalid data.')
  return payload.flatMap((value): AdminContactMessage[] => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return []
    const record = value as Record<string, unknown>
    if (!['id', 'firstName', 'lastName', 'email', 'message', 'createdAt'].every((key) => typeof record[key] === 'string')) return []
    return [{
      id: record.id as string,
      firstName: record.firstName as string,
      lastName: record.lastName as string,
      email: record.email as string,
      phone: typeof record.phone === 'string' ? record.phone : undefined,
      message: record.message as string,
      createdAt: record.createdAt as string,
    }]
  })
}

export const adminContactClient: AdminContactGateway = {
  isAvailable: hasAmplifyConfiguration,
  async list() {
    if (!client) throw new Error('Contact inbox is unavailable in this build.')
    const { data, errors } = await client.queries.listContactMessages()
    if (errors?.length) throw new Error(errors[0].message)
    return parsePayload(data)
  },
  async remove(id) {
    if (!client) throw new Error('Contact inbox is unavailable in this build.')
    const { errors } = await client.mutations.deleteContactMessage({ id })
    if (errors?.length) throw new Error(errors[0].message)
  },
}
