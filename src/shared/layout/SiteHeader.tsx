import { Link } from '../navigation/Link'

export function SiteHeader({ menuOpen, onOpenMenu }: { menuOpen: boolean; onOpenMenu: () => void }) {
  return <header className="site-header"><button className="menu-button" type="button" aria-label="Open menu" aria-expanded={menuOpen} onClick={onOpenMenu}>☰</button><Link className="wordmark" to="/" aria-label="WantCove home"><span>W</span> WANTCOVE</Link><nav className="desktop-nav" aria-label="Primary navigation"><Link to="/">Home</Link><Link to="/categories">Categories</Link><Link to="/new-arrivals">New arrivals</Link><Link to="/top-picks">Top picks</Link><Link to="/deals">Deals</Link></nav><div className="header-actions"><button type="button" aria-label="Search">⌕</button><button type="button" aria-label="Your saved products">♡</button></div></header>
}
