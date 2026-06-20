# Security Report

## Score: 22/100

This reflects an app with no real security boundary at all (broken access control, plaintext shipped credentials), partially offset by clean dependency hygiene and decent baseline HTTP headers. **This score is appropriate for a demo and should not be read as "needs minor hardening" — the access-control layer does not exist and must be built from scratch.**

---

## Finding #1 — CRITICAL: Broken Access Control (no role-based authorization)

**Severity: Critical. Status: Verified live, not theoretical.**

`ProtectedRoute` (`src/App.tsx`) only checks `currentUser !== null`. There is no second check anywhere in the codebase for `currentUser.role` against the route being accessed. The `Sidebar` only *hides* nav links a role shouldn't see — it does not prevent direct navigation.

**Proof (this session, Playwright against the running dev server):**
1. Logged in as the `Student` demo account.
2. Navigated directly (URL bar) to `/super-admin/settings`, `/super-admin/audit`, `/super-admin/users`, `/finance/expenses`, `/coordinator/interventions`.
3. **All five rendered completely**, with full data. `/finance/expenses` rendered its "Add Expense" button in an enabled, clickable state — a student account could create real (well, real-for-this-app) financial records.

Because store actions (`addExpense`, `updateSettings`, `addUser`, etc. — all 24+ of them) never check `currentUser.role` either, this isn't just an information-disclosure bug — it's full **cross-role read AND write access** for every authenticated session, regardless of role. This maps to OWASP Top 10 **A01:2021 – Broken Access Control**.

**Fix required:** add a role-aware route guard (e.g. `<RoleRoute allow={['super_admin']}>`) wrapping every route group in `App.tsx`, and once a real backend exists, enforce the same check server-side — client-side role checks are a UX nicety only, never a security boundary on their own.

---

## Finding #2 — CRITICAL: Plaintext credentials shipped in the client bundle

`LoginPage.tsx` ships all 9 demo accounts' emails and the shared password `demo123` directly in the JS bundle. Anyone can read them via browser devtools without ever needing to see the UI. See `AUTH_AUDIT_REPORT.md` for full detail. **Acceptable only for an internal demo; must be entirely removed before any real account ever logs into this app.**

---

## Finding #3 — MODERATE: Unsafe HTML rendering pattern (latent XSS)

`AITutorPage.tsx:264` and `SavedAnswersPage.tsx:46` both do:

```tsx
dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}
```

**Currently dormant**, because `msg.content` for `role === 'assistant'` is always produced by the hardcoded `generateAIResponse()` function — never from user input, never from a real external API. User-typed messages render as plain text (`{msg.content}`, no `dangerouslySetInnerHTML`) elsewhere in the same component, so today there is no injection path.

**This becomes exploitable the moment a real LLM API replaces `generateAIResponse()`** — any model output (or any user input reflected through a prompt-injection-susceptible model) would be rendered as raw HTML with zero sanitization. **Fix before wiring up real AI:** replace the regex+`dangerouslySetInnerHTML` approach with a proper sanitizing markdown renderer (e.g. `react-markdown` with `rehype-sanitize`, or run output through `DOMPurify` first).

---

## Finding #4 — MODERATE: No Content-Security-Policy

`vercel.json` sets `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, and `Referrer-Policy` — a reasonable baseline. **No `Content-Security-Policy` header is configured.** Given Finding #3, a CSP (even a moderate `default-src 'self'`) would meaningfully reduce blast radius if the XSS path above is ever triggered.

---

## Finding #5 — LOW: Unbounded, unencrypted session persistence

The entire app state — including `currentUser` (name, email, role) — persists in `localStorage` indefinitely (Zustand `persist`, no expiry). On a shared/public machine, closing the browser does not log the user out; the next person to open it resumes the previous session automatically. There is no idle timeout and no "log out of all devices" capability (there are no "devices" to track — it's pure client storage).

---

## Finding #6 — LOW: Dev-dependency vulnerability (`npm audit`)

```
esbuild <=0.24.2 — moderate — GHSA-67mh-4wv8-2f99
  (dev server allows any website to send requests to it and read the response)
vite <=6.4.2 — depends on the vulnerable esbuild
2 vulnerabilities (1 moderate, 1 high)
```

**Production dependencies are clean** (`npm audit --omit=dev` → 0 vulnerabilities). This only affects `npm run dev` locally, not the production build/deploy. Fix is available via `npm audit fix --force` but is a **breaking** major-version bump of Vite — schedule deliberately, don't run blind.

---

## What's clean

- No secrets, API keys, or credentials committed anywhere in source beyond the intentional demo password (verified: no real-looking key patterns for Stripe/AWS/Anthropic/Google found in `src/`)
- `.env` and `.env.local` are correctly gitignored
- Zero real network calls exist (`fetch`/`axios`: 0 matches) — there is currently no server-side attack surface because there is no server
- No SQL injection risk (no database)
- No CSRF risk currently (no server-side session/cookie state to forge against) — **this will need real CSRF protection the moment a backend with cookie-based sessions exists**

## Summary table

| Finding | Severity | Status |
|---|---|---|
| No role-based access control | Critical | Open, proven exploitable |
| Hardcoded plaintext demo credentials | Critical (for prod) / Expected (for demo) | Open |
| Unsanitized `dangerouslySetInnerHTML` | Moderate | Open, currently dormant |
| No CSP header | Moderate | Open |
| Unbounded localStorage session | Low | Open |
| `esbuild`/`vite` dev-only CVE | Low | Open, dev-only impact |
| Secret/credential leakage in source | — | Clean |
| SQLi / CSRF surface | — | N/A (no backend yet) |
