# Performance Audit Report

## Bundle size — good, deliberately engineered

Production build (`vite build`, verified this session): **~1.6MB uncompressed / ~280KB gzipped total**, split into:

| Chunk | Size | Gzip |
|---|---|---|
| `chunk-charts` (Recharts + d3) | 356KB | ~89KB |
| `chunk-vendor` | 152KB | ~53KB |
| `chunk-react` (react-dom + router) | 144KB | ~46KB |
| `index` (app shell) | 112KB | ~28KB |
| `chunk-motion` (Framer Motion) | 108KB | ~36KB |
| `chunk-icons` (lucide-react) | 36KB | ~7KB |
| `chunk-cmdk`, `chunk-radix` | 20KB / 16KB | small |
| Per-route page chunks | 4–16KB each | small |

`vite.config.ts` has hand-written `manualChunks()` logic deliberately separating charts/motion/radix/cmdk/react/zustand/icons into their own cacheable vendor chunks — **this is genuinely good, intentional bundle engineering**, not an accident.

## Route splitting — excellent

**Every single one of the 74 routes in `App.tsx` is `React.lazy()`-loaded.** Confirmed by reading the full import list — there are zero eager page imports. Combined with `<Suspense fallback={<PageLoader />}>` in `AppShell.tsx`, this means a user only ever downloads the code for the page they're actually viewing, plus the shared vendor chunks. This is best-practice and fully implemented, not partially.

## Re-renders — real architectural risk found

Grepped every call site of the store hook:

- **`useAppStore()` (no selector — subscribes to the entire store): 70 files**
- **`useAppStore((s) => ...)` (selector — subscribes to one slice): 3 occurrences, only in `App.tsx` and `LoginPage.tsx`**

This means **70 of 73 components reading from the store will re-render on *any* state change anywhere in the store**, not just changes to the fields they actually use. At the current demo data volume (a few dozen records per entity, single-user, no real-time updates) this is invisible. **It will not stay invisible as data volume or update frequency grows** — e.g., a single `addNotification()` call (which fires on nearly every "Save"/"Submit" action across the app) currently re-renders every mounted page-level component subscribed to the store, even ones with no relationship to notifications. This is the single highest-leverage performance fix available before scaling: convert the 70 bare `useAppStore()` calls to selector-based subscriptions (or adopt a shallow-equality selector helper).

## Image optimization — N/A, nothing to optimize (and one related bug)

Zero `<img>` tags exist anywhere in `src/`. All avatars are CSS-rendered colored circles with initials (`Avatar.tsx`), not photos — there is no raster image pipeline to audit. The one image-adjacent issue is covered in `DEVOPS_REPORT.md`/`HALLUCINATION_REPORT.md`: `index.html` references `/favicon.svg` and `/og-image.png`, **neither of which exists** in `public/`.

## Lighthouse readiness

Not run in this audit (would require a live deployed URL or local Lighthouse CI run against the dev/preview server, which wasn't performed this pass). Based on what was verified directly:
- **Likely strong:** bundle size, code splitting, no render-blocking heavy images, dark-theme-only avoids a flash-of-unstyled-content theme switch.
- **Likely weak:** Accessibility score, given the near-zero ARIA coverage and probable low-contrast text findings in `UX_REPORT.md` — Lighthouse's accessibility audit will almost certainly flag both directly.
- Google Fonts (`Inter`, `Sora`, `JetBrains Mono`) are loaded via `<link>` in `index.html` with `preconnect` hints already in place — reasonable, though self-hosting fonts would remove the third-party request entirely if a Lighthouse score needs to be maximized.

## Summary

| Area | Verdict |
|---|---|
| Bundle size / chunking | ✅ Good, deliberately engineered |
| Route-level code splitting | ✅ Excellent — 100% coverage |
| Re-render architecture | ❌ Real risk — 70/73 store subscriptions are unselectorized |
| Image optimization | N/A — no raster images exist |
| Lighthouse | Not measured this pass — predict strong performance score, weak accessibility score |
