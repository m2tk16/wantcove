import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { usePrivacyPreferences } from '../privacy/PrivacyPreferencesContext'
import { ThemeContext, type Theme, type ThemeContextValue } from './ThemeContext'
const THEME_KEY = 'wantcove-theme'

function preferredTheme(readStoredPreference: boolean): Theme {
  if (readStoredPreference) {
    try {
      const stored = window.localStorage.getItem(THEME_KEY)
      if (stored === 'light' || stored === 'dark') return stored
    } catch {
      // Fall back to the operating-system preference.
    }
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { choice } = usePrivacyPreferences()
  const [theme, setTheme] = useState<Theme>(() => preferredTheme(choice === 'preferences'))

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    if (choice === 'preferences') {
      try { window.localStorage.setItem(THEME_KEY, theme) } catch { /* session-only fallback */ }
    }
  }, [choice, theme])

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    toggleTheme: () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
