const AMAZON_ASSOCIATE_ID = 'wantcove-20'

export function safeRetailerUrl(value: string | undefined) {
  if (!value) return undefined
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return undefined
    const host = url.hostname.toLowerCase()
    if (host === 'amzn.to') return url.pathname !== '/' ? url.toString() : undefined
    if (host !== 'amazon.com' && !host.endsWith('.amazon.com')) return undefined
    return url.searchParams.get('tag') === AMAZON_ASSOCIATE_ID ? url.toString() : undefined
  } catch {
    return undefined
  }
}
