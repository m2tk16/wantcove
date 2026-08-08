# WantCove project log

This append-only log is the project’s restart and recovery record. Add the newest entry directly below this introduction. Do not rewrite older entries except to correct a factual error and note the correction.

## 2026-08-07 — Production-readiness gate Beta acceptance

### Stage

Hosted Beta acceptance completed for merge commit `d67e2cf` from PR #11. Amplify Beta job 25 completed BUILD, DEPLOY, and VERIFY successfully. This completion record is local on `codex/record-production-readiness-gate-acceptance`; no documentation commit, push, `main` change, Production deployment, or Production resource has been made.

### Hosted acceptance

- The deployed Terms and Privacy routes display `WantCove` and Tennessee, United States while clearly retaining legal identity, jurisdiction-specific requirements, a verified monitored contact, and qualified review as Production blockers.
- Neither legal route displays the planned `wantcove@gmail.com` address. It remains unavailable or unconfirmed, unverified, and unmonitored rather than being represented publicly as an active contact channel.
- The hosted home route loaded all four GraphQL-backed catalog products, and the existing MFA-protected `ADMINS` session loaded the four managed products without a mutation.
- Browser inspection across Terms, Privacy, home, and administrator routes reported no warning or error.

### Security, legal, rollback, and next

- The machine-readable release profile still truthfully blocks Production on legal-identity review, contact verification, contact monitoring, jurisdiction review, and qualified legal review. Commercial retailer links remain disabled.
- The acceptance flow changed no authentication setting, Product record, like record, GraphQL or DynamoDB data, cookie policy, affiliate destination, secret, or cloud authorization. It performed only read-only hosted checks.
- Production Amplify remains on its earlier successful job 4 at commit `43086df`; the Beta merge did not start a Production job.
- Beta rollback remains redeployment of the previously accepted job 24 commit `dcc8953`. Removing or bypassing the readiness gate is not an acceptable substitute for completing the recorded blockers.
- The local acceptance-documentation fast gate passed steering, backend-security and CI invariants, warning-free lint, and all 54 tests.
- Before any Production promotion, create and verify the public contact mailbox, confirm it is actively monitored, complete the operator and Tennessee/United States review with qualified counsel, and update the readiness record from evidence rather than assumption.

## 2026-08-07 — Production-readiness fail-closed gate candidate

### Stage

Local release-guardrail candidate on `codex/production-readiness-gate`, based on accepted Beta commit `dcc8953`. No commit, push, pull request, Beta deployment, `main` change, Production deployment, or cloud-resource change has been made.

### Recorded facts and implementation

- Recorded the owner-provided public name `WantCove` and location Tennessee, United States without treating either as a reviewed legal-identity or jurisdiction determination.
- Recorded `wantcove@gmail.com` only as a planned contact. The mailbox has not been created or confirmed available, so it remains unverified, unmonitored, and absent from the public Terms and Privacy pages.
- Recorded qualified legal review as not started and kept commercial affiliate links disabled.
- Added `.agents/PRODUCTION_READINESS.json` as a machine-readable readiness record plus `npm run verify:release`, which reports every unresolved blocker and exits unsuccessfully until the record contains verified completion facts.
- Added a `main`-only GitHub Actions readiness step before the existing Production full gate. Beta pull requests retain the fast gate and are not blocked by unfinished Production legal work.
- Updated the pre-release Terms and Privacy text to identify WantCove and Tennessee accurately while stating that legal identity, jurisdiction-specific requirements, a verified monitored contact, and qualified review remain incomplete.

### Security, legal, testing, and rollback

- The gate fails closed and is covered by policy tests so a Production pull request cannot silently omit it. Affiliate links also cannot be marked enabled while launch approval is false.
- This record is operational change control, not legal advice. No placeholder, planned email, or owner assumption is accepted as completed review evidence.
- The change adds no authentication, personal-data processing, GraphQL operation, database record, cookie, affiliate destination, secret, or cloud resource. Production remains on its earlier known-good deployment.
- Rollback is a reviewed removal of the readiness profile, validator, CI step, and associated policy wording. A rollback must not be used to bypass incomplete Production requirements.
- Focused policy and legal coverage passed, and final verification passed steering, backend-security and CI invariants, warning-free lint, all 54 tests, the production build, backend TypeScript validation, and a production dependency audit with 0 vulnerabilities; the integrated audit could not reach npm from the workspace sandbox, and the identical network-enabled audit passed immediately afterward. `npm run verify:release` separately failed exactly on the five truthful open blockers: legal identity review, contact verification, contact monitoring, jurisdiction review, and qualified legal review. Review the complete diff and request explicit commit approval afterward.

## 2026-08-07 — Self-service administrator password recovery Beta acceptance

