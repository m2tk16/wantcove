import { createContext, useContext } from 'react'

export type PrivacyChoice = 'pending' | 'essential' | 'preferences'

export type PrivacyPreferencesContextValue = {
  choice: PrivacyChoice
  noticeOpen: boolean
  choose: (choice: Exclude<PrivacyChoice, 'pending'>) => void
  openNotice: () => void
  closeNotice: () => void
}

export const PrivacyPreferencesContext = createContext<PrivacyPreferencesContextValue | null>(null)

export function usePrivacyPreferences() {
  const context = useContext(PrivacyPreferencesContext)
  if (!context) throw new Error('usePrivacyPreferences must be used inside PrivacyPreferencesProvider')
  return context
}
