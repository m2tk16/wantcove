# WantCove feature backlog

Log every proposed feature here when it is suggested. Assign a priority using `.agents/WORKFLOW.md`; do not silently promote an item because it is exciting or recent.

## Candidate features

| Priority | Feature | Value / effort | Status | Notes |
| --- | --- | --- | --- | --- |
| P1 Security | Protected main branch and required CI checks | High / Low | Next | Configure in GitHub after the first push. |
| P1 Security | Resolve Amplify/CDK development-tool advisories | High / Medium | Tracking | Runtime audit is clean; the current development toolchain reports 25 advisories (6 moderate, 19 high), primarily in the Amplify/CDK tree. |
| P1 Security | Cognito authentication UI and session handling | High / Medium | Planned | Connect only after a non-production sandbox exists. |
| P1 Security | Owner-scoped collections and saved items | High / Medium | Started | Collection model is owner-only with reassignment blocked; item model awaits product decisions. |
| P2 Bugs | Visual and interaction QA against supplied mockups | High / Low | In progress | Initial responsive catalog pass built from two supplied mockups; browser QA remains. |
| P1 Security | Affiliate disclosure and safe outbound-link policy | High / Low | Started | Baseline disclosure and inert button added; enrollment, URLs, and external-link security remain. |
| P1 Security | Legal operator identity, contact, jurisdiction, and counsel review | High / Medium | Release blocker | Required before Beta accounts/commercial links and before Production. |
| P3 High/Low | Modular feature architecture | High / Low | Completed | Thin app shell, shared modules, typed catalog feature, and legal feature added. |
| P1 Security | Isolated beta and production Amplify resources | High / Medium | Completed | Separate branch stacks, auth resources, data resources, and generated outputs were verified during deployment. |
| P3 High/Low | Optimize generated catalog images | High / Low | Proposed | Convert large source PNGs to responsive WebP/AVIF before beta. |
| P3 High/Low | Optimize Amplify build runtime setup | High / Low | Proposed | The pinned Node install reinstalls Amplify image default global tools on every build; reduce setup time without weakening the runtime pin. |
| P3 High/Low | Create, rename, and archive collections | High / Low | Proposed | First useful signed-in workflow. |
| P3 High/Low | Save a link with title and note | High / Low | Proposed | Keep metadata fetching out of the first slice. |
| P5 High/High | Shared collections | High / High | Deferred | Requires explicit sharing and authorization design. |
| P4 Low/High | Algorithmic discovery feed | Low / High | Deferred | Conflicts with the calm, intentional initial direction. |

## Completed or rejected

Move items here with a date, outcome, and log reference when implemented or rejected.

- 2026-08-06 — P1 Security / High value, low effort: blocked `Collection.owner` reassignment with field-level authorization and added a fast-gate invariant check after Amplify surfaced the default behavior during deployment.
