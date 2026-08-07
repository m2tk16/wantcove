import { Link } from '../navigation/Link'

export function NotFoundPage() {
  return <div className="not-found"><span className="kicker">404</span><h1>That find wandered off.</h1><Link className="button" to="/">Back to discovery</Link></div>
}
