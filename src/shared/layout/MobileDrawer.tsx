import { Link } from '../navigation/Link'

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null
  return <div className="drawer-backdrop" role="presentation" onClick={onClose}><aside className="mobile-drawer" aria-label="Mobile navigation" onClick={(event) => event.stopPropagation()}><div><span className="wordmark"><span>W</span> WANTCOVE</span><button type="button" aria-label="Close menu" onClick={onClose}>×</button></div><nav><Link to="/" onClick={onClose}>Home</Link><Link to="/categories" onClick={onClose}>Categories</Link><Link to="/new-arrivals" onClick={onClose}>New arrivals</Link><Link to="/top-picks" onClick={onClose}>Top picks</Link><Link to="/deals" onClick={onClose}>Deals</Link></nav><p>Interesting finds.<br />Saved for later.</p></aside></div>
}
