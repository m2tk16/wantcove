import { useEffect, useState } from 'react'
import { adminAuthClient } from '../../../services/admin/adminAuthClient'
import { adminProductClient } from '../../../services/admin/adminProductClient'
import { adminContactClient } from '../../../services/admin/adminContactClient'
import { AdminContactInbox } from '../components/AdminContactInbox'
import { AdminProductManager } from '../components/AdminProductManager'
import { AdminSignInPanel } from '../components/AdminSignInPanel'
import type { AdminAuthGateway, AdminAuthStep, AdminContactGateway, AdminProductGateway, AdminSession } from '../types'
import '../admin.css'

export function AdminPage({ auth = adminAuthClient, catalog = adminProductClient, contacts = adminContactClient }: {
  auth?: AdminAuthGateway
  catalog?: AdminProductGateway
  contacts?: AdminContactGateway
}) {
  const [session, setSession] = useState<AdminSession | null>()
  const [challenge, setChallenge] = useState<Exclude<AdminAuthStep, { kind: 'signedIn' }>>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    if (!auth.isAvailable) {
      setSession(null)
      return
    }
    let active = true
    void auth.current().then((current) => { if (active) setSession(current) })
    return () => { active = false }
  }, [auth])

  function handleStep(step: AdminAuthStep) {
    if (step.kind === 'signedIn') {
      setSession(step.session)
      setChallenge(undefined)
    } else {
      setChallenge(step)
    }
  }

  async function endSession() {
    setBusy(true)
    try {
      await auth.signOut()
      setSession(null)
      setChallenge(undefined)
    } finally {
      setBusy(false)
    }
  }

  return <div className="admin-page">
    <header className="admin-page-header"><div><span className="kicker">Private workspace</span><h1>Catalog administration</h1><p>Create and review product drafts, then publish only when the content and source are ready.</p></div>{session ? <button className="text-button" disabled={busy} onClick={() => void endSession()} type="button">Sign out</button> : null}</header>
    {session === undefined ? <p role="status">Checking your secure session…</p> : session === null ? <AdminSignInPanel auth={auth} busy={busy} challenge={challenge} error={error} onBusy={setBusy} onError={(message) => setError(message || undefined)} onStep={handleStep} /> : !session.isAdmin ? <section className="admin-auth-card"><h2>Access denied</h2><p>{session.email} is authenticated but is not a member of the ADMINS group.</p><button className="button" onClick={() => void endSession()} type="button">Sign out</button></section> : <><div className="admin-session-banner"><span>Signed in as <strong>{session.email}</strong></span><span>MFA-protected · ADMINS group</span></div><AdminProductManager catalog={catalog} />{contacts.isAvailable ? <AdminContactInbox contacts={contacts} /> : null}</>}
  </div>
}