### Stage

Hosted Beta acceptance completed for merge commit `29aa0cb` from PR #9. Amplify Beta job 23 completed BUILD, DEPLOY, and VERIFY successfully, and the direct `/admin/forgot-password` route returned HTTP 200. This completion record is local on `codex/record-password-recovery-acceptance`; no documentation commit, push, Production branch, or Production resource has been changed.

### Hosted acceptance

- The owner privately requested recovery for the existing administrator account, received the email code, replaced the password, and confirmed that the new password works. No password, recovery code, authenticator code, or session token was shared with the repository, project log, automation, or support conversation.
- The existing authenticator remained required after recovery, and administrator access continued to depend on the server-issued `ADMINS` group rather than the recovered password alone.
- Read-only Cognito verification confirmed that `m2tk16@gmail.com` remains enabled, `CONFIRMED`, and email-verified after the recovery lifecycle.
- The deployed Terms and Privacy routes describe administrative recovery processing, and public self-registration remains disabled.

### Security, data, legal, and rollback review

- Account-neutral request messaging, email-only Cognito recovery, required TOTP, and server-enforced administrator authorization remain intact. The accepted flow did not reveal account eligibility or create an account.
- Recovery changed only the owner-selected Cognito password. It created no Product, catalog, like, GraphQL, or DynamoDB record and introduced no cookie, affiliate destination, or additional processor.
- The same-release Terms and Privacy updates now match the hosted behavior. Operator identity, monitored contact, jurisdiction, qualified review, and affiliate launch requirements remain separate Production blockers.
- Rollback remains a reviewed removal of the route and client integration through Beta. Rolling back the UI does not revert the owner-selected password or weaken the Cognito account.

### Verification and next

- Local release gates before merge passed steering, security and CI invariants, warning-free lint, all 49 tests, the production build, backend TypeScript validation, and a production dependency audit with 0 vulnerabilities. GitHub’s required `Branch policy check` passed before merge.
- Record this hosted result through the protected documentation PR flow, then continue with the remaining Production-readiness security and legal blockers. Production remains on its earlier known-good deployment.

## 2026-08-07 — Self-service administrator password recovery candidate

### Stage

Local authentication candidate on `codex/admin-password-recovery`, based on accepted Beta commit `a31033c`. No commit, push, Cognito account change, recovery message, Beta deployment, Production branch, or Production resource has been created.

### Updated

- Added the footer-hidden `/admin/forgot-password` route and linked it only from the restricted administrator sign-in panel.
- Kept the feature modular: the page and recovery state live in the admin feature while a thin typed service calls Amplify Auth `resetPassword` and `confirmResetPassword`.
- Every initial and repeated recovery request shows the same account-neutral response even when Cognito rejects the request, preventing the page from confirming whether an email belongs to an eligible, disabled, throttled, or unknown account.
- Confirmation requires a six-digit code, a password of at least twelve characters, and matching password fields. Successful recovery clears the code and password fields before rendering completion.

### Security, data, legal, and rollback review

- The existing backend remains admin-create-only with email-only account recovery, required TOTP MFA, and server-issued `ADMINS` group authorization. Resetting a password does not enroll a user, remove MFA, grant group membership, or authorize a catalog mutation.
- Recovery codes and replacement passwords are sent directly to Amazon Cognito through Amplify Auth. WantCove does not write them to browser storage, application logs, GraphQL, DynamoDB, or catalog records.
- No backend resource, schema, data migration, cookie, affiliate link, or third-party processor is added. The Terms account section and Privacy authentication, purpose, retention, and security disclosures were updated for the real recovery flow; the same-day August 7 updated date remains accurate.
- Rollback is a reviewed removal of the route, sign-in link, and client adapter. Existing Cognito email-only recovery configuration and administrator accounts remain unchanged.

### Tests and next

- Added focused regressions for account-neutral rejected requests, matching-password confirmation, secret-field removal after success, mismatch rejection before Cognito, route privacy, and the email-only backend invariant.
- The complete authentication-change gate passes: steering, backend-security and CI invariants; warning-free lint; all 49 tests; the production frontend build; and backend TypeScript validation. The integrated audit could not reach npm from the workspace sandbox; the identical network-enabled production audit completed immediately afterward with 0 vulnerabilities.
- Review the complete diff and request explicit commit approval. After protected Beta deployment, verify real code delivery and password replacement privately without exposing the email code or password, then confirm MFA and `ADMINS` sign-in still succeed.

## 2026-08-07 — Authenticated administrator likes Beta acceptance

### Stage

