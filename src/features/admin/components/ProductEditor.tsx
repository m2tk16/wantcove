import { useState, type FormEvent } from 'react'
import type { AdminProduct, ProductDraft } from '../types'

const emptyDraft: ProductDraft = {
  slug: '',
  name: '',
  description: '',
  category: '',
  imageUrl: '',
  imageAlt: '',
  priceLabel: undefined,
  ratingLabel: undefined,
  amazonAsin: undefined,
  retailerUrl: undefined,
  featuredRank: undefined,
}

function initialDraft(product?: AdminProduct): ProductDraft {
  return product ? {
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
  } : emptyDraft
}

export function ProductEditor({ product, busy, onCancel, onSave }: {
  product?: AdminProduct
  busy: boolean
  onCancel(): void
  onSave(product: ProductDraft): Promise<boolean>
}) {
  const [draft, setDraft] = useState<ProductDraft>(() => initialDraft(product))

  function update<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const saved = await onSave(draft)
    if (saved && !product) setDraft(emptyDraft)
  }

  return <form className="product-editor" onSubmit={submit}>
    <div className="admin-section-heading"><div><span className="kicker">{product ? 'Edit draft' : 'New item'}</span><h2>{product ? product.name : 'Create a product draft'}</h2></div>{product ? <button className="text-button" onClick={onCancel} type="button">Cancel editing</button> : null}</div>
    <div className="form-grid">
      <label>Slug<input disabled={Boolean(product)} maxLength={80} minLength={3} onChange={(event) => update('slug', event.target.value)} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="smart-reading-light" required value={draft.slug} /></label>
      <label>Name<input maxLength={120} minLength={2} onChange={(event) => update('name', event.target.value)} required value={draft.name} /></label>
      <label>Category<input maxLength={60} minLength={2} onChange={(event) => update('category', event.target.value)} required value={draft.category} /></label>
      <label>Featured rank<input max={10000} min={0} onChange={(event) => update('featuredRank', event.target.value ? Number(event.target.value) : undefined)} type="number" value={draft.featuredRank ?? ''} /></label>
      <label>Display price<input maxLength={32} onChange={(event) => update('priceLabel', event.target.value || undefined)} placeholder="$79.99" value={draft.priceLabel ?? ''} /></label>
      <label>Display rating<input maxLength={16} onChange={(event) => update('ratingLabel', event.target.value || undefined)} placeholder="4.8" value={draft.ratingLabel ?? ''} /></label>
      <label className="wide-field">Description<textarea maxLength={1600} minLength={20} onChange={(event) => update('description', event.target.value)} required rows={5} value={draft.description} /></label>
      <label className="wide-field">Deployed image path<input aria-describedby="image-path-help" maxLength={2048} onChange={(event) => update('imageUrl', event.target.value)} pattern="/products/[a-z0-9]+(?:[.-][a-z0-9]+)*\.(?:avif|jpg|jpeg|png|webp)" placeholder="/products/item.webp" required title="Use a lowercase first-party /products/ AVIF, JPEG, PNG, or WebP path. Local file paths are not supported." value={draft.imageUrl} /></label>
      <p className="form-note wide-field" id="image-path-help">This field references an image already deployed with the site; it does not upload a file. Add images under <code>public/products</code>, deploy them, then enter a lowercase path such as <code>/products/lasfit-floor-mats.jpg</code>. Local Windows paths and files under <code>src/assets</code> are not publicly accessible by path.</p>
      <label className="wide-field">Image alt text<input maxLength={200} minLength={5} onChange={(event) => update('imageAlt', event.target.value)} required value={draft.imageAlt} /></label>
      <label>Amazon ASIN<input maxLength={10} minLength={10} onChange={(event) => update('amazonAsin', event.target.value || undefined)} placeholder="B012345678" value={draft.amazonAsin ?? ''} /></label>
      <label>Amazon URL<input maxLength={2048} onChange={(event) => update('retailerUrl', event.target.value || undefined)} placeholder="https://www.amazon.com/…" type="url" value={draft.retailerUrl ?? ''} /></label>
    </div>
    <p className="form-note">New products are always saved as drafts. Retailer URLs stay inactive on the public site until the affiliate launch gate is approved.</p>
    <button className="button" disabled={busy} type="submit">{busy ? 'Saving…' : product ? 'Save changes' : 'Create draft'}</button>
  </form>
}
