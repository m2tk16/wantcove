import { useEffect, useState, type FormEvent } from 'react'
import type { AdminProduct, ProductDraft } from '../types'

const emptyDraft: ProductDraft = {
  slug: '',
  name: '',
  description: '',
  category: '',
  imageUrl: '',
  imageAlt: '',
  amazonAsin: undefined,
  retailerUrl: undefined,
  featuredRank: undefined,
}

export function ProductEditor({ product, busy, onCancel, onSave }: {
  product?: AdminProduct
  busy: boolean
  onCancel(): void
  onSave(product: ProductDraft): Promise<void>
}) {
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft)

  useEffect(() => {
    setDraft(product ? {
      slug: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      imageUrl: product.imageUrl,
      imageAlt: product.imageAlt,
      amazonAsin: product.amazonAsin,
      retailerUrl: product.retailerUrl,
      featuredRank: product.featuredRank,
    } : emptyDraft)
  }, [product])

  function update<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    await onSave(draft)
    if (!product) setDraft(emptyDraft)
  }

  return <form className="product-editor" onSubmit={submit}>
    <div className="admin-section-heading"><div><span className="kicker">{product ? 'Edit draft' : 'New item'}</span><h2>{product ? product.name : 'Create a product draft'}</h2></div>{product ? <button className="text-button" onClick={onCancel} type="button">Cancel editing</button> : null}</div>
    <div className="form-grid">
      <label>Slug<input disabled={Boolean(product)} maxLength={80} minLength={3} onChange={(event) => update('slug', event.target.value)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="smart-reading-light" required value={draft.slug} /></label>
      <label>Name<input maxLength={120} minLength={2} onChange={(event) => update('name', event.target.value)} required value={draft.name} /></label>
      <label>Category<input maxLength={60} minLength={2} onChange={(event) => update('category', event.target.value)} required value={draft.category} /></label>
      <label>Featured rank<input max={10000} min={0} onChange={(event) => update('featuredRank', event.target.value ? Number(event.target.value) : undefined)} type="number" value={draft.featuredRank ?? ''} /></label>
      <label className="wide-field">Description<textarea maxLength={1600} minLength={20} onChange={(event) => update('description', event.target.value)} required rows={5} value={draft.description} /></label>
      <label className="wide-field">Image URL<input maxLength={2048} onChange={(event) => update('imageUrl', event.target.value)} placeholder="https://…" required type="url" value={draft.imageUrl} /></label>
      <label className="wide-field">Image alt text<input maxLength={200} minLength={5} onChange={(event) => update('imageAlt', event.target.value)} required value={draft.imageAlt} /></label>
      <label>Amazon ASIN<input maxLength={10} minLength={10} onChange={(event) => update('amazonAsin', event.target.value || undefined)} placeholder="B012345678" value={draft.amazonAsin ?? ''} /></label>
      <label>Amazon URL<input maxLength={2048} onChange={(event) => update('retailerUrl', event.target.value || undefined)} placeholder="https://www.amazon.com/…" type="url" value={draft.retailerUrl ?? ''} /></label>
    </div>
    <p className="form-note">New products are always saved as drafts. Retailer URLs stay inactive on the public site until the affiliate launch gate is approved.</p>
    <button className="button" disabled={busy} type="submit">{busy ? 'Saving…' : product ? 'Save changes' : 'Create draft'}</button>
  </form>
}
