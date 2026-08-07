# WantCove project log

This append-only log is the project’s restart and recovery record. Add the newest entry directly below this introduction. Do not rewrite older entries except to correct a factual error and note the correction.

## 2026-08-07 — Hosted public-catalog decoding repair

### Stage

Local corrective candidate discovered during authenticated Beta catalog acceptance. Production remains unchanged, the temporary test record is archived, and no correction has been committed, pushed, or deployed.

### Observed

- Administrator first sign-in and TOTP enrollment succeeded, and the hosted `/admin` route received the server-issued `ADMINS` claim.
- Create, edit, draft isolation, publish, and archive operations succeeded for an isolated Beta-only record with no Amazon identifier or retailer URL.
- After publication, the administrative view showed `PUBLISHED` and a direct API-key GraphQL request returned the sanitized product, but the public React catalog still omitted it and its product route remained 404.
- AppSync serializes the custom `AWSJSON` result as a JSON string. The thin public client incorrectly accepted only an already-decoded array and silently treated the deployed response as an empty catalog.

### Updated

- Added a narrow public-catalog codec that accepts both deployed AWSJSON strings and already-decoded test payloads, projects only public product fields, filters malformed records, and rejects malformed JSON instead of silently hiding every managed product.
- Updated the public client to use the codec and added focused regression coverage for the deployed response shape, public projection, malformed-record filtering, and invalid JSON.

### Verification

- The focused codec suite passes all 3 tests. `npm run check:fast` passes steering and backend-security invariants, warning-free lint, and all 31 tests; the production frontend build and TypeScript compilation also pass. Hosted Beta acceptance remains pending.
- Legal review: this correction changes response decoding only. It does not change authentication, personal-data handling, cookies, affiliate behavior, outbound links, or policy text, so it does not trigger a Terms or Privacy update.

### Next

- Review the correction and request approval before committing or pushing it to Beta.
- After a successful Beta deployment, republish the isolated record and complete public rendering, managed-like, archive, guarded-delete, and deletion-isolation acceptance.

## 2026-08-07 — Secure administration deployed to Beta

### Stage

Beta deployment and operator bootstrap completed for commit `4bd33e9`. Production remains unchanged, and public affiliate destinations remain disabled.

### Deployed

- Amplify Beta job 9 completed BUILD, DEPLOY, and VERIFY successfully after the three data resolver Functions were colocated with the data stack.
- The Beta backend now includes the Product table and resolvers, protected product-management Function, sanitized public-catalog Functions, dynamic-like publication checks, the Cognito `ADMINS` group, required TOTP MFA, and administrator-only account creation.
- Created the intended administrator through Cognito's invitation flow without generating or exposing a password locally, then verified that the enabled user is in `ADMINS` and awaiting first-login password replacement.

### Verification

- The hosted build ran a clean install, all 28 tests, the production frontend build, the production dependency audit with 0 vulnerabilities, backend synthesis, and backend type checks before deployment.
- CloudFormation reached `UPDATE_COMPLETE`; the previous data/Function nested-stack circular dependency did not recur.
- Amplify reported BUILD, DEPLOY, and VERIFY as successful. Hosted direct requests to `/`, `/admin`, `/privacy`, and `/products/levitating-globe-lamp` returned HTTP 200 with the application shell.
- Browser smoke testing confirmed the public catalog renders managed-read fallback content and disclosures, while `/admin` renders the configured restricted MFA sign-in. The deployed user pool has self-signup disabled, required MFA, software-token TOTP enabled, no SMS MFA, and a live `ADMINS` group.

### Next

- The administrator must use the emailed invitation to choose a permanent password and enroll an authenticator app.
- After first sign-in, exercise create, edit, draft isolation, publish, archive, guarded delete, public catalog projection, and managed-product likes in Beta before any Production promotion.

## 2026-08-07 — Beta job 8 assembly follow-up

### Stage

Corrective local release candidate after Beta job 8 failed during backend assembly. No backend resource, frontend artifact, DEPLOY step, or VERIFY step from job 8 was published; Production remains unchanged.

