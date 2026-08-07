import { readFile } from 'node:fs/promises'

const dataResource = await readFile('amplify/data/resource.ts', 'utf8')
const backendResource = await readFile('amplify/backend.ts', 'utf8')
const productLikesFunctionResource = await readFile('amplify/functions/product-likes/resource.ts', 'utf8')
const productLikesHandler = await readFile('amplify/functions/product-likes/handler.ts', 'utf8')

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
  {
    label: 'Identity-pool like operations must use the supported Function handler',
    pattern: /getViewerProductLike[\s\S]*a\.handler\.function\(productLikesFunction\)[\s\S]*setViewerProductLike[\s\S]*a\.handler\.function\(productLikesFunction\)/,
  },
]

const backendRequirements = [
  ['Product likes must partition by product slug', /partitionKey\s*:\s*\{\s*name\s*:\s*['"]productSlug['"]/],
  ['Product likes must sort by server-derived actor key', /sortKey\s*:\s*\{\s*name\s*:\s*['"]actorKey['"]/],
  ['Product likes must expire automatically', /timeToLiveAttribute\s*:\s*['"]expiresAt['"]/],
  ['Product likes must have point-in-time recovery', /pointInTimeRecovery\s*:\s*true/],
  ['Only the product-likes Function may access the table', /productLikesTable\.grantReadWriteData\(productLikesLambda\)/],
  ['The product-likes table name must be injected by the backend', /backend\.productLikesFunction\.addEnvironment\(['"]PRODUCT_LIKES_TABLE_NAME['"]\s*,\s*productLikesTable\.tableName\)/],
]

const failures = requirements
  .filter(({ pattern }) => !pattern.test(dataResource))
  .map(({ label }) => label)

for (const [label, pattern] of backendRequirements) {
  if (!pattern.test(backendResource)) failures.push(label)
}

if (!/cognitoIdentityId/.test(productLikesHandler)) {
  failures.push('Product-like Function must derive its actor key from Cognito identity')
}

if (/sourceIp|arguments\.actorKey/.test(productLikesHandler)) {
  failures.push('Product-like Function must not trust an IP address or client-supplied actor key')
}

if (!/PRODUCT_LIKE_TTL_SECONDS\s*=\s*60\s*\*\s*60\s*\*\s*24\s*\*\s*180/.test(productLikesHandler)) {
  failures.push('Anonymous like records must use the documented 180-day TTL')
}

if (!/timeoutSeconds\s*:\s*10/.test(productLikesFunctionResource)) {
  failures.push('Product-like Function must retain a bounded execution timeout')
}

if (/a\.handler\.custom/.test(dataResource)) {
  failures.push('Identity-pool like operations must not use unsupported custom AppSync handlers')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Backend security invariants verified.')
