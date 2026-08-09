import type { ReactNode } from 'react'
import { Link } from '../navigation/Link'

export function SiteFooter({ privacyControl }: { privacyControl?: ReactNode }) {
  return <footer className="site-footer"><div><span className="wordmark"><span>W</span> WANTCOVE</span><p>Curious finds for everyday life.</p></div><div className="footer-legal"><nav aria-label="Legal and support"><Link to="/contact">Contact</Link><Link to="/terms">Terms of Service</Link><Link to="/privacy">Privacy Policy</Link>{privacyControl}</nav><p className="associate-statement">As an Amazon Associate I earn from qualifying purchases.</p><small>Validated Amazon retailer links may earn WantCove a commission at no added cost to you. Link-level disclosures identify each active destination.</small></div></footer>
}
