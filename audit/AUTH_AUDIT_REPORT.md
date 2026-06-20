# Authentication Audit Report

## How login actually works (read directly from `src/pages/auth/LoginPage.tsx`)

```ts
const DEMO_ACCOUNTS = [
  { role: 'super_admin', email: 'khalid@platosplanet.ae', password: 'demo123', ... },
  // ...8 more, all password: 'demo123'
]

const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password)
```

This is a **client-side array lookup against a hardcoded list shipped in the JavaScript bundle.** There is no server, no password hashing, no database — the "authentication" is whatever string comparison happens to run in the visitor's own browser, against credentials anyone can read by opening the bundled JS or browser devtools.

On match, it builds an `AuthUser` object including `token: \`demo-token-${Date.now()}\`` — a fake string, never validated by anything, never sent anywhere (there are no network requests in the app), purely cosmetic.

## Checklist

| Item | Status |
|---|---|
| Login | ⚠️ Works, but is a hardcoded client-side credential check, not real auth |
| Logout | ✅ Functional — `setCurrentUser(null)` + redirect to `/login` (`Sidebar.tsx`) |
| Password reset | ❌ Does not exist anywhere in the codebase |
| Role permissions | ❌ Does not exist — see below and `SECURITY_REPORT.md` Finding #1 |
| Protected routes | ⚠️ Partial — `ProtectedRoute` (App.tsx) blocks unauthenticated access (`currentUser === null` → redirect to `/login`), but performs **no role check whatsoever** |
| Session handling | ❌ `currentUser` is persisted to `localStorage` indefinitely via Zustand `persist` — no expiry, no idle timeout, no token refresh, no server-side session to invalidate on logout from another device |

## Security risks (full detail in `SECURITY_REPORT.md`)

1. **All 9 demo passwords are identical (`demo123`) and shipped in plaintext in the client bundle.** Anyone can view source / inspect the JS bundle and log in as Super Admin without ever seeing the login page's UI.
2. **No role-based authorization anywhere** — once logged in as *any* role, a user can navigate by URL to *any* other role's pages and **read and write** that role's data. Verified live this session (Student session reaching `/super-admin/settings`, `/finance/expenses` with a fully functional "Add Expense" button).
3. **No session expiry.** A `currentUser` written to `localStorage` today will still be "logged in" a year from now unless the browser storage is manually cleared.
4. **No password reset / forgot-password flow** — not a vulnerability per se, but a hard blocker for any real user base (locked-out users have no recovery path).
5. **No rate limiting, no lockout after failed attempts** — irrelevant today since there's no server to attack, but will need to be designed when real auth is built.

## Hardcoded credentials

All 9 (`khalid@platosplanet.ae` / `fatima@platosplanet.ae` / `layla@platosplanet.ae` / `sarah@platosplanet.ae` / `yusuf@platosplanet.ae` / `priya@platosplanet.ae` / `mfarsi@gmail.com` / `zaid@student.platosplanet.ae` / `ai@platosplanet.ae`) share password `demo123`, hardcoded in `LoginPage.tsx`. This is appropriate **only** for a demo build and must be entirely removed/replaced before any real user data touches this app.

## What's needed before this can be called "authentication" in a production sense

- A real backend identity provider (e.g. Auth0, Supabase Auth, Firebase Auth, or a custom service with bcrypt/argon2 password hashing + JWT or session cookies)
- Server-issued, server-validated session tokens with expiry and refresh
- Role/permission checks enforced **server-side**, not just hidden in the client (client-side role gating is a UX nicety, never a security boundary)
- Password reset via email
- Audit logging of login/logout/failed-attempt events (the `AuditLogEntry` type already exists in `types/index.ts` and is unused for this purpose — see `HALLUCINATION_REPORT.md`/`FORM_AUDIT_REPORT.md`)

## Verdict

This is a **demo login screen**, not an authentication system. It correctly demonstrates the *intended* role-based UX (9 distinct personas, role-aware navigation) but provides **zero real security** and must be fully replaced — not extended — before production use.