### Observed

- Amplify's hosted clean test run passed the admin route test but logged that Amplify had not been configured because the route attempted a Cognito session check in the no-outputs test environment.
- Hosted synthesis and backend type checks passed, but Amplify detected a CloudFormation circular dependency between its generated data and Function nested stacks. Product-table grants made the resolver Functions depend on data while the data schema depended on those Functions.

### Updated

- Skip the Cognito session request when branch outputs are unavailable and render the existing disabled, explanatory sign-in state directly.
- Added a focused test proving the unavailable adapter never calls Cognito.
- Assigned the product manager, public catalog, and product-like resolver Functions to Amplify's `data` resource group so the mutually dependent resources synthesize into one nested stack.
- Replaced the deprecated DynamoDB point-in-time-recovery property with the current recovery specification and extended the backend invariant check to require the data-stack placement.

### Verification

- The corrective full gate passed steering and backend-security invariants, warning-free Oxlint, all 28 tests, the production build, and backend TypeScript validation. The integrated audit could not reach npm from the workspace sandbox; the identical approved registry audit reported 0 production vulnerabilities.
- Beta job 8 had already passed its hosted clean install, 27 tests, production build, production audit, backend synthesis, and backend type checks before the nested-stack cycle stopped assembly. DEPLOY and VERIFY were cancelled, and no cloud resource changed.
- Hosted confirmation of the resource-group correction remains pending the next Beta job.

### Next

- Run the required full gate, publish the corrective commit to Beta, and verify that the next job completes BUILD, DEPLOY, and VERIFY before creating an administrator.

## 2026-08-07 — Secure administrator and managed-product foundation

### Stage

Local backend release candidate. No Cognito user, cloud resource, commit, push, Amplify job, Beta deployment, or Production change was created in this update.

### Updated

- Added a private `/admin` workflow with administrator-created email sign-in, temporary-password continuation, authenticator setup, TOTP challenges, session checks, explicit non-admin denial, and sign-out.
- Configured the Gen 2 Cognito pool with a server-issued `ADMINS` group, required TOTP MFA, email-only recovery, and self-registration disabled.
- Added a GraphQL-backed Product model keyed by slug with draft, published, and archived lifecycle states. The model grants admins read access only; it exposes no direct model mutation authorization.
- Added a least-privilege product-management Function for create, update, publish, archive, and conditional delete. The Function rechecks the `ADMINS` claim and validates slugs, bounded text, HTTPS images, ranks, ASINs, and Amazon retailer hosts before writing.
- Added a read-only public catalog Function that projects only public fields and returns only `PUBLISHED` records. Public reads use a 365-day API key so browsing does not create a Cognito guest identity before consent, and affiliate ASINs/URLs remain absent from the public payload while links are disabled. Managed products load through a thin typed adapter and merge over the existing starter fixtures during migration.
- Extended anonymous likes so a managed slug is accepted only when the Product table confirms that it is published. The four existing starter slugs retain their compatibility allowlist until fixture migration.
- Added modular admin auth, data-client, sign-in, editor, manager, and page components plus responsive theme-aware styling. `/admin` is intentionally absent from public navigation.
- Updated the Privacy Policy and Terms to describe private administrative authentication and managed catalog storage while keeping public registration and commercial retailer links disabled.
- Added invariant, Function, route, MFA, and admin workflow tests. Logged fixture migration and immutable admin audit history as follow-up work.

### Decisions

- Authorize administrators using Cognito group claims at both AppSync and Function boundaries; never compare the submitted or displayed email address to an allowlist in the browser.
- Use a bounded public API key only for sanitized read operations; preserve Cognito guest identity issuance for preference-consented like requests.
- Require MFA for the current private user pool. Revisit pool topology before introducing public accounts so customer authentication policy can be designed independently.
- Store Amazon-provided URLs but keep the public retailer button disabled until Associates enrollment, required disclosures, operator details, and legal review are complete.
- Keep existing demo content visible while managed records are introduced, then migrate and remove the compatibility layer as a separate reversible change.
- Reserve starter slugs until that migration so archiving a managed record cannot accidentally reveal a same-slug fixture. Suppress referrer information on product image requests and track first-party image storage plus CSP as pre-launch hardening.

