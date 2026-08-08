import { useState, type FormEvent } from 'react'
import { Link } from '../../../shared/navigation/Link'
import type { AdminPasswordRecoveryGateway } from '../types'

type RecoveryStage = 'request' | 'confirm' | 'complete'

const genericDeliveryMessage = 'If an eligible administrator account exists, Cognito will send a recovery code to its verified email address.'

export function AdminPasswordRecoveryPanel({ recovery }: { recovery: AdminPasswordRecoveryGateway }) {
  const [stage, setStage] = useState<RecoveryStage>('request')
  const [email, setEmail] = useState('')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const [deliveryMessage, setDeliveryMessage] = useState<string>()

  async function requestCode(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(undefined)
    try {
      await recovery.request(email)
    } catch {
      // The response is intentionally identical for unknown, disabled, throttled,
      // and temporarily unavailable accounts so this route cannot enumerate users.
    } finally {
      setDeliveryMessage(genericDeliveryMessage)
      setStage('confirm')
      setBusy(false)
    }
  }

  async function resendCode() {
    setBusy(true)
    setError(undefined)
    try {
      await recovery.request(email)
    } catch {
      // Preserve the same account-neutral response used by the initial request.
    } finally {
      setDeliveryMessage(genericDeliveryMessage)
      setBusy(false)
    }
  }

  async function confirmRecovery(event: FormEvent) {
    event.preventDefault()
    setError(undefined)
    if (newPassword !== passwordConfirmation) {
      setError('New passwords do not match.')
      return
    }

    setBusy(true)
    try {
      await recovery.confirm(email, confirmationCode, newPassword)
      setConfirmationCode('')
      setNewPassword('')
      setPasswordConfirmation('')
      setStage('complete')
    } catch {
      setError('Recovery could not be completed. Check the code and password, then try again.')
    } finally {
      setBusy(false)
    }
  }

  function useDifferentEmail() {
    setConfirmationCode('')
    setNewPassword('')
    setPasswordConfirmation('')
    setDeliveryMessage(undefined)
    setError(undefined)
    setStage('request')
  }

  if (stage === 'complete') {
    return <section className="admin-auth-card" aria-labelledby="recovery-complete-heading">
      <span className="kicker">Password updated</span>
      <h2 id="recovery-complete-heading">Recovery complete</h2>
      <p>Your new password is ready. Your authenticator and ADMINS authorization are still required when you sign in.</p>
      <Link className="button" to="/admin">Return to admin sign in</Link>
    </section>
  }

  if (stage === 'confirm') {
    return <form className="admin-auth-card" onSubmit={confirmRecovery}>
      <span className="kicker">Protected account</span>
      <h2>Enter recovery code</h2>
      <p role="status">{deliveryMessage}</p>
      <p className="form-note">Recovery responses do not confirm whether an account exists. Codes and passwords are sent to Amazon Cognito and are never placed in WantCove catalog records.</p>
      <label>
        Recovery code
        <input autoComplete="one-time-code" inputMode="numeric" minLength={6} maxLength={6} onChange={(event) => setConfirmationCode(event.target.value)} pattern="[0-9]{6}" required type="text" value={confirmationCode} />
      </label>
      <label>
        New password
        <input autoComplete="new-password" minLength={12} maxLength={128} onChange={(event) => setNewPassword(event.target.value)} required type="password" value={newPassword} />
      </label>
      <label>
        Confirm new password
        <input autoComplete="new-password" minLength={12} maxLength={128} onChange={(event) => setPasswordConfirmation(event.target.value)} required type="password" value={passwordConfirmation} />
      </label>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button" disabled={busy} type="submit">{busy ? 'Updating…' : 'Update password'}</button>
      <div className="admin-auth-secondary-actions">
        <button className="text-button" disabled={busy} onClick={() => void resendCode()} type="button">Send another code</button>
        <button className="text-button" disabled={busy} onClick={useDifferentEmail} type="button">Use a different email</button>
      </div>
    </form>
  }

  return <form className="admin-auth-card" onSubmit={requestCode}>
    <span className="kicker">Account recovery</span>
    <h2>Reset admin password</h2>
    <p>Enter the administrator email address. For security, the response is the same whether or not an eligible account exists.</p>
    <label>Email<input autoComplete="username" onChange={(event) => setEmail(event.target.value)} required type="email" value={email} /></label>
    {!recovery.isAvailable ? <p className="form-warning" role="status">This local build has no Amplify configuration. Deploy the backend and provide branch outputs before requesting recovery.</p> : null}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button className="button" disabled={busy || !recovery.isAvailable} type="submit">{busy ? 'Requesting…' : 'Send recovery code'}</button>
    <div className="admin-auth-secondary-actions"><Link to="/admin">Return to admin sign in</Link></div>
  </form>
}
