import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { usePathname } from './usePathname'

export function Link({ to, className, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }) {
  const path = usePathname()

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event)
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    window.history.pushState({}, '', to)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return <a {...props} href={to} className={[className, path === to ? 'active' : ''].filter(Boolean).join(' ')} onClick={handleClick} />
}