### Verification

- `npm run check:full` passed steering and backend-security invariants, warning-free Oxlint, all 27 tests, the production build, and Amplify backend TypeScript validation. Its production-audit subprocess could not reach the npm registry inside the workspace sandbox; the identical audit was rerun with approved registry access and reported 0 vulnerabilities.
- Focused tests cover all five product lifecycle actions, conditional writes, non-admin rejection, serialized group claims, URL validation, draft isolation, public projection and pagination, dynamic-like publication checks, MFA challenge handling, protected-route behavior, and the admin UI workflow.
- Rendered desktop checks passed for the unconfigured `/admin` state in light and dark themes. The route remained absent from public navigation and sign-in remained disabled without branch outputs. The available browser surface could not emulate a mobile viewport; responsive rules and component behavior passed automated review, while hosted mobile acceptance remains required in Beta.
- Data impact: the next Beta deployment will add one Product table, two Functions, a bounded public API key, Product-table grants for the likes Function, a Cognito `ADMINS` group, required TOTP MFA, and disabled self-registration. No existing Collection or product-like row is migrated or rewritten.
- Rollback: revert this release before deployment, or promote a tested revert through Beta. If rollback occurs after Product records are created, export or deliberately retain those records before removing the model; do not delete the Product table ad hoc.

### Next

- Complete the full release gate and review the generated infrastructure diff and data impact.
- After explicit approval, commit and push to `beta` only, verify the hosted backend, then create the intended administrator in Cognito and add that verified user to `ADMINS`.
- Exercise first-login password replacement, TOTP enrollment, draft lifecycle operations, published-only public reads, and dynamic likes in Beta before considering any Production promotion.

## 2026-08-07 — Administration, affiliate, and contact research

### Stage

Planning only. No application, authentication, data, email, affiliate-link, cloud-resource, commit, push, or deployment change was made.

### Researched

- Confirmed that Amazon SiteStripe can generate product Special Links with the Associate and tracking IDs already included, making manual product onboarding viable before API access.
- Confirmed that an initial Associates application has 180 days to refer three qualifying sales for Amazon's review. Creators API registration requires a fully accepted account with qualifying sales, and the current introduction names at least 10 qualifying sales in the trailing 30 days.
- Confirmed that Product Advertising API 5.0 was deprecated on May 15, 2026; any future integration must target Amazon's OAuth 2.0 Creators API instead.
- Confirmed that Creators API can return detail-page URLs, titles/item information, Amazon-hosted image URLs, and OffersV2 price/availability data. Current guidance permits one-hour caching for offers and one-day caching for most other product resources.
- Confirmed that Amazon requires a clear disclosure near affiliate links plus the site statement `As an Amazon Associate I earn from qualifying purchases.` once WantCove participates.
- Confirmed that Amplify Gen 2 supports Google and Apple federation through Cognito, secret-managed provider credentials, callback/logout URLs, and server-enforced Cognito group authorization.
- Confirmed that Amazon SES requires a verified sender identity; while the account is in the SES sandbox, recipients must also be verified and sending is capped at 200 messages per day and one message per second.

### Recommendation

- Build the admin route and group-enforced GraphQL product workflow before public social login. Use the existing Cognito email login with MFA for the first administrator, manually place the verified user in `ADMINS`, and never rely on the browser or an email string for authorization.
- Make manual SiteStripe onboarding the first commercial slice. Store Amazon-provided URLs unchanged, use original/licensed imagery, support draft/publish/archive, and avoid manually asserted Amazon ratings or time-sensitive prices until Creators API access is available.
- Add Google sign-in later as convenience for the administrator or when public cross-device likes/collections justify accounts. Defer Apple sign-in during the web-only phase.
- Implement contact as a bounded guest GraphQL request to a Function that sends through SES from a verified WantCove identity to the fixed monitored address, with Reply-To set to the visitor, spam/rate controls, safe text handling, and explicit retention/privacy terms.

