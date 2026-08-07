import { useState } from 'react'
import { CatalogProvider } from '../features/catalog/CatalogProvider'
import { LikesProvider } from '../features/likes/LikesProvider'
import { PrivacyPreferencesProvider } from '../features/privacy/PrivacyPreferencesProvider'
import { PrivacySettingsButton } from '../features/privacy/PrivacySettingsButton'
import { StorageNotice } from '../features/privacy/StorageNotice'
import { ThemeProvider } from '../features/preferences/ThemeProvider'
import { ThemeToggle } from '../features/preferences/ThemeToggle'
import { MobileDrawer } from '../shared/layout/MobileDrawer'
import { SiteFooter } from '../shared/layout/SiteFooter'
import { SiteHeader } from '../shared/layout/SiteHeader'
import { usePathname } from '../shared/navigation/usePathname'
import { resolveRoute } from './routes'

export default function App() {
  const path = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return <PrivacyPreferencesProvider><ThemeProvider><CatalogProvider><LikesProvider><div className="site-shell"><SiteHeader menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} themeControl={<ThemeToggle />} /><MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} /><main>{resolveRoute(path)}</main><SiteFooter privacyControl={<PrivacySettingsButton />} /><StorageNotice /></div></LikesProvider></CatalogProvider></ThemeProvider></PrivacyPreferencesProvider>
}
