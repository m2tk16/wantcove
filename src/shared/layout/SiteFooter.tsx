import { Link } from '../navigation/Link'

export function SiteFooter() {
  return <footer className="site-footer"><div><span className="wordmark"><span>W</span> WANTCOVE</span><p>Curious finds for everyday life.</p></div><div className="footer-legal"><nav aria-label="Legal"><Link to="/terms">Terms of Service</Link><Link to="/privacy">Privacy Policy</Link></nav><small>Some future product links may be affiliate links. If you buy through them, WantCove may earn a commission at no added cost to you.</small></div></footer>
}