Hosted Beta acceptance completed for merge commit `650d00e` from PR #7. Amplify Beta job 21 completed BUILD, DEPLOY, and VERIFY successfully. This completion record is local on `codex/record-admin-like-acceptance`; no documentation commit, push, Production branch, or Production resource has been changed.

### Hosted acceptance

- Cognito confirmed the administrator account remains enabled, `CONFIRMED`, and email-verified after the owner completed a private password reset. No password, TOTP code, session token, or recovery secret was entered into the repository, browser automation, or project log.
- The hosted `/admin` route restored the authenticated session for `m2tk16@gmail.com`, displayed the server-issued `ADMINS` group state, and retained required MFA protection.
- On the hosted levitating-globe product route, signed-in Like persisted after a full reload. The subsequent Unlike deletion also persisted after a full reload, leaving no temporary acceptance like behind.
- Browser inspection reported no warning or error during the complete lifecycle.

### Backend and request-rate evidence

- Read-only deployment inspection confirmed the existing `ADMINS` preferred role has one inline policy limited to `appsync:GraphQL` on only `getViewerProductLike` and `setViewerProductLike` for the Beta AppSync API.
- CloudWatch recorded the bounded lifecycle traffic: four Function invocations during the initial authenticated page-load minute and fourteen during the deliberate Like → reload → Unlike → reload minute. The fourteen calls are the expected four product reads per render plus the two explicit mutations; both metric windows reported zero Lambda errors, and no additional invocation datapoint appeared through the following three idle minutes.
- The acceptance flow made no Product mutation, catalog migration, affiliate activation, or Production request.

### Security, legal, rollback, and next

- Actor identity remains server-derived from Cognito, likes remain identity-scoped with bounded retention, and the administrator receives no catalog or API-wide permission from this repair.
- The repair and password recovery introduce no new cookie, personal-data use, affiliate destination, purchase flow, or disclosure claim. Terms and Privacy therefore do not require an update.
- Rollback remains a reviewed removal of the two-field policy through Beta; no Product or like-row migration is required.
- Record this accepted result through the protected documentation PR flow. Production promotion remains a separate major release requiring an explicit approval, a fresh full release gate, legal-blocker review, rollback review, and hosted smoke checks.

## 2026-08-07 — Admin like-policy stack-cycle correction

### Stage

Local corrective backend candidate on `codex/fix-admin-like-policy-stack`, based on Beta merge commit `6c7ddbb` from PR #6. Amplify Beta job 20 failed safely during BUILD; DEPLOY and VERIFY were cancelled, so hosted Beta resources and data remain on the previously accepted backend. Production remains untouched.

### Failure evidence and correction

- Job 20 passed repository checks and asset publication, then Amplify synthesis reported a circular dependency between the Data and ProductLikes nested stacks.
- ProductLikes already supplies its DynamoDB table name and permissions to the Data-group resolver Function, so Data depends on ProductLikes. Creating the administrator AppSync policy in ProductLikes added the reverse ProductLikes → Data API reference.
- Moved only the policy construct’s scope to the Data stack. Data already owns the AppSync API and depends on Auth, so attaching the exact field policy to the existing `ADMINS` role adds no reverse dependency.
- Strengthened the backend invariant to require `backend.data.stack` as the policy scope and prevent recurrence. The CDK synthesis regression continues to require one `appsync:GraphQL` statement, exactly two like-field ARNs, the intended role attachment, and no wildcard.

### Security, data, legal, and rollback review

- Authorization is unchanged from the reviewed intent: only `getViewerProductLike` and `setViewerProductLike` are added to the `ADMINS` preferred IAM role. No API-wide, model, DynamoDB, admin-mutation, public, or self-registration access is added.
- The failed job made no deployment or data change. The corrective candidate performs no data migration or rewrite and does not change actor identity, published-product validation, or retention.
- Terms, Privacy, cookies, affiliate behavior, and outbound destinations are unaffected.
- Rollback remains removal of the field-scoped policy; the hosted pre-job-20 backend is already the effective rollback state.

### Tests and next

- The complete backend-change gate passes: steering, security and CI invariants; warning-free lint; all 46 tests; production build; backend TypeScript validation; and a production dependency audit with 0 vulnerabilities. The audit was rerun with network access after the sandbox blocked npm’s registry endpoint.
- Use the protected Beta PR flow. A successful Amplify BUILD/DEPLOY/VERIFY is required before signed-in Like → reload → Unlike → reload acceptance and idle-request monitoring.

## 2026-08-07 — Authenticated administrator like-role repair candidate

### Stage

Local backend authorization repair on `codex/fix-admin-like-identity`, based on merged Beta commit `6217889`. No commit, push, deployment, hosted data write, Production branch, or Production resource has been changed.

### Root cause and change

