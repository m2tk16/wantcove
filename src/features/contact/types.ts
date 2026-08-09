export type ContactDraft = {
  firstName: string
  lastName: string
  email: string
  phone?: string
  message: string
  website?: string
}

export type ContactSubmissionGateway = {
  isAvailable: boolean
  submit(draft: ContactDraft): Promise<void>
}
