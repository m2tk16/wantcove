import { useState } from 'react'
import { MobileDrawer } from '../shared/layout/MobileDrawer'
import { SiteFooter } from '../shared/layout/SiteFooter'
import { SiteHeader } from '../shared/layout/SiteHeader'
import { usePathname } from '../shared/navigation/usePathname'
import { resolveRoute } from './routes'

export default function App() {
  const path = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return <div className="site-shell"><SiteHeader menuOpen={menuOpen} onOpenMenu={() => setMenuOpen(true)} /><MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} /><main>{resolveRoute(path)}</main><SiteFooter /></div>
}