### Next

- Confirm the recommended first slice: admin authentication plus manual product create/edit/archive/publish.
- Collect the Amazon Associates store/tracking ID and generated SiteStripe links only after enrollment; keep all commercial links disabled until disclosures and release blockers are complete.
- Treat the contact form and Creators API as separate later backend changes with their own threat model, legal review, tests, and full release gates.

## 2026-08-07 — Hosted guest-like payload repair

### Stage

Local corrective release candidate after Amplify Beta job 6 deployed successfully but the hosted acceptance test found that cloud likes fell back to session-only state. Production remains unchanged.

### Observed

- Amplify Beta job 6 for commit `e8965a9` succeeded through BUILD, DEPLOY, and VERIFY.
- Hosted Home, Categories, New arrivals, Top picks, Deals, Terms, and Privacy routes rendered successfully; privacy-choice dismissal and the light/dark theme toggle also worked.
- The first optimistic Like → Unlike UI cycle appeared successful, but a reload-oriented check exposed the session-only fallback.
- CloudWatch reported `Cannot read properties of undefined (reading 'fieldName')` for the deployed product-likes Function. Amplify's generated direct Lambda resolver supplies the operation arguments and identity but does not supply the assumed `event.info` object.

### Updated

- Derived the operation from the schema-controlled argument shape: omitted `liked` performs the query read; a boolean `liked` performs the mutation write or delete.
- Updated the Function tests to use the real deployed event shape without `event.info`, preventing the same false-positive contract assumption.

### Verification

- The focused Function test initially hit Vitest's known pre-import Windows worker-start timeout; an unchanged retry passed all 4 Function tests in 6.36 seconds.
- The required full backend gate passed steering and security invariants, warning-free Oxlint, all 12 tests, the production build, and Amplify backend TypeScript validation.
- The full-gate audit request was blocked by the workspace network sandbox; the identical production audit was rerun with registry access and reported 0 vulnerabilities.
- Amplify Beta job 7 deployed commit `172b031` successfully through BUILD, DEPLOY, and VERIFY.
- Hosted cloud reads completed without session fallback; a Like persisted after a full reload, and the subsequent Unlike deletion also persisted after a full reload.
- The acceptance test removed its temporary DynamoDB row, and the Function emitted no CloudWatch `ERROR` events during the post-deploy test window.

### Next

- Commit the hosted verification record after explicit approval.
- Keep Production unchanged until the full Beta release is reviewed and explicitly approved for promotion.

## 2026-08-06 — Beta like-handler compatibility repair

### Stage

Corrective local release candidate after Amplify Beta job 5 failed during backend assembly. No backend resource, frontend artifact, DEPLOY step, or VERIFY step from job 5 was published.

### Observed

- Amplify's hosted clean install, 8 tests, lint, production build, backend TypeScript check, and production audit all passed for commit `907fd57`.
- Gen 2 backend synthesis and its type checks passed, but assembly validation rejected Identity Pool authorization on `a.handler.custom`; Amplify reports that `allow.guest()` and `allow.authenticated('identityPool')` are not currently supported with AppSync-JS custom handlers.
- Job 5 ended in BUILD failure at that guardrail; DEPLOY and VERIFY were cancelled.

### Updated

