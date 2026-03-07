# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Laravel backend code (controllers, models, middleware, services).
- `routes/`: API and web route definitions (`routes/api.php` is the main API entry).
- `resources/js/`: React frontend (pages, components, contexts, utilities).
- `resources/css/`: frontend styles, Tailwind integration.
- `public/`: public assets and Vite build output (`public/build` is generated).
- `database/`: migrations, seeders, factories.
- `tests/`: backend tests (`tests/Feature`, `tests/Unit`) and frontend test setup (`tests/setup.js`).

## Build, Test, and Development Commands
- `composer setup`: first-time project bootstrap (install deps, `.env`, key, migrate, frontend build).
- `composer dev`: run Laravel server, queue worker, logs, and Vite dev server concurrently.
- `npm run dev`: start Vite frontend dev server only.
- `npm run build`: create production frontend build.
- `composer test`: clear config and run Laravel test suite.
- `npm run test` / `npm run test:run`: run Vitest in watch / one-shot mode.

## Coding Style & Naming Conventions
- Follow `.editorconfig`: UTF-8, LF, 4 spaces, final newline.
- PHP: PSR-12 style; run `vendor/bin/pint` before opening PRs.
- React: keep components in PascalCase file names (`DashboardAdmin.jsx`), hooks/utilities in camelCase.
- Prefer shared UI/constants under `resources/js/components/ui` and `resources/js/constants`.
- Do not manually edit generated files in `public/build/`.

## Testing Guidelines
- Backend: PHPUnit (Laravel), place tests in `tests/Feature` or `tests/Unit`, file names end with `Test.php`.
- Frontend: Vitest + Testing Library (`jsdom`), colocate tests as `*.test.jsx` or `*.spec.jsx`.
- Add/adjust tests for behavior changes, especially auth, role-based access, and API responses.

## Commit & Pull Request Guidelines
- Use clear, scoped commit messages (recommended prefixes: `feat:`, `fix:`, `refactor:`, `docs:`).
- Keep commits focused; avoid mixing refactor + feature + formatting in one commit.
- PR should include:
  - concise summary and affected role/module (Admin/Kader/Orang Tua),
  - verification steps (commands run),
  - screenshots/GIFs for UI changes,
  - linked issue/task if available.

## Security & Configuration Tips
- Never commit secrets (`.env`, API keys, tokens).
- Remove or guard debug endpoints before release (e.g., test/debug routes).
- Ensure endpoints exposing user data are protected by proper middleware (`auth:sanctum`, role middleware).
