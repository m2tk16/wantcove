const AMAZON_ASSOCIATE_ID = 'wantcove-20';

function requireHttpsUrl(value: string, label: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) {
    throw new Error(`${label} must use HTTPS without credentials or a custom port.`);
  }
  return url;
}

export function normalizeAmazonSpecialLink(value: string) {
  const url = requireHttpsUrl(value.trim(), 'Retailer URL');
  const host = url.hostname.toLowerCase();

  if (host === 'amzn.to') {
    if (url.pathname === '/' || url.pathname.length > 200) {
      throw new Error('Amazon short link must include a valid destination token.');
    }
    return url.toString();
  }

  if (host !== 'amazon.com' && !host.endsWith('.amazon.com')) {
    throw new Error('Retailer URL must use an Amazon or amzn.to host.');
  }
  if (url.searchParams.get('tag') !== AMAZON_ASSOCIATE_ID) {
    throw new Error(`Amazon retailer URL must include the ${AMAZON_ASSOCIATE_ID} Associate tag.`);
  }
  return url.toString();
}

export function safeAmazonSpecialLink(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  try {
    return normalizeAmazonSpecialLink(value);
  } catch {
    return undefined;
  }
}
