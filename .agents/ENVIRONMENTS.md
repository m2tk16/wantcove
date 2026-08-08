# WantCove environments

WantCove uses one React application, one repository, and one AWS Amplify Gen 2 application with two persistent deployed branches.

| Stage | Git branch | Amplify stage | Hosted URL | Purpose | Promotion |
| --- | --- | --- | --- | --- | --- |
| Beta | `beta` | `BETA` | `https://beta.dzrkss4yfifm3.amplifyapp.com` | Integration, acceptance testing, and backend validation | Reviewed changes are merged from feature work into `beta`. |
| Production | `main` | `PRODUCTION` | `https://main.dzrkss4yfifm3.amplifyapp.com` | Public production application and production backend | A reviewed pull request promotes the exact beta-approved commit to `main`. |

Amplify app ID: `dzrkss4yfifm3` in AWS account `178450627339`.

Personal `ampx sandbox` environments are disposable developer tooling and are not a third product stage.

## Guardrails

- `main` and `beta` must both be protected and require CI.
- Amplify branch auto-detection should be limited to `beta` and `main`; do not deploy every feature branch.
- Production deploys only from `main` after beta acceptance and `npm run check:full`.
- Production pull requests must pass `npm run verify:release`; planned or unverified legal/contact details keep the branch blocked.
- Beta and production must not share databases, Cognito pools, storage buckets, secrets, or generated output files.
- Use separate stage-specific secrets in Amplify. Never copy production secrets into beta.
- Roll back by redeploying the last known-good commit; do not repair production manually.