- Replaced the unsupported AppSync-JS handlers with one Amplify Function while preserving the existing typed GraphQL query and mutation.
- Kept the actor key server-derived from the AppSync Cognito Identity context; the browser still cannot submit an actor identity, and raw IP remains unused.
- Granted only that Function read/write access to the isolated product-like table and injected the generated table name through Amplify's supported Function environment API.
- Replaced `@aws-appsync/utils` with the current modular DynamoDB SDK packages required by the Function.
- Added four focused Function tests for identity-scoped reads, bounded-TTL writes, unlike deletion, and unknown-product/missing-identity rejection. The suite now contains 12 tests.
- Changed Vitest from thread workers to one serial fork after clean Windows installs twice exceeded the thread-worker startup deadline before the React test file loaded; the forked runner has no worker handshake deadline and still limits execution to one test file at a time.
- Extended security invariants to require the supported Function handler, bounded timeout, least-privilege table grant, generated table-name injection, server-derived identity, and absence of an AppSync-JS handler on the guest operations.
- Recorded the Identity Pool custom-handler compatibility rule in `.agents/ARCHITECTURE.md` to prevent recurrence.

### Decisions

- Accept a small Lambda invocation/cold-start cost for anonymous likes rather than switch to an API key, expose a broadly writable model, accept a client-supplied identity, or use raw IP addresses.
- Keep the frontend GraphQL contract, consent behavior, table key design, point-in-time recovery, and approximately 180-day TTL unchanged.

### Verification

- Amplify's exact `npm ci --cache .npm --prefer-offline` completed from the repaired lockfile with 1,058 packages installed.
- The forked runner passed all 12 tests immediately after that clean install; the cold run took 81.06 seconds without a worker startup failure.
- `npm run check:full` passed from the clean tree: steering and backend-security invariants, warning-free Oxlint, 12 tests, production build, Amplify backend TypeScript validation, and 0 production dependency vulnerabilities.
- Development-tool audit remains at 20 advisories (1 moderate, 19 high); no forced or breaking audit fix was applied.

### Next

- Request explicit approval for the corrective commit and Beta push.
- Monitor the next Beta job through BUILD, DEPLOY, and VERIFY; then smoke-test guest like/unlike behavior before any Production promotion.

## 2026-08-06 — Consent-aware themes and anonymous product likes

### Stage

Local Beta release candidate. No commit, push, cloud resource change, or deployment was made in this update.

### Updated

- Added accessible light and dark themes using semantic surface and text tokens; checked normal-text color pairs at 5.22:1 or higher and primary text above 17:1.
- Added a fixed side privacy panel with Allow preferences and Essential only choices, plus a persistent footer control for reopening the panel.
- Kept theme and like changes session-only when preferences are declined or Amplify outputs are unavailable; no advertising cookie was introduced.
- Added thin, typed GraphQL like operations and a shared React like-state feature so repeated product cards stay synchronized.
- Added a dedicated DynamoDB product-like table with product-slug partition keys, server-derived Cognito Identity IDs as sort keys, pay-per-request billing, point-in-time recovery, and approximately 180-day TTL records.
- Preserved Cognito user-pool authorization as the Data API default and limited guest/identity-pool access to the two scalar like operations.
- Added resolver and infrastructure invariant checks that reject client-supplied identity, raw-IP identity, unknown product slugs, and missing Cognito guest identities.
- Updated the Terms and Privacy Policy for anonymous likes, AWS processing, browser storage choices, retention, and manipulation safeguards.
- Added GraphQL-first data-boundary steering and logged future catalog migration plus anonymous-like abuse monitoring/rate limiting.
- Added `@aws-appsync/utils` for typed AppSync JavaScript resolver helpers; the refreshed development-tool audit decreased from 25 to 20 advisories (1 moderate, 19 high), while the production audit remains clean.

### Verification

