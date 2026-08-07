# WantCove

A responsive React and TypeScript application backed by AWS Amplify Gen 2.

The product currently uses a curated discovery catalog shell with responsive Home, Categories, New arrivals, Top picks, Deals, and product-detail routes.

Source code follows a feature-oriented architecture: `src/app` composes routes, `src/features` owns product and legal capabilities, and `src/shared` contains reusable layout and navigation. Architecture and legal change-control rules live under `.agents/`.

## Local development

```sh
npm install
npm run dev
```

Routine changes use the fast guardrail:

```sh
npm run check:fast
```

Major releases, dependency changes, and anything under `amplify/` use:

```sh
npm run check:full
```

## Amplify Gen 2 initialization

The code-first backend is defined in `amplify/`. Before connecting live UI behavior, create an isolated developer environment with `npx ampx sandbox`; this generates the ignored `amplify_outputs.json` used by the frontend.

For hosted environments, connect the GitHub repository and its reviewed branch in the Amplify console. The committed `amplify.yml` runs the full guardrail before `ampx pipeline-deploy`, then publishes the Vite `dist` output.

When the hosted app is connected, add the standard single-page-app rewrite in Amplify Hosting so direct requests such as `/collections` serve `index.html`, then verify each route from a fresh browser session.

Do not commit sandbox outputs, credentials, or local state. See `AGENTS.md` and `.agents/WORKFLOW.md` before changing the project.

## Environments

There is one React app and one Amplify Gen 2 app. Amplify maps the protected `beta` branch to the Beta environment and protected `main` to Production. See `.agents/ENVIRONMENTS.md` for promotion and isolation rules.
