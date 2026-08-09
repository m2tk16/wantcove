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
const productLikesAbuseControls = await readFile('amplify/functions/product-likes/abuse-controls.ts', 'utf8')
const productLikesMonitoring = await readFile('amplify/monitoring/product-like-abuse-controls.ts', 'utf8')
const adminProductLikesPolicy = await readFile('amplify/policies/admin-product-likes.ts', 'utf8')
const adminContactSubmissionPolicy = await readFile('amplify/policies/admin-contact-submission.ts', 'utf8')
const contactMessagesFunctionResource = await readFile('amplify/functions/contact-messages/resource.ts', 'utf8')
const contactMessagesHandler = await readFile('amplify/functions/contact-messages/handler.ts', 'utf8')
const contactMessagesAbuseControls = await readFile('amplify/functions/contact-messages/abuse-controls.ts', 'utf8')
const contactMessagesMonitoring = await readFile('amplify/monitoring/contact-message-abuse-controls.ts', 'utf8')
const amazonRetailer = await readFile('amplify/shared/amazon-retailer.ts', 'utf8')
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
  {
    label: 'Public contact submission must use guest identity-pool authorization and the bounded Function',
    pattern: /submitContactMessage[\s\S]*allow\.guest\(\)[\s\S]*allow\.authenticated\(['"]identityPool['"]\)[\s\S]*a\.handler\.function\(contactMessagesFunction\)/,
  },
  {
    label: 'Contact inbox reads and deletes must remain ADMINS-only Function operations',
    pattern: /listContactMessages[\s\S]*allow\.group\(['"]ADMINS['"]\)[\s\S]*a\.handler\.function\(contactMessagesFunction\)[\s\S]*deleteContactMessage[\s\S]*allow\.group\(['"]ADMINS['"]\)[\s\S]*a\.handler\.function\(contactMessagesFunction\)/,
  },
]

const backendRequirements = [
  ['Public self-registration must remain disabled', /allowAdminCreateUserOnly\s*:\s*true/],
  ['The field-scoped like policy must be created in Data and attach only to the ADMINS preferred role', /attachAdminProductLikesPolicy\(\s*backend\.data\.stack,\s*backend\.data\.resources\.graphqlApi\.arn,\s*backend\.auth\.resources\.groups\[['"]ADMINS['"]\]\.role/],
  ['The field-scoped contact policy must attach only to the ADMINS preferred role', /attachAdminContactSubmissionPolicy\(\s*backend\.data\.stack,\s*backend\.data\.resources\.graphqlApi\.arn,\s*backend\.auth\.resources\.groups\[['"]ADMINS['"]\]\.role/],
  ['The product manager must have table read/write access', /productTable\.grantReadWriteData\(manageProductsLambda\)/],
  ['The public catalog must have table read-only access', /productTable\.grantReadData\(publicCatalogLambda\)/],
  ['Product likes must have product-table read-only access', /productTable\.grantReadData\(productLikesLambda\)/],
  ['Product likes must partition by product slug', /partitionKey\s*:\s*\{\s*name\s*:\s*['"]productSlug['"]/],
  ['Product likes must sort by server-derived actor key', /sortKey\s*:\s*\{\s*name\s*:\s*['"]actorKey['"]/],
  ['Product likes must expire automatically', /timeToLiveAttribute\s*:\s*['"]expiresAt['"]/],
  ['Product likes must have point-in-time recovery', /pointInTimeRecoverySpecification\s*:\s*\{\s*pointInTimeRecoveryEnabled\s*:\s*true/],
  ['Only the product-likes Function may access the table', /productLikesTable\.grantReadWriteData\(productLikesLambda\)/],
  ['The product-likes table name must be injected by the backend', /backend\.productLikesFunction\.addEnvironment\(['"]PRODUCT_LIKES_TABLE_NAME['"]\s*,\s*productLikesTable\.tableName\)/],
  ['Contact messages must expire and retain point-in-time recovery', /ContactMessagesTable[\s\S]*pointInTimeRecoveryEnabled\s*:\s*true[\s\S]*timeToLiveAttribute\s*:\s*['"]expiresAt['"]/],
  ['Contact inbox must use the type-and-created-time index', /addGlobalSecondaryIndex\([\s\S]*indexName\s*:\s*['"]byTypeCreatedAt['"][\s\S]*recordType[\s\S]*createdAt/],
  ['Only the contact Function may access contact storage', /contactMessagesTable\.grantReadWriteData\(contactMessagesLambda\)/],
  ['Contact table and index names must be injected by the backend', /CONTACT_MESSAGES_TABLE_NAME[\s\S]*CONTACT_MESSAGES_INDEX_NAME/],
]

const authRequirements = [
  ['The ADMINS Cognito group must exist', /groups\s*:\s*\[['"]ADMINS['"]\]/],
  ['Administrator MFA must be required', /multifactor\s*:\s*\{[\s\S]*mode\s*:\s*['"]REQUIRED['"][\s\S]*totp\s*:\s*true/],
  ['Administrator recovery must remain email-only', /accountRecovery\s*:\s*['"]EMAIL_ONLY['"]/],
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

if (/sourceIp|arguments\.actorKey/.test(`${productLikesHandler}\n${productLikesAbuseControls}`)) {
  failures.push('Product-like Function must not trust an IP address or client-supplied actor key')
}

if (!/PRODUCT_LIKE_RATE_LIMIT_MAX_REQUESTS\s*=\s*60/.test(productLikesAbuseControls) ||
    !/PRODUCT_LIKE_RATE_LIMIT_WINDOW_SECONDS\s*=\s*60/.test(productLikesAbuseControls) ||
    !/ConditionExpression:\s*['"]attribute_not_exists\(requestCount\) OR requestCount < :limit['"]/.test(productLikesAbuseControls)) {
  failures.push('Product-like requests must retain the identity-scoped fixed-window rate limit')
}

if (!/Dimensions:\s*\[\[\]\]/.test(productLikesAbuseControls) || /productSlug.*RateLimitedRequests|actorKey.*RateLimitedRequests/.test(productLikesAbuseControls)) {
  failures.push('Product-like rate-limit metrics must remain aggregate and free of identity or product dimensions')
}

if (!/reservedConcurrentExecutions\s*=\s*PRODUCT_LIKES_RESERVED_CONCURRENCY/.test(productLikesMonitoring) ||
    !/PRODUCT_LIKES_RESERVED_CONCURRENCY\s*=\s*10/.test(productLikesMonitoring) ||
    !/ProductLikeRateLimitAlarm/.test(productLikesMonitoring) ||
    !/ProductLikeThrottleAlarm/.test(productLikesMonitoring)) {
  failures.push('Product-like infrastructure must retain bounded concurrency and abuse alarms')
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

if (!/safeAmazonSpecialLink\(item\.retailerUrl\)/.test(publicCatalogHandler) || !/PROJECTION\s*=.*amazonAsin.*retailerUrl/.test(publicCatalogHandler)) {
  failures.push('Public retailer destinations must be projected only through the Amazon Special Link validator')
}

if (!/host === ['"]amzn\.to['"]/.test(amazonRetailer) || !/searchParams\.get\(['"]tag['"]\) !== AMAZON_ASSOCIATE_ID/.test(amazonRetailer) || !/AMAZON_ASSOCIATE_ID\s*=\s*['"]wantcove-20['"]/.test(amazonRetailer)) {
  failures.push('Retailer links must remain limited to Amazon short links or the exact WantCove Associate tag')
}

if (!/PRODUCT_LIKE_TTL_SECONDS\s*=\s*60\s*\*\s*60\s*\*\s*24\s*\*\s*180/.test(productLikesHandler)) {
  failures.push('Anonymous like records must use the documented 180-day TTL')
}

if (!/ConditionExpression:\s*['"]attribute_not_exists\(productSlug\) OR expiresAt <= :now['"]/.test(productLikesHandler) ||
    !/ConditionExpression:\s*['"]attribute_exists\(productSlug\)['"]/.test(productLikesHandler)) {
  failures.push('Product-like writes must retain conditional idempotency guards')
}

if (!/timeoutSeconds\s*:\s*10/.test(productLikesFunctionResource)) {
  failures.push('Product-like Function must retain a bounded execution timeout')
}

if (!/logging\s*:\s*\{[\s\S]*format\s*:\s*['"]text['"][\s\S]*retention\s*:\s*['"]1 month['"]/.test(productLikesFunctionResource)) {
  failures.push('Product-like Function logs must retain a bounded one-month expiration compatible with aggregate metrics')
}

if (![productLikesFunctionResource, manageProductsFunctionResource, publicCatalogFunctionResource, contactMessagesFunctionResource].every((resource) => /resourceGroupName\s*:\s*['"]data['"]/.test(resource))) {
  failures.push('Data resolver Functions must share the data resource group to avoid nested-stack cycles')
}

if (!/cognitoIdentityId/.test(contactMessagesHandler) || /sourceIp|arguments\.actorKey/.test(`${contactMessagesHandler}\n${contactMessagesAbuseControls}`)) {
  failures.push('Contact submissions must use the server-derived guest identity and never a raw IP or client actor key')
}

if (!/CONTACT_MESSAGE_TTL_SECONDS\s*=\s*60\s*\*\s*60\s*\*\s*24\s*\*\s*90/.test(contactMessagesHandler) || !/ConditionExpression:\s*['"]attribute_not_exists\(id\)['"]/.test(contactMessagesHandler)) {
  failures.push('Contact messages must use a conditional write and documented 90-day TTL')
}

if (!/CONTACT_RATE_LIMIT_MAX_REQUESTS\s*=\s*5/.test(contactMessagesAbuseControls) || !/CONTACT_RATE_LIMIT_WINDOW_SECONDS\s*=\s*60\s*\*\s*10/.test(contactMessagesAbuseControls) || !/Dimensions:\s*\[\[\]\]/.test(contactMessagesAbuseControls)) {
  failures.push('Contact submissions must retain the bounded identity-scoped aggregate rate limit')
}

if (!/CONTACT_MESSAGES_RESERVED_CONCURRENCY\s*=\s*5/.test(contactMessagesMonitoring) || !/ContactMessageRateLimitAlarm/.test(contactMessagesMonitoring) || !/ContactMessageThrottleAlarm/.test(contactMessagesMonitoring)) {
  failures.push('Contact infrastructure must retain bounded concurrency and abuse alarms')
}

if (!/timeoutSeconds\s*:\s*10/.test(contactMessagesFunctionResource) || !/retention\s*:\s*['"]1 month['"]/.test(contactMessagesFunctionResource)) {
  failures.push('Contact Function must retain bounded execution and log retention')
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

if (!/actions\s*:\s*\[['"]appsync:GraphQL['"]\]/.test(adminContactSubmissionPolicy) || !/\/types\/Mutation\/fields\/submitContactMessage/.test(adminContactSubmissionPolicy) || /resources\s*:\s*\[[^\]]*['"]\*['"]/.test(adminContactSubmissionPolicy)) {
  failures.push('The ADMINS contact policy must grant only the submitContactMessage AppSync field')
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log('Backend security invariants verified.')
