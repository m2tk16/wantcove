# WantCove feature backlog

Log every proposed feature here when it is suggested. Assign a priority using `.agents/WORKFLOW.md`; do not silently promote an item because it is exciting or recent.

## Candidate features

| Priority | Feature | Value / effort | Status | Notes |
| --- | --- | --- | --- | --- |
| P1 Security | Bind required CI check to GitHub Actions source | Medium / Low | Proposed | Ruleset `20574550` requires `Branch policy check`, but the effective rule has no expected-source integration binding. Select GitHub Actions as the source if GitHub exposes it so another write-capable integration cannot satisfy a same-named status. |
| P1 Security | Resolve Amplify/CDK development-tool advisories | High / Medium | Tracking | Runtime audit is clean; the current development toolchain reports 20 advisories (1 moderate, 19 high), primarily in the Amplify/CDK tree. Do not apply npm's suggested major-version downgrades. |
| P1 Security | Anonymous-like abuse monitoring and rate limits | High / Medium | Planned | Cognito guest identity prevents duplicate rows per browser identity, but clearing browser storage can create a new identity. Add metrics and throttling before public promotion or aggregate counts. |
| P1 Security | Public catalog API-key expiry monitoring | High / Low | Proposed | The read-only catalog key expires within 365 days. Add an operational reminder or alert well before expiry and verify branch deployments refresh it without exposing any write field. |
| P1 Security | First-party product image storage and CSP | High / Medium | Started | Starter media now uses stable first-party `/products/` paths with a server-side path allowlist. Controlled Amplify Storage/CDN delivery, responsive formats, and a restrictive Content Security Policy remain before broad public launch. |
| P1 Security | Cognito authentication UI and session handling | High / Medium | Beta accepted | Administrator first login, permanent-password replacement, required TOTP enrollment, session restoration, group claim, and sign-out passed hosted acceptance. |
| P1 Security | Admin-only catalog access and server-enforced product mutations | High / Medium | Beta accepted | Hosted create, edit, draft isolation, publish, archive, two-step delete, public projection, and deletion cleanup passed. |
| P1 Security | Immutable admin mutation audit history | High / Medium | Proposed | Before adding more administrators, record actor subject, action, product slug, timestamp, and outcome in a least-privilege append-only audit path with a defined retention period. |
| P1 Security | Public contact form abuse and privacy controls | High / Medium | Proposed | Use a bounded guest GraphQL mutation, a least-privilege Function, verified Amazon SES identities, server-side validation, spam/rate controls, and a fixed recipient. Update Privacy/Terms and retention before enabling. |
| P1 Security | Owner-scoped collections and saved items | High / Medium | Started | Collection model is owner-only with reassignment blocked; item model awaits product decisions. |
| P2 Bugs | Visual and interaction QA against supplied mockups | High / Low | In progress | Hosted Beta desktop smoke passed for the catalog and restricted admin route; mobile viewport and authenticated lifecycle QA remain. |
| P2 Bugs | Authenticated-admin Identity Pool like fallback | Medium / Medium | Partial fix Beta accepted | The repeated-request loop is fixed and Beta metrics stayed at four initial calls with no idle growth. Likes can still fall back to session-only while the private Cognito administrator session is active; diagnose the identity transition before public accounts or routine signed-in browsing. |
| P1 Security | Affiliate disclosure and safe outbound-link policy | High / Low | In progress | Associate ID `wantcove-20`, pending-review status, and the exact site identification statement are deployed to Beta. Before live links, use verified Amazon Special Links, retain near-link disclosure, and remove manually asserted ratings/prices unless supplied under current Program Content rules. |
| P1 Security | Legal operator identity, contact, jurisdiction, and counsel review | High / Medium | Release blocker | Required before Beta accounts/commercial links and before Production. |
| P3 High/Low | Modular feature architecture | High / Low | Completed | Thin app shell, shared modules, typed catalog feature, and legal feature added. |
| P1 Security | Isolated beta and production Amplify resources | High / Medium | Completed | Separate branch stacks, auth resources, data resources, and generated outputs were verified during deployment. |
| P3 High/Low | Optimize generated catalog images | High / Low | Proposed | Convert large source PNGs to responsive WebP/AVIF before beta. |
| P3 High/Low | Optimize Amplify build runtime setup | High / Low | Proposed | The pinned Node install reinstalls Amplify image default global tools on every build; reduce setup time without weakening the runtime pin. |
| P3 High/Low | Create, rename, and archive collections | High / Low | Proposed | First useful signed-in workflow. |
| P3 High/Low | Manual Amazon SiteStripe product intake | High / Low | Beta accepted | Admin intake and authenticated lifecycle acceptance passed behind `ADMINS`; Associate ID `wantcove-20` is recorded. Public retailer actions stay inert pending verified Special Links, disclosure, content, and legal launch gates. |
| P3 High/Low | Save a link with title and note | High / Low | Proposed | Keep metadata fetching out of the first slice. |
| P5 High/High | Amazon Creators API product enrichment | High / High | Deferred | Build only after final Associates acceptance and current API eligibility. Keep OAuth credentials server-side; use GetItems/SearchItems for approved links, images, item data, and OffersV2 with Amazon's required cache limits. Do not build new PA-API 5 integration. |
| P5 High/High | Google sign-in for public accounts | High / High | Deferred | Valuable when cross-device likes and collections are ready. For admin convenience, add Google only after server-enforced `ADMINS` authorization; a matching email alone must not grant access. |
| P4 Low/High | Sign in with Apple | Low / High | Deferred | Defer for the web-only phase; it adds Apple Developer enrollment, App/Services IDs, domain/return URL configuration, and private-key lifecycle without improving the first admin workflow. |
| P5 High/High | Shared collections | High / High | Deferred | Requires explicit sharing and authorization design. |
| P4 Low/High | Algorithmic discovery feed | Low / High | Deferred | Conflicts with the calm, intentional initial direction. |