- Read-only inspection confirmed that the Beta Identity Pool uses token-based role mapping. Cognito therefore honors the `ADMINS` User Pool group’s preferred IAM role for the signed-in administrator instead of the generic authenticated role.
- The generated generic authenticated and guest roles each had a field-scoped AppSync policy for the two like operations, while the preferred `ADMINS` role had no attached or inline policy. This explains why anonymous likes worked and the administrator fell back to session-only state before the Function was invoked.
- Added a narrow CDK policy granting the existing `ADMINS` preferred role only `appsync:GraphQL` on `getViewerProductLike` and `setViewerProductLike`.
- The policy is synthesized in the existing third `ProductLikes` stack so it may reference both the Auth role and Data API without introducing an Auth↔Data circular dependency.

### Security, data, legal, and rollback review

- User Pool group membership and required TOTP remain the administrator boundary. Default Data authorization remains User Pool based; no public field, model permission, self-registration path, admin mutation, DynamoDB permission, wildcard resource, or client-supplied identity was added.
- The like Function still derives the actor key from the AppSync Cognito Identity ID, validates a consistently read `PUBLISHED` product, and retains the 180-day TTL. Existing Product and like rows are not migrated or rewritten by this change.
- No new cookie, personal data, affiliate destination, purchase flow, disclosure, Terms, or Privacy practice is introduced, so the legal documents do not require an update.
- Rollback is a reviewed revert of the field-scoped policy. A rollback removes signed-in administrator cloud-like access but does not delete data or broaden another role.

### Tests and next

- Added a CDK synthesis regression that asserts one IAM policy with exactly the two like-field ARNs, the single `appsync:GraphQL` action, the `ADMINS` role attachment, and no wildcard or product-management field.
- The full authorization-change gate passes: steering, backend-security and CI invariants; warning-free lint; all 46 tests; production build; backend TypeScript validation; and a production dependency audit with 0 vulnerabilities. The audit was rerun with network access after the sandbox blocked npm’s registry endpoint.
- After a protected Beta deployment, verify signed-in Like → reload persistence → Unlike → reload removal, confirm the Function receives the requests without an idle request loop, and inspect the deployed preferred-role policy before closing the backlog bug.

## 2026-08-07 — GraphQL catalog and request-loop Beta acceptance

### Stage

Hosted Beta acceptance completed for merge commit `5ed8d72` from PR #4. This completion record is local on `codex/record-catalog-acceptance`; no documentation commit, push, Production branch, or Production resource has been changed.

### Deployment evidence

- The remote `beta` branch resolves to `5ed8d7253da15a5f90992e1693957e7409b54b75`, whose merge message identifies PR #4 and the reviewed fixture-removal commit `2263211`.
- Amplify Beta job 18 completed BUILD, DEPLOY, and VERIFY successfully. BUILD completed at 2026-08-08 01:49:48 UTC and the complete job reached `SUCCEED` at 01:49:56 UTC.
- Production remained untouched; no migration action, Product write, affiliate destination, or Production promotion occurred during deployment.

### Hosted acceptance

- The anonymous storefront rendered exactly the four managed Product records with the accepted featured order, first-party images, display prices, and display ratings. No code fixture is available to fill a missing live record.
- The global footer displayed the exact Amazon Associate identification statement and continued to state that retailer links remain disabled. The restricted `/admin` route continued to present administrator-only MFA sign-in in the signed-out verification session.
- Browser logs contained no application error. CloudWatch recorded exactly four Beta product-like Function invocations during the initial hosted page-load minute—one for each unique product even though each appears in two sections—and no additional invocation datapoint through the following idle metrics windows. The repeated-request storm did not recur.
- The hosted session was intentionally not given administrator credentials. The automated regression separately covers the rejected cloud-read path with duplicate cards and proves one request plus a stable session-only fallback; the underlying signed-in administrator Identity Pool fallback remains a separate tracked bug.

### Security, data, legal, and rollback review

- Every hosted product now comes from the read-only public GraphQL projection, and every like path verifies a consistently read `PUBLISHED` Product before touching the identity-scoped like table. Missing, draft, archived, or failed catalog reads fail closed.
- The four migrated Product rows remain unchanged. Normal administrator archive/delete behavior is now authoritative because there is no public fixture fallback; reserved starter slugs remain recoverable only through the deliberate non-overwriting migration.
- The required Amazon site statement is now deployed, but near-link disclosure, verified Special Links, Program Content compliance, operator/contact/jurisdiction details, and qualified review still block every commercial retailer action and Production.
- Rollback remains a reviewed revert of `5ed8d72` through Beta. No data rollback is required unless an administrator independently changes Product lifecycle state.

### Verification and next

