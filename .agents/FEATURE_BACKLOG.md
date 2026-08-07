# WantCove feature backlog

Log every proposed feature here when it is suggested. Assign a priority using `.agents/WORKFLOW.md`; do not silently promote an item because it is exciting or recent.

## Candidate features

| Priority | Feature | Value / effort | Status | Notes |
| --- | --- | --- | --- | --- |
| P1 Security | Protected main branch and required CI checks | High / Low | Next | Configure in GitHub after the first push. |
| P1 Security | Resolve Amplify/CDK development-tool advisories | High / Medium | Tracking | Runtime audit is clean; the current development toolchain reports 20 advisories (1 moderate, 19 high), primarily in the Amplify/CDK tree. Do not apply npm's suggested major-version downgrades. |
| P1 Security | Anonymous-like abuse monitoring and rate limits | High / Medium | Planned | Cognito guest identity prevents duplicate rows per browser identity, but clearing browser storage can create a new identity. Add metrics and throttling before public promotion or aggregate counts. |
| P1 Security | Public catalog API-key expiry monitoring | High / Low | Proposed | The read-only catalog key expires within 365 days. Add an operational reminder or alert well before expiry and verify branch deployments refresh it without exposing any write field. |
| P1 Security | First-party product image storage and CSP | High / Medium | Proposed | Move approved product media to controlled Amplify Storage/CDN delivery, add a restrictive Content Security Policy, and reduce third-party request exposure before broad public launch. |
| P1 Security | Cognito authentication UI and session handling | High / Medium | Deployed to Beta | Admin invitation is active in `ADMINS`; temporary-password replacement, TOTP enrollment, and authenticated session acceptance remain. |
| P1 Security | Admin-only catalog access and server-enforced product mutations | High / Medium | Deployed to Beta | `/admin` and the protected Function are live in Beta; authenticated lifecycle acceptance remains before Production. |
| P1 Security | Immutable admin mutation audit history | High / Medium | Proposed | Before adding more administrators, record actor subject, action, product slug, timestamp, and outcome in a least-privilege append-only audit path with a defined retention period. |
| P1 Security | Public contact form abuse and privacy controls | High / Medium | Proposed | Use a bounded guest GraphQL mutation, a least-privilege Function, verified Amazon SES identities, server-side validation, spam/rate controls, and a fixed recipient. Update Privacy/Terms and retention before enabling. |
| P1 Security | Owner-scoped collections and saved items | High / Medium | Started | Collection model is owner-only with reassignment blocked; item model awaits product decisions. |
| P2 Bugs | Visual and interaction QA against supplied mockups | High / Low | In progress | Hosted Beta desktop smoke passed for the catalog and restricted admin route; mobile viewport and authenticated lifecycle QA remain. |
| P1 Security | Affiliate disclosure and safe outbound-link policy | High / Low | Started | Baseline disclosure and inert button added. Before live Amazon links: enroll, use Amazon-provided Special Links, add the required Associate identification statement and near-link disclosure, and remove manually asserted Amazon ratings/prices unless supplied under current API/tool rules. |
| P1 Security | Legal operator identity, contact, jurisdiction, and counsel review | High / Medium | Release blocker | Required before Beta accounts/commercial links and before Production. |
| P3 High/Low | Modular feature architecture | High / Low | Completed | Thin app shell, shared modules, typed catalog feature, and legal feature added. |
| P1 Security | Isolated beta and production Amplify resources | High / Medium | Completed | Separate branch stacks, auth resources, data resources, and generated outputs were verified during deployment. |
| P3 High/Low | Optimize generated catalog images | High / Low | Proposed | Convert large source PNGs to responsive WebP/AVIF before beta. |
| P3 High/Low | Optimize Amplify build runtime setup | High / Low | Proposed | The pinned Node install reinstalls Amplify image default global tools on every build; reduce setup time without weakening the runtime pin. |
| P3 High/Low | Create, rename, and archive collections | High / Low | Proposed | First useful signed-in workflow. |
| P3 High/Low | Move catalog reads to GraphQL | High / Low | Started | Published managed products now load through a typed public adapter and merge over starter fixtures. Complete after the fixtures are migrated into Product records. |
| P3 High/Low | Migrate starter fixtures into Product storage | High / Low | Proposed | Create reviewed Product records for the four starter items, confirm hosted parity, then remove the code-fixture compatibility layer and legacy-like allowlist. |
| P3 High/Low | Manual Amazon SiteStripe product intake | High / Low | Deployed to Beta | Admin intake is live behind `ADMINS`; authenticated lifecycle acceptance remains. Public retailer actions stay inert pending enrollment and legal launch gates. |
| P3 High/Low | Save a link with title and note | High / Low | Proposed | Keep metadata fetching out of the first slice. |
| P5 High/High | Amazon Creators API product enrichment | High / High | Deferred | Build only after final Associates acceptance and current API eligibility. Keep OAuth credentials server-side; use GetItems/SearchItems for approved links, images, item data, and OffersV2 with Amazon's required cache limits. Do not build new PA-API 5 integration. |
| P5 High/High | Google sign-in for public accounts | High / High | Deferred | Valuable when cross-device likes and collections are ready. For admin convenience, add Google only after server-enforced `ADMINS` authorization; a matching email alone must not grant access. |
| P4 Low/High | Sign in with Apple | Low / High | Deferred | Defer for the web-only phase; it adds Apple Developer enrollment, App/Services IDs, domain/return URL configuration, and private-key lifecycle without improving the first admin workflow. |
| P5 High/High | Shared collections | High / High | Deferred | Requires explicit sharing and authorization design. |
| P4 Low/High | Algorithmic discovery feed | Low / High | Deferred | Conflicts with the calm, intentional initial direction. |

## Completed or rejected

Move items here with a date, outcome, and log reference when implemented or rejected.

- 2026-08-07 — P2 Bug / High value, low effort: added strict AWSJSON decoding for the public managed catalog after hosted acceptance proved AppSync returns the custom payload as a JSON string; local verification is complete and Beta deployment is pending.
- 2026-08-06 — P1 Security / High value, low effort: blocked `Collection.owner` reassignment with field-level authorization and added a fast-gate invariant check after Amplify surfaced the default behavior during deployment.
- 2026-08-06 — P1 Security / High value, low effort: added explicit preference controls and a footer-accessible privacy panel; declined preferences remain session-only and no advertising cookie is introduced.
- 2026-08-06 — P1 Security / High value, medium effort: added anonymous product likes through least-privilege GraphQL operations, server-derived Cognito guest identities, bounded DynamoDB retention, and backend invariant checks. Raw IP addresses are not like identifiers.
- 2026-08-06 — P3 High value, low effort: added an accessible light/dark theme with semantic contrast tokens and optional preference persistence.
