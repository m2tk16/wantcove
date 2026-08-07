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
