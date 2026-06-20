# DevOps Audit Report

## Build & type safety — clean

Verified this session, both currently pass with zero output:
- `tsc --noEmit` → 0 errors
- `vite build` → succeeds, ~1.6MB/~280KB gzipped output (see `PERFORMANCE_REPORT.md`)
- Live Playwright spot-checks across all 9 roles and 20+ pages this session → 0 console errors observed on pages exercised

## Lint — broken

```
$ npx eslint src --ext ts,tsx
Oops! Something went wrong! :(
ESLint: 8.57.1
ESLint couldn't find a configuration file.
```

`eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh` are all installed as devDependencies, and `package.json` defines `"lint": "eslint src --ext ts,tsx"` — **but no `.eslintrc*` file exists anywhere in the repo.** `npm run lint` fails immediately for every contributor and would fail in CI if one existed. This needs a config file before it's usable at all (not a config tweak — it's currently completely non-functional).

## Environment variables

`.env.example` lists `VITE_APP_NAME`, `VITE_APP_URL`, and several commented-out future keys (`VITE_API_BASE_URL`, `VITE_SUPABASE_URL`, etc.). **Confirmed via grep: zero usages of `import.meta.env` exist anywhere in `src/`.** No environment variable is read by the running app today — `.env.example` is purely aspirational documentation for a future backend integration, not a wired-up config surface.

## Vercel readiness — reasonable, with two broken asset references

`vercel.json` is present and sensible for a static SPA: a catch-all rewrite to `index.html` (correct for client-side routing) plus baseline security headers (`X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`) and long-cache `Cache-Control` on `/assets/*`. This would deploy correctly on Vercel as-is.

**Two broken references that will surface immediately on a real deploy:**
- `index.html` → `<meta property="og:url" content="https://platos-planet-app.vercel.app" />` — confirm this matches the actual deployed domain before launch (see `HALLUCINATION_REPORT.md`)
- `index.html` references `/favicon.svg` and `/og-image.png` — **neither file exists in `public/`**, so the browser tab will show no icon and social-media link previews will show a broken image

## Production configuration

No environment-specific config split exists or is needed yet, since the entire app is a static bundle with zero runtime config reads. This is fine for the current demo scope and will need to be introduced (`VITE_API_BASE_URL` etc., actually wired up this time) once a real backend exists.

## CI/CD

**No CI pipeline exists** — no `.github/workflows/`, no other CI config found. There is a real GitHub remote configured (`origin` → `kabirejaz-dev/-platos-planet-app`, branch `main`), so this is a real, pushable repo, just with no automated build/test/lint gate on push or PR. Given lint is currently broken (above), a naively-added CI lint step would fail immediately until the missing ESLint config is added.

## Repo hygiene — orphaned scaffold, most important DevOps finding

The repo root contains a **second, entirely unrelated, dead application**, left over from initial project scaffolding:
- `server.js` — an Express server for a toy "Plato's Planet — explore philosophical dialogues" app, serving `public/index.html` + `public/app.js` + `public/styles.css`
- `README.md` — documents that dead app and instructs `npm install && npm start`, but **`npm start` does not exist** in `package.json` (only `dev`/`build`/`preview`/`lint`) — following the README as written fails on step one for any new contributor

None of this is reachable from the real app (`index.html` at repo root → `src/main.tsx`), but it sits in the project root alongside the real source, will confuse any new developer or AI agent onboarding to the repo, and actively misleads via a non-functional quickstart. **Recommend deleting `server.js`, `public/`, and rewriting `README.md` to describe the actual Vite app** (`npm install && npm run dev`).

Also present, lower priority, worth knowing about but not blocking: `scripts/screenshot.mjs` + `scripts/screenshot_new_pages.mjs` and a `screenshots/` directory of 21 PNGs — these are one-off dev tooling for generating documentation screenshots, not part of the app runtime; harmless but should not be confused with test coverage (there are no automated tests in the repo — see below).

## Testing

**No automated test suite exists** — no `*.test.ts(x)`, no `*.spec.ts(x)`, no Jest/Vitest/Playwright-test config found anywhere in `package.json` or the repo. `playwright` is installed as a devDependency, but only because it was used ad-hoc during this audit/build session to drive a real browser for manual verification — there is no `playwright.config.ts` and no committed test files. **This is a real gap**: every page in this app has been verified exactly once, manually, by an agent during a build session, with no regression safety net for future changes.

## Dependency audit

`npm audit`: 2 vulnerabilities (1 moderate, 1 high), both in `esbuild`/`vite` **dev dependencies only** (`npm audit --omit=dev` → 0). Dev-server-only impact (GHSA-67mh-4wv8-2f99). Fix requires a breaking Vite major-version bump — schedule deliberately.

## Summary checklist

| Item | Status |
|---|---|
| Build passes | ✅ |
| TypeScript errors | ✅ None |
| Console errors (sampled pages) | ✅ None observed |
| Lint | ❌ Completely broken — no config file |
| Environment variables wired up | ❌ None read anywhere; `.env.example` is aspirational only |
| Vercel deploy config | ⚠️ Present and reasonable, but references 2 missing static assets |
| CI/CD pipeline | ❌ None exists |
| Automated tests | ❌ None exist |
| Repo hygiene | ❌ Orphaned, unrelated, misleading scaffold app at repo root |
| Dependency vulnerabilities | ⚠️ 2 dev-only (moderate/high), 0 in production deps |