- `npm run check:full` passed: steering and security invariants, warning-free Oxlint, 8 focused tests, production build, Amplify backend TypeScript validation, and 0 production dependency vulnerabilities.
- Post-gate clean-install validation found and repaired four bundled OpenTelemetry lock entries removed by npm's initial metadata refresh. Windows initially blocked replacement of Vite's loaded native binding while the local preview remained open; after the verified preview process was stopped, `npm ci --cache .npm --prefer-offline` completed successfully with 1,051 packages restored. Correction: the transient incomplete `node_modules` state is resolved; commit and push remain blocked only until the final full gate passes and the user explicitly approves publication.
- The first gate immediately after the clean install hit a one-time Vitest worker startup timeout before any test loaded; an isolated rerun passed all 8 tests, and the subsequent fully captured `npm run check:full` passed in 20.8 seconds. The runner-startup condition is resolved and did not require a code or test-policy exception.
- Automated coverage verifies privacy-choice behavior, session-only decline behavior, accessible theme switching, duplicate-card like synchronization, legal routes, catalog routes, and mobile navigation.
- Rendered desktop and 390-pixel mobile checks passed in light and dark themes with no browser warnings or errors.
- Rendered QA found and fixed a desktop product-image collapse caused by percentage height sizing; the full-size product image was rechecked after the fix.
- Data impact review: this adds a new isolated table and GraphQL fields; it does not migrate or rewrite existing Collection data. Branch deployment will create a separate table in each branch stack.
- Rollback: revert the source change before deployment, or promote a later revert through Beta; the new table is isolated from existing owner-scoped Collection records.

### Next

- Review this release candidate, then commit and push to `beta` only with explicit approval.
- Verify Beta stack synthesis, guest identity issuance, like/unlike persistence, TTL configuration, and Privacy/Terms routes before considering a Production promotion.
- Add monitoring and rate limiting before showing aggregate like counts or broadly promoting anonymous writes.
- Keep Production commercialization and account launch blocked on operator identity, monitored contact, jurisdiction review, and qualified legal review.

## 2026-08-06 — Dependency advisory baseline refreshed

### Stage

Post-deployment security backlog reconciliation after regenerating the lockfile.

### Updated

- Corrected the tracked development-tool advisory baseline from 20 to 25 after the clean-install repair changed lockfile metadata.
- Kept the item at P1 Security; the application runtime remains unaffected by the currently reported advisories.

### Verification

- Full `npm audit --json` reported 6 moderate and 19 high development-tree advisories, with no low or critical advisories.
- The release gate's `npm audit --omit=dev --audit-level=high` reported 0 production dependency vulnerabilities.

### Next

- Review safe Amplify/CDK upgrades separately; do not use a forced breaking audit fix.

## 2026-08-06 — Collection ownership reassignment blocked

### Stage

Security hardening discovered during the first hosted Amplify Gen 2 update.

### Observed

- Amplify warned that the owner-authorized `Collection` model allowed an owner to reassign a record to another user by default.
- AWS documents field-level owner authorization as the control that prevents this reassignment.

### Updated

- Added an explicit `owner` field that permits its owner to read or delete the field but not update it.
- Preserved deny-by-default Cognito user-pool authorization and model-level owner-only CRUD access.
- Added `verify:security` to the fast gate so owner scope, immutable ownership, and the user-pool default fail closed if removed.
- Recorded the completed P1 security hardening in `.agents/FEATURE_BACKLOG.md`.
- Logged Amplify build-runtime setup optimization as a future high-value, low-effort item after observing repeated default global-tool installation.

### Verification

- `npm run check:full` passed: steering and backend-security invariants, clean Oxlint, 5 tests, production build, backend TypeScript validation, and 0 production dependency vulnerabilities.
- Data impact review: the existing implicit `owner` field becomes explicit with stricter resolver authorization; no table replacement or data-shape migration is expected.
- Amplify `beta` job 4 and `main` job 4 passed BUILD, DEPLOY, and VERIFY for commit `43086df`.
- Both hosted synthesis logs completed without the ownership-reassignment warning.
- Home, product, Terms, and Privacy routes returned HTTP 200 on both stages after the resolver update.

### Next

- Configure required GitHub checks and branch protection for `beta` and `main`.
- Optimize the Amplify build bootstrap before deployment frequency increases.

## 2026-08-06 — Initial Amplify deployments verified

### Stage

Beta and Production are deployed from the same verified commit with separate Amplify Gen 2 backend stacks.

### Updated

