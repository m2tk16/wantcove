import { useState, type FormEvent } from 'react'
import type { AdminAuthGateway, AdminAuthStep } from '../types'

type Props = {
  auth: AdminAuthGateway
  challenge?: Exclude<AdminAuthStep, { kind: 'signedIn' }>
  busy: boolean
  error?: string
  onStep(step: AdminAuthStep): void
  onError(message: string): void
  onBusy(busy: boolean): void
}

export function AdminSignInPanel({ auth, challenge, busy, error, onStep, onError, onBusy }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [response, setResponse] = useState('')

  async function submitCredentials(event: FormEvent) {
    event.preventDefault()
    onBusy(true)
    onError('')
    try {
      onStep(await auth.signIn(email, password))
    } catch {
      onError('Sign-in failed. Check your credentials and try again.')
    } finally {
      onBusy(false)
    }
  }

  async function submitChallenge(event: FormEvent) {
    event.preventDefault()
    onBusy(true)
    onError('')
    try {
      onStep(await auth.confirm(response))
      setResponse('')
    } catch {
      onError('Verification failed. Check the value and try again.')
    } finally {
      onBusy(false)
    }
  }

  if (challenge?.kind === 'unsupported') {
    return <div className="admin-auth-card"><h2>Sign-in needs attention</h2><p>{challenge.message}</p></div>
  }

  if (challenge) {
    const newPassword = challenge.kind === 'newPassword'
    const setup = challenge.kind === 'totpSetup'
    return <form className="admin-auth-card" onSubmit={submitChallenge}>
      <span className="kicker">Protected account</span>
      <h2>{newPassword ? 'Choose a permanent password' : setup ? 'Set up an authenticator' : 'Enter your security code'}</h2>
      {setup ? <div className="totp-setup">
        <p>Add this account to your authenticator app, then enter its six-digit code.</p>
        <label>Setup key<code>{challenge.sharedSecret}</code></label>
        <details><summary>Authenticator URI</summary><code>{challenge.setupUri}</code></details>
      </div> : null}
      <label>
        {newPassword ? 'New password' : 'Six-digit code'}
        <input
          autoComplete={newPassword ? 'new-password' : 'one-time-code'}
          inputMode={newPassword ? undefined : 'numeric'}
          minLength={newPassword ? 12 : 6}
          maxLength={newPassword ? 128 : 6}
          onChange={(event) => setResponse(event.target.value)}
          required
          type={newPassword ? 'password' : 'text'}
          value={response}
        />
      </label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button" disabled={busy} type="submit">{busy ? 'Verifying…' : 'Continue'}</button>
    </form>
  }

  return <form className="admin-auth-card" onSubmit={submitCredentials}>
    <span className="kicker">Restricted</span>
    <h2>Admin sign in</h2>
    <p>Only administrator-created accounts in the ADMINS group can manage the catalog. MFA is required.</p>
    <label>Email<input autoComplete="username" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
    <label>Password<input autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required type="password" value={password} /></label>
    {!auth.isAvailable ? <p className="form-warning" role="status">This local build has no Amplify configuration. Deploy the backend and provide branch outputs before signing in.</p> : null}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button className="button" disabled={busy || !auth.isAvailable} type="submit">{busy ? 'Signing in…' : 'Sign in securely'}</button>
  </form>
}