- Local release gates before merge passed steering, security and CI invariants, warning-free lint, all 45 tests, the production build, backend TypeScript validation, and a production audit with 0 vulnerabilities. GitHub’s required `Branch policy check` passed before merge.
- Record this hosted result through the protected documentation flow, then prioritize the remaining authenticated-admin Identity Pool fallback and other P1/P2 guardrails before affiliate-link activation or Production promotion.

## 2026-08-07 — Managed-catalog Beta acceptance and fixture-removal candidate

### Stage

Hosted phase-one acceptance is complete on Beta commit `3c2d80a` after PR #3 merged and Amplify job 17 completed BUILD, DEPLOY, and VERIFY. Phase-two cleanup is local on `codex/remove-catalog-fixture-fallback`; no cleanup commit, push, deployment, cloud mutation, or Production change has been created.

### Beta acceptance

- The authenticated administrator migration completed once and produced exactly the four expected `PUBLISHED` Product records. The migration panel disappeared, all four managed cards loaded their first-party images, and no affiliate destination was activated.
- A read-only public GraphQL check returned the same four slugs in featured order with the expected image paths, display prices, and display ratings. The sanitized response contained no Amazon ASIN or retailer URL.
- Dynamic hosted-browser checks confirmed that the home page and a product-detail route render from the managed records, related-product navigation remains intact, retailer actions remain disabled with disclosure text visible, and the browser console reported no application errors.

### Phase-two cleanup

- Replaced live fixture merging with direct GraphQL catalog replacement. A failed live read clears any initial test data and shows a bounded unavailable message instead of silently restoring code fixtures.
- Kept initial-product and catalog-gateway injection only as explicit test/story seams; the production app supplies neither and therefore uses the Amplify public catalog as its sole product source.
- Removed the legacy starter-slug like allowlist. Every like read or mutation now consistently reads the Product table and rejects records that are missing or not `PUBLISHED` before accessing the identity-scoped like table.
- Removed the temporary starter archive/delete restriction and its `Fallback protected` UI. With no public fixture fallback, migrated records now follow the normal administrator lifecycle; starter slugs remain reserved from ordinary creation so the idempotent migration remains the recovery path for a missing record.

### GraphQL request-loop correction

- Owner testing exposed dozens of repeated GraphQL requests. A cloud-like failure produced a session-only state, but the like loader depended on that state; every update recreated the loader and retriggered every visible Like button.
- Stabilized the loader around a current-state ref and the intentional privacy/gateway dependencies. Duplicate cards still deduplicate in-flight work, a failed cloud attempt settles once into session-only state, and navigation or a later privacy-choice change can intentionally retry.
- Added a regression test with two cards for one product and a rejected cloud read; both cards receive the bounded fallback message and the gateway is called exactly once.

### Amazon Associates record

- Recorded the owner-provided public Associate ID `wantcove-20`, Associates Central access, pending post-sale review status, and the notice’s 180-day qualified-referral condition. The notice did not provide an exact enrollment date, so no deadline date was inferred.
- Did not record the applicant’s personal name or any account credential in this public repository. Associate passwords, verification codes, tax/payment details, and API credentials remain prohibited from source and logs.
- Rechecked Amazon’s official disclosure help and Operating Agreement. Added the required site identification statement to the global footer and Terms while leaving every retailer action disabled; the existing near-link disclosure remains ready for the separate launch gate.

### Security, data, rollback, and legal review

- Public catalog failure is fail-closed, draft/archived records cannot be liked, actor identity remains server-derived from Cognito, and all existing `ADMINS`, conditional-write, projection, TTL, and affiliate-link boundaries remain intact.
- The cleanup itself writes no data. The four accepted Beta Product rows remain unchanged. After deployment, archiving removes a record from the public catalog and deleting it makes that reserved slug eligible for deliberate non-overwriting migration recovery.
- Rollback is a normal reviewed code revert through Beta; no row transformation or destructive cleanup is required. A rollback after an administrator lifecycle change must account for the older fixture behavior before promotion.
- Catalog and like changes add no personal data, cookie, account, outbound destination, or purchase flow. The newly active Associates enrollment changes the disclosed affiliate relationship, so Terms and the global site statement are updated in this same candidate. Privacy is unchanged because no affiliate link, click tracking, retailer request, or new data flow is enabled. Affiliate and Production legal gates otherwise remain unchanged.

### Verification and next

- Focused routing, catalog-provider, admin, migration, and product-like suites pass all 35 tests. The backend-security invariant now rejects fixture merging and a legacy like allowlist.
- The required full backend gate passes steering, backend-security and CI-policy invariants, warning-free lint, all 45 tests, the production frontend build, and backend TypeScript validation.
- The integrated audit step could not reach npm from the workspace sandbox; the identical approved registry audit completed immediately afterward and reported 0 production vulnerabilities.
- Review the complete diff, commit locally, and request explicit approval before pushing the protected phase-two branch.