- Published repair commit `3a6ca2c` to both `beta` and `main`.
- Completed `beta` job 2 and `main` job 2 successfully across BUILD, DEPLOY, and VERIFY.
- Labeled the Amplify `beta` branch as stage `BETA`; `main` remains `PRODUCTION`, with auto-build enabled for both.
- Replaced the inherited `404-200` fallback with AWS's documented asset-aware SPA rewrite to `/index.html` using status `200`.
- Preserved the existing temporary redirect from `https://wantcove.com` to `https://www.wantcove.com`.
- Recorded the hosted stage URLs and Amplify app ID in `.agents/ENVIRONMENTS.md`.

### Verification

- Local `npm run check:full` passed before publication: steering, lint, 5 tests, production build, backend typecheck, and 0 production dependency vulnerabilities.
- Amplify's Beta build log independently passed the same checks before deploying the Gen 2 auth and owner-scoped data resources.
- `https://beta.dzrkss4yfifm3.amplifyapp.com` and `https://main.dzrkss4yfifm3.amplifyapp.com` returned HTTP 200.
- Direct product, Terms, and Privacy routes returned HTTP 200 on both stages after the SPA rewrite correction.
- Rendered-browser checks passed for the Beta product route and Production Privacy route with no console warnings or errors.

### Next

- Configure required GitHub checks and branch protection for both persistent branches.
- Keep commercial retailer actions disabled until affiliate enrollment, approved destinations, disclosures, and legal release blockers are resolved.
- Promote future changes through Beta acceptance before Production rather than pushing both persistent branches together.

## 2026-08-06 — Initial Amplify deployment repair

### Stage

Amplify app `dzrkss4yfifm3` is connected; first Beta and Production jobs failed before resource deployment.

### Observed

- `beta` job 1 and `main` job 1 failed during the backend `npm ci` command.
- The shared cause was an out-of-sync package lock under the clean Amplify build environment.
- No backend, frontend, or verification deployment step ran after the failed install.

### Updated

- Regenerated `package-lock.json` using Node 22.22.0 and npm 10.9.4.
- Added `.nvmrc`, package engine metadata, and explicit Node 22.22.0 selection in `amplify.yml`.
- Reproduced Amplify’s exact `npm ci --cache .npm --prefer-offline` command locally; it completed successfully.

### Verification

- Amplify's exact `npm ci --cache .npm --prefer-offline` command passed from the regenerated lockfile.
- `npm run check:full` passed: steering verification, clean Oxlint, 5 tests, production build, backend TypeScript validation, and 0 production dependency vulnerabilities.
- Hosted verification remains pending the second Beta and Production deployment jobs.

### Next

- Publish the same repair commit to `beta` and `main`.
- Monitor both second deployment jobs through BUILD, DEPLOY, and VERIFY.
- Record hosted URLs and smoke-test results only after both jobs succeed.

## 2026-08-06 — Initial Git branches published

### Stage

Verified source is published to GitHub; Amplify is not connected and nothing is deployed.

### Updated

- Created root commit `1dd0158` on `main` and published it to `m2tk16/wantcove`.
- Created and published `beta` at the same verified commit.
- Confirmed AWS account `178450627339` is available and contains no existing WantCove Amplify app.
- Attempted the Amplify Console connection; interactive AWS sign-in is required in the in-app browser before repository authorization can continue.

### Verification

- Both remote branches resolved to the same release candidate when published.
- The full release gate passed before branch creation.

### Next

- Configure required GitHub checks and branch protection for `beta` and `main`.
- Sign in to AWS Amplify Console, authorize the GitHub repository, and connect `beta` first with automatic deployment held until settings are reviewed.
- Add `main` as Production only after Beta acceptance and legal release blockers are cleared.

## 2026-08-06 — Modular architecture and legal baseline

### Stage

Pre-commit release candidate; no remote branch, AWS resource, or deployment created.

### Updated

