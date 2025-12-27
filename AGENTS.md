# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React + TypeScript app entry (`main.tsx`), root component (`App.tsx`), and styles (`index.css`, `App.css`).
- `src/assets/` holds bundled assets imported by components.
- `public/` is for static files served as-is (example: `public/vite.svg`).
- `docs/` keeps project planning notes (`DECISIONS.md`, `ROADMAP.md`, `TODO.md`).
- Tooling lives at the repo root (`vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `index.html`).

## Build, Test, and Development Commands
- `npm run dev` starts the Vite dev server with HMR.
- `npm run build` type-checks (`tsc -b`) and builds production assets.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the project.

## Coding Style & Naming Conventions
- Use TypeScript with functional React components.
- Indentation is 2 spaces; prefer single quotes and omit semicolons (match existing files).
- Components use PascalCase filenames (e.g., `App.tsx`); hooks/helpers use camelCase.
- Keep component styles in `src/*.css` and import them from the owning component.
- ESLint is configured; Prettier is available via dev dependencies if you want formatting.

## Testing Guidelines
- No automated test runner is configured yet.
- If adding tests, place them near the source (e.g., `src/Feature.test.tsx`) and document the new test command in `package.json`.
- Keep tests deterministic and focused on user-visible behavior.

## Commit & Pull Request Guidelines
- Commit messages in history are short, imperative sentences (example: `Add initial decisions, roadmap, and TODO for project planning`).
- PRs should include a clear summary, link to any related issue, and screenshots or GIFs for UI changes.
- Before opening a PR, run `npm run lint` and `npm run build` to verify quality.

## Configuration & Security Tips
- Vite supports `.env` files; store secrets in `.env.local` and never commit them.