## 2026-08-07 — Starter-migration dispatch correction

### Stage

Local corrective backend candidate on `codex/fix-starter-migration-dispatch`, branched from Beta merge commit `c77ff71`. No corrective commit, push, deployment, Product row, or Production change has been created.

### Observed

- PR #2 merged successfully and Amplify Beta job 16 completed BUILD, DEPLOY, and VERIFY for `c77ff71`; hosted `/`, `/admin`, and all four first-party image assets returned HTTP 200.
- The authenticated administrator saw the expected pre-migration count of four, but the first migration attempt returned `Cannot read properties of undefined (reading 'trim')` and still showed zero managed products.
- The generated Beta AppSync request mapping was inspected read-only. It places the server-controlled operation name in top-level `fieldName`; the shared Function checked `event.info.fieldName`, fell through to normal product slug validation, and stopped before any DynamoDB read or write.

### Corrected

- Dispatch the shared catalog Function from Amplify’s actual top-level `fieldName`, retaining the standard `info.fieldName` fallback for compatibility.
- Harden slug validation so malformed runtime input returns the bounded domain validation message instead of a raw JavaScript type error.
- Updated Function and security-invariant tests to use and require the deployed Amplify payload shape.

### Security, data, and legal review

- The operation name remains server-controlled by the generated resolver; no client argument can select the migration path. Existing `ADMINS` authorization, server-side group verification, consistent reads, conditional transaction, non-overwrite behavior, and affiliate exclusions remain unchanged.
- The failed hosted attempt created no Product rows because dispatch failed before the first storage command. No cleanup or rollback is required.
- This correction changes internal resolver routing only. It adds no personal data, cookie, account, outbound link, commercial claim, or affiliate behavior, so no Terms or Privacy update is triggered. Production remains blocked and untouched.

### Verification and next

- The focused manage-products suite passes all 13 tests using the deployed top-level payload shape. The full local gate passes steering, backend-security and CI-policy invariants, warning-free lint, all 42 tests, the production frontend build, and backend TypeScript validation.
- The integrated audit step could not reach npm from the workspace sandbox; the identical approved registry audit completed immediately afterward and reported 0 production vulnerabilities.
- Review and commit the correction locally, then request explicit approval before pushing the protected corrective branch.
- After protected Beta deployment, retry the one-time migration and verify four protected published records plus public catalog parity before removing compatibility fallback.

## 2026-08-07 — Guarded starter-catalog migration candidate

### Stage

Local first-phase backend and data release candidate on `codex/graphql-catalog-migration`. No commit, push, deployment, cloud mutation, Beta data row, or Production resource was created by this update.

### Updated

- Added an `ADMINS`-only GraphQL migration that consistently reads the four reserved starter slugs and transactionally creates only records proven missing. Every write retains `attribute_not_exists(slug)`, repeated runs leave existing records untouched, and unprocessed DynamoDB reads are retried before any write decision.
- Starter records are created as published with server timestamps, existing display text, first-party `/products/` image paths, display-only price/rating labels, and no ASIN or retailer URL. The public projection exposes the display labels but continues to exclude affiliate identifiers and destinations.
- Moved the four starter images to stable Vite `public/products/` paths and constrained managed first-party images to conservative raster filenames under that directory; external image locations must still be credential-free HTTPS URLs without custom ports.
- Added an administrator migration control with missing-record count and a non-overwrite explanation. While fixture fallback remains active, both the Function and UI protect migrated starters from archive/delete so removed managed rows cannot silently reveal fallback fixtures.

### Data, rollback, and compatibility

- A hosted administrator must deliberately invoke the migration after Beta deployment; deployment alone creates no Product rows. One successful invocation can add at most the four documented records.
- The code-fixture merge and legacy starter-like allowlist remain in place for this phase, preventing an empty storefront during rollout. They will be removed only in a separate release after Beta proves all four managed records and public parity.
- If Beta acceptance fails, keep or restore the fixture-compatible code and do not run the migration again. The conditional migration never overwrites operator-edited records; any later data cleanup requires an explicit reviewed operation after fallback behavior is accounted for.

### Security and legal review

- Server-side `ADMINS` claim verification, draft/public separation, Amazon-host validation, inert affiliate actions, and the sanitized public catalog remain intact. The migration seed contains no commercial link or tracking identifier.
- This phase changes storage location and preserves already visible demonstration labels; it adds no account, cookie, personal data, outbound destination, purchase flow, or new product claim. No Terms or Privacy text update is triggered. Real retailer pricing, ratings, and Special Links remain blocked by the affiliate/legal launch gates, and Production remains blocked by operator identity, monitored contact, jurisdiction, and qualified review.