## Completed or rejected

Move items here with a date, outcome, and log reference when implemented or rejected.

- 2026-08-07 — P3 High value, low effort: made the sanitized public GraphQL projection the sole hosted catalog source, removed fixture merging, and passed four-record Beta UI plus fail-closed acceptance.
- 2026-08-07 — P3 High value, low effort: completed starter-fixture migration into Product storage and removed the legacy starter-like allowlist after protected Beta parity and request-rate verification.
- 2026-08-07 — P2 Bug / High value, low effort: corrected shared catalog resolver dispatch to Amplify’s top-level `fieldName`; protected Beta job 17 succeeded, the four-record migration completed, and public GraphQL plus hosted browser acceptance passed.
- 2026-08-07 — P1 Security / High value, low effort: activated repository ruleset `20574550` for `beta` and `main`, requiring pull requests, resolved conversations, a strict `Branch policy check`, deletion protection, force-push protection, and an empty bypass list.
- 2026-08-07 — P1 Security / High value, low effort: pinned the official checkout and setup-node Actions to immutable commits, limited workflow permissions to read-only, and added cancellation for superseded CI runs.
- 2026-08-07 — P2 Bug / High value, low effort: added strict AWSJSON decoding for the public managed catalog after hosted acceptance proved AppSync returns the custom payload as a JSON string; Beta deployment and complete catalog lifecycle acceptance passed.
- 2026-08-06 — P1 Security / High value, low effort: blocked `Collection.owner` reassignment with field-level authorization and added a fast-gate invariant check after Amplify surfaced the default behavior during deployment.
- 2026-08-06 — P1 Security / High value, low effort: added explicit preference controls and a footer-accessible privacy panel; declined preferences remain session-only and no advertising cookie is introduced.
- 2026-08-06 — P1 Security / High value, medium effort: added anonymous product likes through least-privilege GraphQL operations, server-derived Cognito guest identities, bounded DynamoDB retention, and backend invariant checks. Raw IP addresses are not like identifiers.
- 2026-08-06 — P3 High value, low effort: added an accessible light/dark theme with semantic contrast tokens and optional preference persistence.
