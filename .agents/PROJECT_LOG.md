# WantCove project log

This append-only log is the project’s restart and recovery record. Add the newest entry directly below this introduction. Do not rewrite older entries except to correct a factual error and note the correction.

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