### Verification

- The full local gate passed steering, backend-security and CI-policy invariants, warning-free lint, all 41 tests, the production frontend build, and backend TypeScript validation.
- The integrated audit step could not reach npm from the workspace sandbox; the identical approved registry audit completed immediately afterward and reported 0 production vulnerabilities.

### Next

- Review the final diff, commit locally, and request explicit owner approval before pushing the protected feature branch.
- Open a pull request into Beta, confirm the strict branch check and Amplify deployment, invoke the migration once as the administrator, and verify four managed/public products before preparing the compatibility-removal release.

## 2026-08-07 — Protected release-branch ruleset activated

### Stage

Repository ruleset `20574550` (`Protected release branches`) is active for `beta` and `main`. This completion record is being prepared on `codex/record-branch-protection` so it must use the newly enforced pull-request workflow. Production code and AWS resources remain unchanged.

### Enforced

- Both release branches reject deletion and non-fast-forward updates, require every change to arrive through a pull request, require review conversations to be resolved, and require the strict `Branch policy check` before merging.
- The bypass list is empty. Required approving reviews remain at zero while the repository has one maintainer, preventing self-review deadlock while preserving the pull-request trail and CI gate.
- GitHub Actions remains limited to GitHub-authored or owner-authored actions, requires immutable action SHAs, uses a read-only workflow token, and cannot create or approve pull requests.

### Verification

- GitHub CI run `31227942694` completed successfully for Beta commit `1470897`; its required job was reported as `Branch policy check`.
- Amplify Beta job 14 completed BUILD, DEPLOY, and VERIFY successfully for the same commit. Production remained untouched.
- GitHub's effective-rules endpoints report the same four active rules for both branches. The required check is currently recorded without an expected-source integration binding; track binding it specifically to GitHub Actions if the repository UI exposes that option.

### Security and legal review

- The ruleset applies to human and automated pushes equally and prevents direct release-branch updates, but it supplements rather than replaces code review, tests, least-privilege cloud authorization, and release judgment.
- This repository-governance change does not alter runtime authentication, personal-data handling, cookies, affiliate behavior, or outbound links. No Terms or Privacy update is triggered, and the existing Production legal blockers remain in effect.

### Next

- Commit this record on the feature branch, request explicit approval before pushing it, open a pull request into `beta`, and confirm the required check blocks merging until it succeeds.
- After the protected-flow acceptance passes, resume the highest-priority product backlog work without weakening the ruleset.

## 2026-08-07 — GitHub Actions enabled and Beta job 13 verified

### Stage

The owner enabled GitHub Actions for the repository after the Actions page revealed that workflow execution was still globally disabled. The existing Beta push was not replayed, branch protection remains pending, and Production remains unchanged.

### Verified

- GitHub recorded commit `30cf111` on `beta`, but created no workflow run because the repository-level Actions feature was disabled at the time of the push. The owner enabled the feature from the repository Actions page after preserving the previously configured source restrictions, immutable-SHA requirement, read-only workflow token, and pull-request controls.
- Amplify Beta job 13 completed BUILD, DEPLOY, and VERIFY successfully for `30cf111`. The hosted build completed backend synthesis and type checks, CloudFormation reached `UPDATE_COMPLETE`, the production frontend build passed, and the deployment and verification phases succeeded.
- A new Beta event is required to prove the GitHub `Branch policy check`. This documentation-only checkpoint supplies that auditable event after explicit push approval.

### Security and legal review

- Enabling Actions activates only the reviewed read-only workflow. It does not grant repository write access, expose secrets, alter runtime authentication or data, enable affiliate links, or change cookie behavior.
- No Terms or Privacy trigger applies. Production remains blocked by the existing operator-identity, contact, jurisdiction, and qualified-review requirements.

### Next

- Run the fast gate, commit this checkpoint locally, and request explicit approval before pushing it to Beta.
- Verify the GitHub `Branch policy check` and Amplify deployment, then configure protected rules for `beta` and `main`.

## 2026-08-07 — GitHub Actions repository guardrails configured

### Stage

Repository-level GitHub Actions permissions were configured by the owner after the branch-policy workflow reached Beta. Branch protection is still pending, no Production branch or resource was changed, and this documentation checkpoint has not yet been pushed.

### Configured

- Limited allowed workflows to actions authored in `m2tk16` repositories plus GitHub-authored actions; third-party Marketplace actions remain disabled.
- Required actions to be pinned to full-length commit SHAs.
- Kept the default workflow token at read-only repository contents and packages permissions.
- Kept GitHub Actions from creating or approving pull requests and retained approval for first-time external contributors.

