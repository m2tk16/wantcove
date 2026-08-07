# WantCove workflow

## Priorities

Use the requested order below when choosing work. Items 4 and 6 are intentionally identical because the original priority list repeated “Low Value / High Effort.”

1. Security and privacy
2. Bugs and regressions
3. High value / low effort
4. Low value / high effort
5. High value / high effort
6. Low value / high effort (duplicate tie-breaker)

Within a tier, prefer prerequisites, risk reduction, and smaller reversible changes.

## Change loop

1. Read the project log and backlog.
2. State the intended outcome and identify security or data impact.
3. Make the smallest cohesive change.
4. Create or update tests with the behavior.
5. Update the project log and backlog.
6. Run the appropriate check.

## Architecture review

- Follow the feature-oriented boundaries in `.agents/ARCHITECTURE.md`.
- Keep application entry points and routes thin; move feature behavior into cohesive feature modules.
- Treat oversized files, duplicated domain logic, cross-feature coupling, and mixed UI/data responsibilities as maintainability defects.
- Add thin typed clients under `src/services/` only when a real external boundary exists.

## Legal and policy review

- Review `.agents/LEGAL.md` during planning and again before release.
- A major Terms or Privacy impact requires the policy, effective date, tests, and project log to change together.
- Affiliate disclosures must be visible near compensated links; footer policies alone are not sufficient.
- Production is blocked until the legal operator identity, monitored contact channel, jurisdiction-specific requirements, and qualified review are complete.

## Test policy

- Normal UI/content changes: `npm run check:fast`.
- Major release, dependency update, authentication/data/backend change: `npm run check:full`.
- A failing check blocks commit, push, and deployment unless the exception and owner approval are recorded in the project log.

`check:fast` validates steering files, lint, and focused automated tests. `check:full` adds the production build, backend TypeScript validation, and a production dependency audit.

## Amplify Gen 2 boundaries

- Backend resources live under `amplify/` and are code-reviewed like application code.
- Data access is deny-by-default and owner-scoped unless a documented product requirement says otherwise.
- Use a personal sandbox for backend development; never point local development at production.
- Generated `amplify_outputs*` files and local sandbox state are not committed.
- Production changes flow through a reviewed protected branch and Amplify Hosting, never an ad hoc local deployment.
- Secrets belong in Amplify secret/environment management, never source files or logs.

## Release rule

A release is ready only when the project log names the scope, `npm run check:full` passes, migrations/data impact are reviewed, Terms/Privacy triggers are cleared, rollback is understood, and hosted smoke checks are recorded.
