# WantCove project log

This append-only log is the project’s restart and recovery record. Add the newest entry directly below this introduction. Do not rewrite older entries except to correct a factual error and note the correction.

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
