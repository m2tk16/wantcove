export type AdminSession = {
  email: string
  isAdmin: boolean
}

export type AdminAuthStep =
  | { kind: 'signedIn'; session: AdminSession }
  | { kind: 'newPassword' }
  | { kind: 'totpSetup'; sharedSecret: string; setupUri: string }
  | { kind: 'totpCode' }
  | { kind: 'unsupported'; message: string }

export type AdminAuthGateway = {
  isAvailable: boolean
  current(): Promise<AdminSession | null>
  signIn(email: string, password: string): Promise<AdminAuthStep>
  confirm(challengeResponse: string): Promise<AdminAuthStep>
  signOut(): Promise<void>
}

export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export type AdminProduct = {
  slug: string
  name: string
  description: string
  category: string
  imageUrl: string
  imageAlt: string
  priceLabel?: string
  ratingLabel?: string
  amazonAsin?: string
  retailerUrl?: string
  featuredRank?: number
  status: ProductStatus
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

export type ProductDraft = Omit<AdminProduct, 'status' | 'publishedAt' | 'createdAt' | 'updatedAt'>

export type AdminProductGateway = {
  list(): Promise<AdminProduct[]>
  create(product: ProductDraft): Promise<void>
  update(product: ProductDraft): Promise<void>
  migrateStarters(): Promise<void>
  publish(slug: string): Promise<void>
  archive(slug: string): Promise<void>
  remove(slug: string): Promise<void>
}