### Verification

- Amplify Beta job 12 completed BUILD, DEPLOY, and VERIFY successfully for commit `de96f41`; its clean hosted gate passed all 34 tests, the production frontend build, backend checks, and a production dependency audit reporting 0 vulnerabilities.
- The owner confirmed both repository settings sections were saved. GitHub Actions does not retroactively run the workflow for the earlier push, so a new Beta commit is required to prove the hosted `Branch policy check` before it can be required by branch rules.
- This checkpoint changes repository operations documentation only. It does not alter runtime behavior, authentication, stored data, cookies, affiliate behavior, outbound links, or Terms/Privacy content.

### Next

- Push this documentation checkpoint to Beta only after explicit owner approval, then verify both GitHub Actions and Amplify complete successfully.
- After the check name exists in GitHub, protect `beta` and `main` with required pull requests, required `Branch policy check`, deletion protection, force-push protection, and no bypass.

## 2026-08-07 — Branch-policy CI guardrail

### Stage

Local security guardrail candidate. No GitHub setting, commit, push, deployment, cloud resource, or Production resource was changed.

### Updated

- Run CI for pull requests and pushes targeting both `beta` and `main`.
- Use one stable `Branch policy check` that runs the fast gate for Beta and the full release gate for Production, allowing the same named check to be required on both protected branches.
- Keep workflow repository permissions read-only, cancel superseded runs, and pin the official checkout and setup-node Actions to the immutable commits currently referenced by their official v4 tags.
- Added a local CI-policy verifier and regression tests that reject removal of the Production full gate, elevated contents permission, `pull_request_target`, or missing immutable pins.

### Security and release review

- The workflow does not receive write permission or secrets and does not use `pull_request_target`, reducing untrusted pull-request risk.
- GitHub branch protection remains an external configuration step: both branches must require pull requests and the `Branch policy check`, restrict direct pushes and force pushes, and prevent deletion before the backlog item can be completed.
- This change affects repository automation only. It does not change runtime data, authentication, cookies, affiliate behavior, or Terms/Privacy content.

### Verification

- The focused CI-policy verifier and all 3 policy regression tests pass. `npm run check:fast` passes steering, backend-security and CI-policy invariants, warning-free lint, and all 34 tests.
- The initial focused verifier run exposed an unbounded multiline permission regex that could hang on valid YAML. Replacing it with a bounded single-line permission match resolved the verifier defect before the full gate.

### Next

- Review the workflow diff and request approval before commit or push.
- After explicit approval, push the existing acceptance record and this guardrail to Beta, verify CI and Amplify, then configure and confirm GitHub protection for `beta` and `main`.

## 2026-08-07 — Managed catalog Beta acceptance completed

### Stage

Hosted Beta acceptance completed for catalog correction commit `b36fc4c` and Amplify job 11. Production remains unchanged, no commercial retailer link was enabled, and all temporary acceptance data was removed.

### Verified

- Amplify job 11 completed BUILD, DEPLOY, and VERIFY successfully after a clean install, all 31 tests, production frontend compilation, backend type checks, backend deployment, and a production dependency audit reporting 0 vulnerabilities.
- The MFA-protected administrator session carried the server-issued `ADMINS` claim and completed create, edit, draft isolation, publish, archive, and two-step guarded-delete operations against an isolated product with no ASIN or retailer URL.
- A draft returned the public 404 experience. After publication, the corrected AWSJSON decoder rendered the managed product on its direct route with the retailer action disabled and the nearby affiliate disclosure visible.
- After the administrator signed out, an explicitly consented anonymous Like persisted across a full reload, and Unlike removed the persisted state across another reload.
- After archive and guarded delete, the admin catalog was empty, public GraphQL returned an empty list and `null` for the deleted slug, the Product table returned no item, the product-like table returned a count of 0 for the slug, and the public route returned the 404 experience.

### Observed edge case

- With the private Cognito administrator session active, the Identity Pool like client fell back to session-only state before reaching the like Function. The intended anonymous flow is healthy, but authenticated-admin like synchronization needs investigation before public accounts or routine signed-in browsing are introduced.

### Legal and data review

- The correction changes only deployed AWSJSON decoding and does not alter authentication scope, cookie choices, personal-data processing, affiliate behavior, or outbound links. No Terms or Privacy update is triggered.
- The temporary Product and like rows were deleted. Existing starter fixtures, Collection data, and Production resources were not changed.

### Next

- Keep the authenticated-admin Identity Pool like edge case in the bug backlog and resolve it before public account support.
- Migrate the four reviewed starter fixtures into Product storage as the next high-value GraphQL catalog slice, while keeping affiliate links disabled.

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
