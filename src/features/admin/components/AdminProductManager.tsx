import { useCallback, useEffect, useState } from 'react'
import type { AdminProduct, AdminProductGateway, ProductDraft } from '../types'
import { ProductEditor } from './ProductEditor'

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'The catalog operation failed.'
}

export function AdminProductManager({ catalog }: { catalog: AdminProductGateway }) {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [editing, setEditing] = useState<AdminProduct>()
  const [deleting, setDeleting] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setProducts(await catalog.list())
      setError(undefined)
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setLoading(false)
    }
  }, [catalog])

  useEffect(() => { void refresh() }, [refresh])

  async function run(operation: () => Promise<void>) {
    setBusy(true)
    setError(undefined)
    try {
      await operation()
      setEditing(undefined)
      setDeleting(undefined)
      await refresh()
    } catch (caught) {
      setError(errorMessage(caught))
    } finally {
      setBusy(false)
    }
  }

  async function save(product: ProductDraft) {
    await run(() => editing ? catalog.update(product) : catalog.create(product))
  }

  return <div className="admin-manager">
    <ProductEditor busy={busy} onCancel={() => setEditing(undefined)} onSave={save} product={editing} />
    <section className="admin-product-list" aria-labelledby="managed-products-heading">
      <div className="admin-section-heading"><div><span className="kicker">GraphQL catalog</span><h2 id="managed-products-heading">Managed products</h2></div><button className="text-button" disabled={loading || busy} onClick={() => void refresh()} type="button">Refresh</button></div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {loading ? <p role="status">Loading managed products…</p> : products.length === 0 ? <p>No managed products yet. The starter products remain code-based until they are migrated.</p> : <div className="admin-product-cards">
        {products.map((product) => <article className="admin-product-card" key={product.slug}>
          <img src={product.imageUrl} alt={product.imageAlt} loading="lazy" referrerPolicy="no-referrer" />
          <div><div className="product-admin-meta"><span className={`status-pill status-${product.status.toLowerCase()}`}>{product.status}</span><code>{product.slug}</code></div><h3>{product.name}</h3><p>{product.category} · Updated {new Date(product.updatedAt).toLocaleDateString()}</p></div>
          <div className="admin-product-actions">
            <button disabled={busy} onClick={() => setEditing(product)} type="button">Edit</button>
            {product.status !== 'PUBLISHED' ? <button disabled={busy} onClick={() => void run(() => catalog.publish(product.slug))} type="button">Publish</button> : <button disabled={busy} onClick={() => void run(() => catalog.archive(product.slug))} type="button">Archive</button>}
            {deleting === product.slug ? <><button className="danger-button" disabled={busy} onClick={() => void run(() => catalog.remove(product.slug))} type="button">Confirm delete</button><button disabled={busy} onClick={() => setDeleting(undefined)} type="button">Cancel</button></> : <button disabled={busy} onClick={() => setDeleting(product.slug)} type="button">Delete</button>}
          </div>
        </article>)}
      </div>}
    </section>
  </div>
}