- Added enforceable modular-architecture and legal-policy steering documents.
- Refactored the single-file catalog into thin app composition, feature-owned catalog and legal modules, shared layout/navigation, typed product data, and reusable product components.
- Added footer-only Terms of Service and Privacy Policy routes with effective dates and pre-release blockers.
- Added a clear product-level affiliate notice explaining commission, off-site navigation, retailer control, and privacy boundaries.
- Preserved inactive retailer actions until affiliate enrollment, destinations, disclosure language, and external-link security are approved.
- Removed unused Vite starter media and standardized repository text line endings.

### Decisions

- Use FTC-aligned, close-to-link disclosures rather than relying on footer policies alone.
- Do not publish an Amazon Associates identification statement until WantCove is actually enrolled and uses Amazon Special Links.
- Block Beta accounts/commercial links and Production until operator identity, monitored contact method, jurisdiction, and qualified legal review are recorded.

### Verification

- `npm run check:full` passed: steering verification, clean Oxlint, 5 route/legal/interaction tests, production build, backend TypeScript validation, and production dependency audit.
- Production dependency audit: 0 vulnerabilities.
- Generated product PNGs remain 1.7–2.2 MB each; optimization is tracked before Beta acceptance.

### Next

- Add the legal operator identity, contact channel, and jurisdiction.
- Complete the full release gate, then create the initial Git history and remote `beta`/`main` branches.
- Connect Amplify only after the remote branches exist and branch protections are configured.

## 2026-08-06 — Discovery catalog mockup pass

### Stage

Local UI foundation; no commit, remote branch, AWS resource, or deployment created.

### Updated

- Reworked the interface into a responsive curated-product discovery catalog based on the supplied desktop and mobile mockups.
- Added Home, Categories, New arrivals, Top picks, Deals, product detail, mobile drawer, and 404 experiences.
- Generated and added four original product images for the globe lamp, dumbbells, pizza oven, and wireless earbuds.
- Documented the two-stage Amplify topology: `beta` for acceptance and `main` for production.
- Expanded tests to cover catalog content, product detail disclosure, categories, 404, and the mobile menu.

### Decisions

- Use one React application and one Amplify Gen 2 app with isolated branch backends for beta and production.
- Keep retailer actions inert until affiliate destinations, disclosure language, and outbound-link security are approved.
- Keep owner-scoped saved collections as a later authenticated feature behind the public catalog.

### Verification

- `npm run check:fast` passed: steering verification, Oxlint, and 4 catalog route/interaction tests.

### Next

- Review the product direction and copy.
- Create and push the initial `main` and `beta` branches only after explicit approval.
- Connect the Amplify app to both branches, then add stage-specific smoke tests and SPA rewrites.

## 2026-08-06 — Foundation and guardrails

### Stage

Local foundation; not committed, pushed, sandboxed, or deployed.

### Updated

- Replaced the Vite demo with a responsive WantCove route shell for Home, Discover, Collections, About, Sign in, and 404 states.
- Added router and component test dependencies plus route coverage.
- Replaced the guest-writable Todo schema with an owner-only Collection schema using Cognito user-pool authorization.
- Added steering instructions, prioritized backlog, fast/full checks, CI, and an Amplify Gen 2 build specification.

### Decisions

- Keep the initial UI data-free until a personal Amplify sandbox generates client outputs.
- Treat each user’s collections as private by default.
- Use fast checks for routine changes and the full check for releases, dependencies, and backend updates.

### Verification

- `npm run check:full` passed: steering verification, Oxlint, 3 route tests, production build, backend TypeScript validation, and production dependency audit.
- Production dependency audit: 0 vulnerabilities.
- Removed React Router after its available versions produced high-severity advisories; replaced it with a small tested browser-history router.
- Full development audit still reports 20 advisories in Amplify/CDK code-generation tooling. These do not ship in the browser bundle; track upstream fixes before cloud deployment and do not run backend tooling on untrusted branches.

### Next

- Review the supplied visual mockups when they are available in the workspace.
- Create the first Amplify app/branch and personal sandbox only after the initial commit is reviewed.
- Connect Cognito UI and live Collection data after sandbox outputs exist.
