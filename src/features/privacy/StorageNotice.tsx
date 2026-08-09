import { Link } from '../../shared/navigation/Link'
import { usePrivacyPreferences } from './PrivacyPreferencesContext'

export function StorageNotice() {
  const { choice, noticeOpen, choose, closeNotice } = usePrivacyPreferences()
  if (!noticeOpen) return null

  return <aside className="storage-notice" role="dialog" aria-modal="false" aria-labelledby="storage-notice-title">
    <div className="storage-notice-heading">
      <h2 id="storage-notice-title">Your privacy choices</h2>
      {choice !== 'pending' && <button type="button" aria-label="Close privacy choices" onClick={closeNotice}>×</button>}
    </div>
    <p>WantCove can use functional browser storage for your theme and a pseudonymous AWS guest identity for likes. Submitting the contact form also uses a guest identity for essential abuse protection. We do not use advertising cookies or raw IP addresses as application identifiers.</p>
    <div className="storage-actions">
      <button className="button" type="button" onClick={() => choose('preferences')}>Allow preferences</button>
      <button className="text-button" type="button" onClick={() => choose('essential')}>Essential only</button>
    </div>
    <Link to="/privacy">Read the Privacy Policy</Link>
  </aside>
}
