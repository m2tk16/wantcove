const REQUIRED_HEADERS = new Map([
  ['Strict-Transport-Security', 'max-age=31536000; includeSubDomains'],
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Permissions-Policy', 'camera=(), geolocation=(), microphone=(), payment=(), usb=()'],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
  ['Cross-Origin-Resource-Policy', 'same-origin'],
  ['X-XSS-Protection', '0'],
])

const REQUIRED_CSP_DIRECTIVES = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.appsync-api.us-east-1.amazonaws.com https://cognito-idp.us-east-1.amazonaws.com https://cognito-identity.us-east-1.amazonaws.com",
  "media-src 'self'",
  "manifest-src 'self'",
  "worker-src 'none'",
  'upgrade-insecure-requests',
]

function unquote(value) {
  const trimmed = value.trim()
  const quote = trimmed[0]
  return (quote === '"' || quote === "'") && trimmed.at(-1) === quote
    ? trimmed.slice(1, -1)
    : trimmed
}

export function readHeaderValue(contents, headerName) {
  const lines = contents.split(/\r?\n/)
  for (let index = 0; index < lines.length; index += 1) {
    const keyMatch = lines[index].trim().match(/^- key:\s*(.+)$/)
    if (!keyMatch || unquote(keyMatch[1]) !== headerName) continue
    for (let valueIndex = index + 1; valueIndex < lines.length; valueIndex += 1) {
      const line = lines[valueIndex].trim()
      if (line.startsWith('- key:') || line.startsWith('- pattern:')) break
      const valueMatch = line.match(/^value:\s*(.+)$/)
      if (valueMatch) return unquote(valueMatch[1])
    }
  }
  return undefined
}

export function validateHostingSecurityPolicy(contents) {
  const failures = []
  if (!contents.includes("pattern: '**'")) failures.push('The global ** header pattern is missing.')

  for (const [name, expected] of REQUIRED_HEADERS) {
    const actual = readHeaderValue(contents, name)
    if (actual !== expected) failures.push(`${name} must be exactly: ${expected}`)
  }

  const csp = readHeaderValue(contents, 'Content-Security-Policy')
  if (!csp) {
    failures.push('Content-Security-Policy is missing.')
  } else {
    for (const directive of REQUIRED_CSP_DIRECTIVES) {
      if (!csp.split(';').map((value) => value.trim()).includes(directive)) {
        failures.push(`Content-Security-Policy is missing: ${directive}`)
      }
    }
    for (const unsafeValue of ["'unsafe-inline'", "'unsafe-eval'", 'img-src https:', 'https://*.amazonaws.com']) {
      if (csp.includes(unsafeValue)) failures.push(`Content-Security-Policy must not include: ${unsafeValue}`)
    }
  }

  if (!contents.includes("pattern: '/assets/*'") || !contents.includes('max-age=31536000, immutable')) {
    failures.push('Fingerprint asset caching policy is missing.')
  }
  if (!contents.includes("pattern: '/products/*'") || !contents.includes('max-age=604800')) {
    failures.push('Product media caching policy is missing.')
  }
  return failures
}
