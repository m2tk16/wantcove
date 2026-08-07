# WantCove environments

WantCove uses one React application, one repository, and one AWS Amplify Gen 2 application with two persistent deployed branches.

| Stage | Git branch | Purpose | Promotion |
| --- | --- | --- | --- |
| Beta | `beta` | Integration, acceptance testing, and backend validation | Reviewed changes are merged from feature work into `beta`. |
| Production | `main` | Public production application and production backend | A reviewed pull request promotes the exact beta-approved commit to `main`. |

Personal `ampx sandbox` environments are disposable developer tooling and are not a third product stage.

## Guardrails

- `main` and `beta` must both be protected and require CI.
- Amplify branch auto-detection should be limited to `beta` and `main`; do not deploy every feature branch.
- Production deploys only from `main` after beta acceptance and `npm run check:full`.
- Beta and production must not share databases, Cognito pools, storage buckets, secrets, or generated output files.
- Use separate stage-specific secrets in Amplify. Never copy production secrets into beta.
- Roll back by redeploying the last known-good commit; do not repair production manually.
