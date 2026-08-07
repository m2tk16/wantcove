# WantCove project instructions

Read `.agents/WORKFLOW.md`, `.agents/PROJECT_LOG.md`, `.agents/FEATURE_BACKLOG.md`, `.agents/ENVIRONMENTS.md`, `.agents/ARCHITECTURE.md`, and `.agents/LEGAL.md` before changing the project.

Every meaningful change must:

1. Preserve security and privacy boundaries by default.
2. Add or update tests for behavior that changed.
3. Add a dated entry to `.agents/PROJECT_LOG.md` in the same change.
4. Log newly suggested, deferred, or rejected features in `.agents/FEATURE_BACKLOG.md`.
5. Run `npm run check:fast` for normal work. Run `npm run check:full` only for major releases, dependency changes, or backend changes.
6. Preserve the modular dependency direction and thin-boundary rules in `.agents/ARCHITECTURE.md`.
7. Review every release against the Terms and Privacy triggers in `.agents/LEGAL.md` and update affected policies in the same change.

Never deploy, push, create cloud resources, weaken authorization, commit generated `amplify_outputs.json`, or expose a secret without explicit user approval.
