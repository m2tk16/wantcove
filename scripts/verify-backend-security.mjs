import { readFile } from 'node:fs/promises'

const dataResource = await readFile('amplify/data/resource.ts', 'utf8')
const authResource = await readFile('amplify/auth/resource.ts', 'utf8')
const backendResource = await readFile('amplify/backend.ts', 'utf8')
const manageProductsFunctionResource = await readFile('amplify/functions/manage-products/resource.ts', 'utf8')
const manageProductsHandler = await readFile('amplify/functions/manage-products/handler.ts', 'utf8')
const starterProducts = await readFile('amplify/functions/manage-products/starter-products.ts', 'utf8')
const publicCatalogFunctionResource = await readFile('amplify/functions/public-catalog/resource.ts', 'utf8')
const publicCatalogHandler = await readFile('amplify/functions/public-catalog/handler.ts', 'utf8')
const productLikesFunctionResource = await readFile('amplify/functions/product-likes/resource.ts', 'utf8')
const productLikesHandler = await readFile('amplify/functions/product-likes/handler.ts', 'utf8')
const adminProductLikesPolicy = await readFile('amplify/policies/admin-product-likes.ts', 'utf8')
const catalogProvider = await readFile('src/features/catalog/CatalogProvider.tsx', 'utf8')

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
    label: 'Product model access must be read-only for the ADMINS group',
    pattern: /Product:\s*a[\s\S]*?\.authorization\(\s*\(allow\)\s*=>\s*\[allow\.group\(['"]ADMINS['"]\)\.to\(\[['"]read['"]\]\)\]\s*\)/,
  },
  {
    label: 'Public catalog operations must use API-key-authorized Function handlers',
    pattern: /listPublishedProducts[\s\S]*allow\.publicApiKey\(\)[\s\S]*a\.handler\.function\(publicCatalogFunction\)[\s\S]*getPublishedProduct[\s\S]*allow\.publicApiKey\(\)[\s\S]*a\.handler\.function\(publicCatalogFunction\)/,
  },
  {
    label: 'Public catalog API key must have a bounded expiration',
    pattern: /apiKeyAuthorizationMode\s*:\s*\{[\s\S]*expiresInDays\s*:\s*365/,
  },
  {
    label: 'Product changes must use an ADMINS-only Function handler',
    pattern: /manageProduct[\s\S]*allow\.group\(['"]ADMINS['"]\)[\s\S]*a\.handler\.function\(manageProductsFunction\)/,
  },
  {
    label: 'Starter migration must use an ADMINS-only Function handler',
    pattern: /migrateStarterProducts[\s\S]*allow\.group\(['"]ADMINS['"]\)[\s\S]*a\.handler\.function\(manageProductsFunction\)/,
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
  ['Public self-registration must remain disabled', /allowAdminCreateUserOnly\s*:\s*true/],
  ['The field-scoped like policy must be created in Data and attach only to the ADMINS preferred role', /attachAdminProductLikesPolicy\(\s*backend\.data\.stack,\s*backend\.data\.resources\.graphqlApi\.arn,\s*backend\.auth\.resources\.groups\[['"]ADMINS['"]\]\.role/],
  ['The product manager must have table read/write access', /productTable\.grantReadWriteData\(manageProductsLambda\)/],
  ['The public catalog must have table read-only access', /productTable\.grantReadData\(publicCatalogLambda\)/],
  ['Product likes must have product-table read-only access', /productTable\.grantReadData\(productLikesLambda\)/],
  ['Product likes must partition by product slug', /partitionKey\s*:\s*\{\s*name\s*:\s*['"]productSlug['"]/],
  ['Product likes must sort by server-derived actor key', /sortKey\s*:\s*\{\s*name\s*:\s*['"]actorKey['"]/],
  ['Product likes must expire automatically', /timeToLiveAttribute\s*:\s*['"]expiresAt['"]/],
  ['Product likes must have point-in-time recovery', /pointInTimeRecoverySpecification\s*:\s*\{\s*pointInTimeRecoveryEnabled\s*:\s*true/],
  ['Only the product-likes Function may access the table', /productLikesTable\.grantReadWriteData\(productLikesLambda\)/],
  ['The product-likes table name must be injected by the backend', /backend\.productLikesFunction\.addEnvironment\(['"]PRODUCT_LIKES_TABLE_NAME['"]\s*,\s*productLikesTable\.tableName\)/],
]

const authRequirements = [
  ['The ADMINS Cognito group must exist', /groups\s*:\s*\[['"]ADMINS['"]\]/],
  ['Administrator MFA must be required', /multifactor\s*:\s*\{[\s\S]*mode\s*:\s*['"]REQUIRED['"][\s\S]*totp\s*:\s*true/],
]

const failures = requirements
  .filter(({ pattern }) => !pattern.test(dataResource))
  .map(({ label }) => label)

for (const [label, pattern] of backendRequirements) {
  if (!pattern.test(backendResource)) failures.push(label)
}

for (const [label, pattern] of authRequirements) {
  if (!pattern.test(authResource)) failures.push(label)
}

if (!/cognitoIdentityId/.test(productLikesHandler)) {
  failures.push('Product-like Function must derive its actor key from Cognito identity')
}

if (/sourceIp|arguments\.actorKey/.test(productLikesHandler)) {
  failures.push('Product-like Function must not trust an IP address or client-supplied actor key')
}

if (!/PRODUCT_TABLE_NAME/.test(productLikesHandler) || !/status\s*!==\s*['"]PUBLISHED['"]/.test(productLikesHandler)) {
  failures.push('Every product like must verify that the product is published')
}

if (/legacyProductSlugs/.test(productLikesHandler)) {
  failures.push('Product likes must not retain a legacy slug allowlist')
}

if (!/cognito:groups/.test(manageProductsHandler) || !/includes\(['"]ADMINS['"]\)/.test(manageProductsHandler)) {
  failures.push('Product manager must recheck the ADMINS identity claim')
}

if (!/attribute_not_exists\(slug\)/.test(manageProductsHandler) || !/attribute_exists\(slug\)/.test(manageProductsHandler)) {
  failures.push('Product writes must retain conditional create/update/delete guards')
}

if (!/migrateStarterProducts/.test(manageProductsHandler) || !/BatchGetCommand/.test(manageProductsHandler) || !/TransactWriteCommand/.test(manageProductsHandler)) {
  failures.push('Starter migration must read existing records and create missing records transactionally')
}

if (!/event\.fieldName\s*\?\?\s*event\.info\?\.fieldName/.test(manageProductsHandler)) {
  failures.push('Shared catalog Function must dispatch from Amplify\'s top-level fieldName payload')
}

if (/fixtureProducts|mergeCatalog/.test(catalogProvider) || !/setProducts\(managedProducts\)/.test(catalogProvider)) {
  failures.push('Hosted catalog reads must replace fixtures with the managed GraphQL result')
}

if (!/FIRST_PARTY_PRODUCT_IMAGE_PATTERN/.test(manageProductsHandler) || !/\/products\//.test(manageProductsHandler)) {
  failures.push('First-party product images must remain constrained to the /products/ path')
}

if (/amazonAsin|retailerUrl/.test(starterProducts)) {
  failures.push('Starter migration records must not activate affiliate identifiers or destinations')
}

if (!/item\.status\s*!==\s*['"]PUBLISHED['"]/.test(publicCatalogHandler) || !/ProjectionExpression/.test(publicCatalogHandler)) {
  failures.push('Public catalog must filter drafts and project only public fields')
}

if (/item\.(amazonAsin|retailerUrl)/.test(publicCatalogHandler) || /PROJECTION\s*=.*(amazonAsin|retailerUrl)/.test(publicCatalogHandler)) {
  failures.push('Disabled affiliate identifiers and URLs must not enter the public catalog payload')
}

if (!/PRODUCT_LIKE_TTL_SECONDS\s*=\s*60\s*\*\s*60\s*\*\s*24\s*\*\s*180/.test(productLikesHandler)) {
  failures.push('Anonymous like records must use the documented 180-day TTL')
}

if (!/timeoutSeconds\s*:\s*10/.test(productLikesFunctionResource)) {
  failures.push('Product-like Function must retain a bounded execution timeout')
}

if (![productLikesFunctionResource, manageProductsFunctionResource, publicCatalogFunctionResource].every((resource) => /resourceGroupName\s*:\s*['"]data['"]/.test(resource))) {
  failures.push('Data resolver Functions must share the data resource group to avoid nested-stack cycles')
}


if (!/timeoutSeconds\s*:\s*10/.test(manageProductsFunctionResource) || !/timeoutSeconds\s*:\s*10/.test(publicCatalogFunctionResource)) {
  failures.push('Catalog Functions must retain bounded execution timeouts')
}

if (/a\.handler\.custom/.test(dataResource)) {
  failures.push('Identity-pool like operations must not use unsupported custom AppSync handlers')
}

if (!/new Policy\(scope,\s*['"]AdminProductLikesPolicy['"][\s\S]*actions\s*:\s*\[['"]appsync:GraphQL['"]\][\s\S]*\/types\/Query\/fields\/getViewerProductLike[\s\S]*\/types\/Mutation\/fields\/setViewerProductLike/.test(adminProductLikesPolicy)) {
  failures.push('The ADMINS preferred IAM role must receive the two field-scoped AppSync like grants')
}

if (/types\/(?!Query\/fields\/getViewerProductLike|Mutation\/fields\/setViewerProductLike)/.test(adminProductLikesPolicy)) {
  failures.push('The ADMINS preferred IAM role must not receive unrelated AppSync field access')
}

const adminPolicyActions = adminProductLikesPolicy.match(/actions\s*:\s*\[([^\]]*)\]/)?.[1].replace(/\s/g, '') ?? ''
if (!/^['"]appsync:GraphQL['"]$/.test(adminPolicyActions) || /resources\s*:\s*\[[^\]]*['"]\*['"]/.test(adminProductLikesPolicy)) {
  failures.push('The ADMINS product-like policy must not use wildcard resources or unrelated actions')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Backend security invariants verified.')
