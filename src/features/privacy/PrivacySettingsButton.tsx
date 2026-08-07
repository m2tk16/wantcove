import { usePrivacyPreferences } from './PrivacyPreferencesContext'

export function PrivacySettingsButton() {
  const { openNotice } = usePrivacyPreferences()
  return <button className="footer-link-button" type="button" onClick={openNotice}>Privacy choices</button>
}
