import { useSyncExternalStore } from 'react'

function subscribeToNavigation(callback: () => void) {
  window.addEventListener('popstate', callback)
  return () => window.removeEventListener('popstate', callback)
}

export function usePathname() {
  return useSyncExternalStore(subscribeToNavigation, () => window.location.pathname, () => '/')
}
