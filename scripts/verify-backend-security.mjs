import { readFile } from 'node:fs/promises'

const dataResource = await readFile('amplify/data/resource.ts', 'utf8')
const backendResource = await readFile('amplify/backend.ts', 'utf8')
const getLikeResolver = await readFile('amplify/data/get-viewer-product-like.js', 'utf8')
const setLikeResolver = await readFile('amplify/data/set-viewer-product-like.js', 'utf8')

const requirements = [
  {
    label: 'Collection must remain owner-scoped',
    pattern: /\.authorization\(\s*\(allow\)\s*=>\s*\[\s*allow\.owner\(\)\s*\]\s*\)/s,
  },
  {
    label: 'Collection.owner must not permit ownership reassignment',
    pattern:
      /owner\s*:\s*a\s*\.string\(\)\s*\.authorization\(\s*\(allow\)\s*=>\s*\[\s*allow\.owner\(\)\.to\(\[\s*['"]read['"]\s*,\s*['"]delete['"]\s*\]\)\s*\]\s*\)/s,
  },
  {
    label: 'Amplify Data must default to Cognito user-pool authorization',
    pattern: /defaultAuthorizationMode\s*:\s*['"]userPool['"]/,
  },
  {
    label: 'Anonymous like operations must use explicit guest authorization',
    pattern: /getViewerProductLike[\s\S]*allow\.guest\(\)[\s\S]*setViewerProductLike[\s\S]*allow\.guest\(\)/,
  },
  {
    label: 'Signed-in like operations must use the Cognito identity pool',
    pattern: /getViewerProductLike[\s\S]*allow\.authenticated\(['"]identityPool['"]\)[\s\S]*setViewerProductLike[\s\S]*allow\.authenticated\(['"]identityPool['"]\)/,
  },
]

const backendRequirements = [
  ['Product likes must partition by product slug', /partitionKey\s*:\s*\{\s*name\s*:\s*['"]productSlug['"]/],
  ['Product likes must sort by server-derived actor key', /sortKey\s*:\s*\{\s*name\s*:\s*['"]actorKey['"]/],
  ['Product likes must expire automatically', /timeToLiveAttribute\s*:\s*['"]expiresAt['"]/],
  ['Product likes must have point-in-time recovery', /pointInTimeRecovery\s*:\s*true/],
]

const failures = requirements
  .filter(({ pattern }) => !pattern.test(dataResource))
  .map(({ label }) => label)

for (const [label, pattern] of backendRequirements) {
  if (!pattern.test(backendResource)) failures.push(label)
}

for (const [name, resolver] of [['get-like', getLikeResolver], ['set-like', setLikeResolver]]) {
  if (!/ctx\.identity\?\.cognitoIdentityId/.test(resolver)) {
    failures.push(`${name} resolver must derive its actor key from Cognito identity`)
  }
  if (/sourceIp|ctx\.args\.actorKey/.test(resolver)) {
    failures.push(`${name} resolver must not trust an IP address or client-supplied actor key`)
  }
}

if (!/PRODUCT_LIKE_TTL_SECONDS\s*=\s*60\s*\*\s*60\s*\*\s*24\s*\*\s*180/.test(setLikeResolver)) {
  failures.push('Anonymous like records must use the documented 180-day TTL')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Backend security invariants verified.')
