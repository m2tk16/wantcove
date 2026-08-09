import { useCallback, useEffect, useState } from 'react'
import type { AdminContactGateway, AdminContactMessage } from '../types'

function messageFor(error: unknown) {
  return error instanceof Error ? error.message : 'The contact inbox operation failed.'
}

export function AdminContactInbox({ contacts }: { contacts: AdminContactGateway }) {
  const [messages, setMessages] = useState<AdminContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState<string>()
  const [error, setError] = useState<string>()

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      setMessages(await contacts.list())
      setError(undefined)
    } catch (caught) {
      setError(messageFor(caught))
    } finally {
      setLoading(false)
    }
  }, [contacts])

  useEffect(() => { void refresh() }, [refresh])

  async function remove(id: string) {
    setBusy(true)
    setError(undefined)
    try {
      await contacts.remove(id)
      setDeleting(undefined)
      await refresh()
    } catch (caught) {
      setError(messageFor(caught))
    } finally {
      setBusy(false)
    }
  }

  return <section className="admin-product-list admin-contact-inbox" aria-labelledby="contact-inbox-heading">
    <div className="admin-section-heading"><div><span className="kicker">Private messages</span><h2 id="contact-inbox-heading">Contact inbox</h2></div><button className="text-button" disabled={loading || busy} onClick={() => void refresh()} type="button">Refresh</button></div>
    <p>Website messages expire automatically after 90 days. Delete them sooner when they are no longer needed.</p>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {loading ? <p role="status">Loading contact messages…</p> : messages.length === 0 ? <p>No contact messages yet.</p> : <div className="admin-contact-cards">{messages.map((message) => <article key={message.id}>
      <header><div><h3>{message.firstName} {message.lastName}</h3><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time></div><div className="admin-product-actions">{deleting === message.id ? <><button className="danger-button" disabled={busy} onClick={() => void remove(message.id)} type="button">Confirm delete</button><button disabled={busy} onClick={() => setDeleting(undefined)} type="button">Cancel</button></> : <button disabled={busy} onClick={() => setDeleting(message.id)} type="button">Delete</button>}</div></header>
      <p><a href={`mailto:${message.email}`}>{message.email}</a>{message.phone ? <> · <a href={`tel:${message.phone}`}>{message.phone}</a></> : null}</p>
      <div className="admin-contact-message">{message.message}</div>
    </article>)}</div>}
  </section>
}
