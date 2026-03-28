# CLAUDE.md — Hospital Bed Expansion Planner

This file provides guidance for AI assistants (Claude Code and others) working in this repository.

## Project Overview

**MAMC Expansion Planner** is a React single-page application for planning hospital bed expansion for the Defense Health Agency (MAMC = Madigan Army Medical Center). The project is in its early scaffolding phase — the build tooling is in place but the core application logic has not yet been implemented.

## Repository Structure

```
Hospital-bed-expansion-planner/
├── index.html          # HTML entry point; mounts React to <div id="root">
├── vite.config.js      # Vite build config (React plugin only)
├── package.json        # Project metadata, dependencies, and npm scripts
├── src/
│   └── main.jsx        # React 18 entry point; renders <App /> in StrictMode
└── README.md           # Project README (currently empty placeholder)
```

**Note:** `src/App.jsx` does not exist yet. It is imported by `main.jsx` and must be created before the app will run.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18.3.x |
| Build Tool | Vite 5.4.x |
| Language | JavaScript (ESM), JSX |
| React Plugin | @vitejs/plugin-react 4.3.x |

No TypeScript, no CSS preprocessors, no routing library, no state management library, and no testing framework have been added yet.

## Development Workflows

### Setup

```bash
npm install       # Install dependencies (node_modules not committed)
```

### Common Commands

```bash
npm run dev       # Start Vite dev server with HMR (default: http://localhost:5173)
npm run build     # Build optimized production bundle to dist/
npm run preview   # Serve the production build locally for inspection
```

### Branch Strategy

- `main` — primary integration branch
- `master` — legacy branch (keep in sync with main)
- Feature branches use the format `claude/<description>-<id>` or similar

Always develop on a feature branch and open a PR to `main`.

## Code Conventions

- **Module system:** ES Modules (`import`/`export`). Do not use CommonJS (`require`).
- **File naming:** React components use PascalCase (e.g., `BedAllocationTable.jsx`). Utility/helper files use camelCase or kebab-case.
- **Component structure:** Default exports for components. Named exports for utilities/hooks.
- **JSX files:** Use `.jsx` extension for files containing JSX markup.
- **No TypeScript:** The project is plain JavaScript. Do not add `.ts`/`.tsx` files unless explicitly requested.

## Architecture Notes

- This is a client-side SPA — there is no backend or API server in this repo.
- The app title is "MAMC Expansion Planner — Defense Health Agency", reflecting its healthcare/defense context.
- The root component tree starts at `src/App.jsx` (not yet created).
- Vite default output directory is `dist/`. Do not commit `dist/` or `node_modules/`.

## Known Missing Pieces (as of scaffold)

- `src/App.jsx` — root component (needs to be created)
- Application logic for bed expansion planning
- CSS / styling solution
- Routing (React Router or similar if multi-page)
- State management (if needed for complex planning state)
- Testing infrastructure (Vitest + React Testing Library recommended for Vite projects)
- ESLint + Prettier configuration
- `.gitignore` (add `node_modules/`, `dist/`, `.env`)
- CI/CD pipeline

## AI Assistant Guidelines

- Before adding dependencies, consider whether the feature can be implemented with what is already installed.
- Do not add TypeScript unless the user explicitly requests it.
- When creating new components, place them under `src/components/` and follow PascalCase naming.
- When creating utility functions, place them under `src/utils/`.
- Do not commit `node_modules/`, `dist/`, or any secrets/environment files.
- Prefer small, focused commits with clear messages describing the "why" not just the "what".
- The project is a private, specialized tool — avoid adding generic boilerplate or unused abstractions.
