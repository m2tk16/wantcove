import { useMemo, useState, type ReactNode } from 'react'
import { PrivacyPreferencesContext, type PrivacyChoice, type PrivacyPreferencesContextValue } from './PrivacyPreferencesContext'

const PRIVACY_CHOICE_KEY = 'wantcove-privacy-choice'
const THEME_KEY = 'wantcove-theme'

function readChoice(): PrivacyChoice {
  try {
    const stored = window.localStorage.getItem(PRIVACY_CHOICE_KEY)
    return stored === 'essential' || stored === 'preferences' ? stored : 'pending'
  } catch {
    return 'pending'
  }
}

export function PrivacyPreferencesProvider({ children }: { children: ReactNode }) {
  const [choice, setChoice] = useState<PrivacyChoice>(readChoice)
  const [noticeOpen, setNoticeOpen] = useState(choice === 'pending')

  const value = useMemo<PrivacyPreferencesContextValue>(() => ({
    choice,
    noticeOpen,
    choose(nextChoice) {
      try {
        window.localStorage.setItem(PRIVACY_CHOICE_KEY, nextChoice)
        if (nextChoice === 'essential') window.localStorage.removeItem(THEME_KEY)
      } catch {
        // The choice still applies for this tab when storage is unavailable.
      }
      setChoice(nextChoice)
      setNoticeOpen(false)
    },
    openNotice: () => setNoticeOpen(true),
    closeNotice: () => {
      if (choice !== 'pending') setNoticeOpen(false)
    },
  }), [choice, noticeOpen])

  return <PrivacyPreferencesContext.Provider value={value}>{children}</PrivacyPreferencesContext.Provider>
}
