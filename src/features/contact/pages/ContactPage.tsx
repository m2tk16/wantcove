import { useState, type FormEvent } from 'react'
import { contactSubmissionClient } from '../../../services/contact/contactSubmissionClient'
import { Link } from '../../../shared/navigation/Link'
import type { ContactDraft, ContactSubmissionGateway } from '../types'

const emptyDraft: ContactDraft = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  message: '',
  website: '',
}

export function ContactPage({ contact = contactSubmissionClient }: { contact?: ContactSubmissionGateway }) {
  const [draft, setDraft] = useState<ContactDraft>(emptyDraft)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [sent, setSent] = useState(false)

  function update<K extends keyof ContactDraft>(key: K, value: ContactDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setError(undefined)
    setSent(false)
    try {
      await contact.submit(draft)
      setDraft(emptyDraft)
      setSent(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Your message could not be sent. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return <article className="contact-page">
    <section className="contact-intro">
      <span className="kicker">Open channel</span>
      <h1 aria-label="Send us the signal.">Send us<br />the signal.</h1>
      <p>Questions, product feedback, partnership ideas, or something that feels off—we want to hear it.</p>
      <div className="contact-notes">
        <section><strong>Private delivery</strong><span>Your message is stored in WantCove&apos;s restricted AWS inbox for the administrator.</span></section>
        <section><strong>Privacy requests</strong><span>Use this form for privacy questions, but never send passwords, authentication codes, payment details, or government identifiers.</span></section>
      </div>
      <p className="contact-fallback">If the form is unavailable, email <a href="mailto:wantcove@gmail.com">wantcove@gmail.com</a>.</p>
    </section>
    <form className="contact-form" onSubmit={submit}>
      <header><span className="kicker">Contact WantCove</span><h2>What should we know?</h2><p>Required fields are marked below.</p></header>
      <div className="contact-form-grid">
        <label>First name <span>Required</span><input autoComplete="given-name" maxLength={80} onChange={(event) => update('firstName', event.target.value)} required value={draft.firstName} /></label>
        <label>Last name <span>Required</span><input autoComplete="family-name" maxLength={80} onChange={(event) => update('lastName', event.target.value)} required value={draft.lastName} /></label>
        <label className="wide-field">Email address <span>Required</span><input autoComplete="email" maxLength={254} onChange={(event) => update('email', event.target.value)} required type="email" value={draft.email} /></label>
        <label className="wide-field">Phone <span>Optional</span><input autoComplete="tel" maxLength={30} onChange={(event) => update('phone', event.target.value)} pattern="[0-9+().\-\s]{7,30}" type="tel" value={draft.phone ?? ''} /></label>
        <label className="wide-field">Message <span>Required</span><textarea maxLength={2000} minLength={10} onChange={(event) => update('message', event.target.value)} required rows={9} value={draft.message} /></label>
        <label aria-hidden="true" className="contact-honeypot">Website<input autoComplete="off" onChange={(event) => update('website', event.target.value)} tabIndex={-1} value={draft.website ?? ''} /></label>
      </div>
      <p className="contact-privacy-note">Submitting sends these fields to WantCove&apos;s restricted AWS systems for response, abuse prevention, and a maximum 90-day retention period. See the <Link to="/privacy">Privacy Policy</Link>.</p>
      {error ? <p className="form-error" role="alert">{error} Your entries have been preserved.</p> : null}
      {sent ? <p className="form-success" role="status">Message received. WantCove will reply using the email address you provided.</p> : null}
      <button className="button" disabled={busy || !contact.isAvailable} type="submit">{busy ? 'Sending…' : 'Send message'} <span>→</span></button>
      {!contact.isAvailable ? <p className="form-error">Contact messaging is unavailable in this build. Please use the email fallback.</p> : null}
    </form>
  </article>
}
