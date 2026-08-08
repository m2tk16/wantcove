# WantCove architecture

WantCove is a professional feature-oriented React application. Keep composition roots thin, business capabilities cohesive, and infrastructure details behind narrow adapters.

## Structure

- `src/app/`: application composition and route resolution only.
- `src/features/<feature>/`: feature-owned components, pages, data, types, hooks, and tests.
- `src/shared/`: reusable presentation, navigation, and utilities with no feature-specific business rules.
- `src/services/`: thin external clients and adapters when live APIs are introduced.
- `amplify/`: backend definitions and authorization boundaries.

## Rules

- Components do one clear job; split pages into reusable components before they become difficult to scan or test.
- Prefer feature modules over generic dumping grounds such as `utils`, `helpers`, or one oversized `components` folder.
- Keep route composition, rendering, data access, and business rules separate.
- External client functions are thin: validate inputs, call one boundary, normalize errors/results, and return typed data. Do not put UI state or broad business workflows in clients.
- Prefer explicit typed props and pure functions. Avoid hidden mutable state, circular dependencies, deep relative cross-feature imports, and duplicated domain models.
- Shared code must be genuinely reusable; do not generalize a component after only one speculative use.
- Keep `App.tsx`, route tables, and backend entry points as composition roots rather than feature implementations.
- Tests live beside or clearly target the behavior they protect. Add focused tests when extracting modules to prevent refactor regressions.
- New architectural patterns require a short decision entry in the project log before broad adoption.

## Dependency direction

`app` may compose `features` and `shared`. Features may use `shared` and typed service interfaces. Shared modules must not import feature modules. Service adapters must not import React components.

## Data boundaries

- GraphQL through Amplify Data is the default boundary for persisted product and user-facing domain data. Static fixtures are acceptable only for isolated prototypes and tests.
- React features call thin typed adapters in `src/services/`; they never access DynamoDB or infrastructure SDKs directly.
- DynamoDB keys, ownership fields, actor identities, timestamps, and other security-sensitive values are derived or validated by backend resolvers rather than trusted from browser input.
- Guest writes require a documented abuse model, explicit least-privilege authorization, bounded retention, and an invariant test. Do not use raw IP addresses as durable user identifiers.
- Identity Pool-authorized custom GraphQL operations use an Amplify Function while Gen 2 rejects `allow.guest()` and `allow.authenticated('identityPool')` on AppSync-JS custom handlers. Grant that Function only the table permissions it needs and derive actor identity from the AppSync event.
- Product records use `slug` as their identifier and move through `DRAFT`, `PUBLISHED`, and `ARCHIVED` states. The model grants the `ADMINS` group read access only; all writes pass through the bounded product-management Function, which validates content, rechecks the Cognito group claim, and performs conditional writes.
- Public catalog operations use a bounded-expiration public API key, return projected JSON from a read-only Function, and reject every record that is not `PUBLISHED`. This avoids creating a Cognito guest identity merely to browse. Drafts, archived records, internal model metadata, and administrative operations never share a public GraphQL field.
- Public Cognito self-registration is disabled. The private administration route supports administrator-created email accounts, requires TOTP MFA, and treats the server-issued `ADMINS` group claim—not a browser email comparison—as the authorization boundary.
- The default Amplify Data authorization remains Cognito user-pool based. Any guest or identity-pool operation must opt in on the smallest possible GraphQL field.
- Cognito User Pool groups emit preferred Identity Pool IAM roles. When a group member needs an Identity Pool operation, grant that group role only the explicitly authorized AppSync fields; do not grant the whole API or replace the server-issued group boundary. Place AppSync field policies in the Data stack when a custom stack already supplies resources or environment values to Data, preventing a reverse dependency and nested-stack cycle.
- Each hosted branch owns an isolated Gen 2 stack. Schema and resolver changes flow through Beta validation before Production promotion.

## Hosting and product-media boundaries

- Root `customHttp.yml` is the reviewed source for Amplify Hosting response headers. Its Content Security Policy stays deny-by-default and allowlists only the first-party application plus the exact regional AppSync and Cognito endpoints used by the frontend; do not add broad AWS, external-image, inline-script, or inline-style allowances.
- Public product media uses first-party `/products/` AVIF, JPEG, PNG, or WebP paths. The administrator UI and backend Function both enforce the path boundary; arbitrary external image hosts are not valid catalog input.
- `src/shared/media/` owns reusable responsive-image rendering. Its explicit manifest may translate known legacy database paths to versioned AVIF/WebP sources, but it must not invent derived URLs for unknown records or import catalog feature code.
- Product-media source variants are versioned in `public/products/`, checked against repository size budgets, and use intrinsic dimensions plus `srcset`/`sizes` to avoid layout shift and oversized mobile transfers.
