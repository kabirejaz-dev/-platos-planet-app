# Plato's Planet Digital — Application Inventory

**Audit date:** 2026-06-18
**Method:** Full static codebase scan (Glob/Grep across all `src/**/*.{ts,tsx}`), targeted reads of every shared component, store, type file, and a representative sample of ~25 of 79 page files, plus live verification of routing/auth/RBAC behavior via a running dev server. Findings below are evidence-based; anywhere the audit relied on pattern inference rather than a direct read, it's marked "sampled."

---

## 1. Tech Stack (confirmed via `package.json`)

| Layer | Library | Notes |
|---|---|---|
| Framework | React 18 + Vite 5 + TypeScript 5 (strict) | SPA, no SSR |
| Routing | react-router-dom v6 | Client-side only |
| State | Zustand v4 + `persist` middleware | → `localStorage` key `platos-planet-store`, schema version 3 |
| Styling | Tailwind CSS + custom CSS classes (`plato-card`, `plato-input`, `btn-primary`, etc.) | Dark theme only |
| Charts | Recharts | |
| Animation | Framer Motion | |
| UI primitives | Radix UI (`@radix-ui/*`), `cmdk` (⌘K palette) | |
| Forms | Plain `useState` + `<input>` everywhere | **`react-hook-form` and `zod` are installed but have zero usages in `src/` — dead dependencies.** |
| Icons | lucide-react | |

**No backend framework, no ORM, no database driver, no HTTP client (`fetch`/`axios`: 0 matches anywhere in `src/`) is present.** This is a 100% client-side demo.

---

## 2. Real entry point vs. orphaned scaffold (important)

The actual app: `index.html` (root) → `src/main.tsx` → `src/App.tsx`. This is the only thing `npm run dev` / `vite build` ever serves.

**Found and flagged as dead/misleading:**
- `server.js` (root) — an Express server for a *different, unrelated* toy app ("Plato's Planet — a tiny demo app for exploring philosophical dialogues"), with one route `/api/planet`.
- `public/index.html`, `public/app.js`, `public/styles.css` — the frontend for that same orphaned toy app.
- `README.md` (root) — describes that orphaned app and tells a new developer to run `npm start`, **which does not exist** in `package.json` scripts (only `dev`, `build`, `preview`, `lint`). Following the README as written fails immediately.

None of this is wired into the real Vite app. It appears to be unremoved scaffolding from an initial project template. See `DEVOPS_REPORT.md` for remediation.

---

## 3. Pages (79 `.tsx` files under `src/pages/`)

### Auth (1)
`auth/LoginPage.tsx`

### Super Admin (10 routes)
`SuperAdminDashboard`, `BranchesPage`, `UsersPage`, `AdmissionsOverviewPage`, `AcademicAnalyticsPage`, `ReportsCentrePage`, `SystemSettingsPage`, `AuditLogsPage`, `GoLivePage` — plus shares `FinanceDashboard` with the Finance role at `/super-admin/finance`.

### Branch Admin (9 routes)
`BranchAdminDashboard`, `StudentsPage`, `TeachersPage`, `BatchesPage`, `TimetablePage`, `AttendanceOverviewPage`, `FeeOverviewPage`, `RequestsPage`, `BranchReportsPage`.

### Sales (8 routes)
`SalesDashboard`, `LeadsPage`, `FollowUpsPage`, `TrialsPage`, `AdmissionsPage`, `CampaignsPage`, `ScholarshipsPage`, `SalesReportsPage`.

### Teacher (8 routes)
`TeacherDashboard`, `ClassesPage`, `AttendancePage`, `HomeworkPage`, `TestsPage`, `ClassNotesPage`, `StudentProgressPage` — plus shares `MessagesPage`.

### Coordinator (8 routes)
`CoordinatorDashboard`, `CurriculumPage`, `SyllabusPlansPage`, `AssessmentsPage`, `ResultsPage`, `TeacherReviewsPage`, `InterventionsPage`, `AcademicReportsPage`.

### Finance (8 routes)
`FinanceDashboard`, `CollectionPage`, `InvoicesPage`, `PaymentPlansPage`, `OutstandingFeesPage`, `ExpensesPage`, `VATReportsPage`, `ForecastsPage`.

### Parent (8 routes)
`ParentDashboard`, `ProgressPage`, `ParentAttendancePage`, `ParentHomeworkPage`, `ExamsPage`, `ParentFeesPage`, `MeetingsPage` — plus shares `MessagesPage`.

### Student (8 routes)
`StudentDashboard`, `MyClassesPage`, `StudentHomeworkPage`, `StudentTestsPage`, `AchievementsPage`, `StudyPlanPage`, `ResourcesPage` — plus shares `AITutorPage`.

### AI Tutor (7 routes, but only 2 distinct components)
`/ai-tutor`, `/ai-tutor/ask`, `/ai-tutor/doubt-solver`, `/ai-tutor/quiz`, `/ai-tutor/flashcards` **all render the same `AITutorPage`**, which always mounts on its internal "Ask Question" tab regardless of which nav link was clicked (see `ROLE_AUDIT_REPORT.md` and `UX_REPORT.md`). `/ai-tutor/planner` and `/student/study-plan` intentionally share `StudyPlanPage`. `/ai-tutor/saved` is the only unique component (`SavedAnswersPage`).

**Total: 74 distinct routes registered in `App.tsx`, mapping to ~62 distinct page components (some intentionally/unintentionally shared).**

---

## 4. Shared components (`src/components/`)

| Component | Purpose | Notes |
|---|---|---|
| `layout/AppShell.tsx` | Sidebar + TopBar + animated route outlet | Re-mounts page on every path change (`key={location.pathname}`) |
| `layout/Sidebar.tsx` | Role-aware nav (hardcoded `getNavItems(role)` map) | UI-only gating, not enforced (see `SECURITY_REPORT.md`) |
| `layout/TopBar.tsx` | Search bar trigger, notification bell, user avatar | Sampled |
| `ui/Modal.tsx` | Generic modal shell | Used by ~10 pages |
| `ui/EmptyState.tsx`, `ui/StatCard.tsx`, `ui/PageHeader.tsx`, `ui/Avatar.tsx`, `ui/DemoBadge.tsx` | Design-system primitives | Consistently reused |
| `ui/Toaster.tsx` + `hooks/useToast.ts` | Global toast notifications via a module-level pub/sub (`toast.success(...)`) | Not React context; works but is a singleton-module pattern |
| `ui/CommandPalette.tsx` (⌘K) | Quick navigation + entity search | **Stale**: hand-maintained `ROLE_PAGES` map omits the `ai_tutor` role entirely (falls back to `[]`) and lists only 1 of 8 nav items for `coordinator`; doesn't include any of the 14 pages added in this session |
| `ui/ErrorBoundary.tsx` | Class component catching render errors | Functional, logs to `console.error` only — no remote error reporting |
| `ui/PageLoader.tsx` | Suspense fallback | Sampled |

---

## 5. State management

One Zustand store: `src/store/appStore.ts`. Holds **22 top-level data arrays/objects** (`users`, `branches`, `students`, `teachers`, `parents`, `batches`, `attendance`, `homework`, `assessments`, `leads`, `invoices`, `messages`, `meetings`, `notifications`, `conversations`, `achievements`, `settings`, `campaigns`, `scholarships`, `auditLog`, `branchRequests`, `classNotes`, `syllabusPlans`, `teacherReviews`, `interventions`, `paymentPlans`, `expenses`, `studyPlans`) plus `currentUser`.

- Every entity has `addX` / `updateX` actions. **No `deleteX` / `removeX` action exists for any entity** — nothing can ever be deleted through the UI.
- All actions are plain exported functions on the store; **none check `currentUser.role`** before mutating. Any authenticated session can call any action regardless of role.
- Persisted to `localStorage` via `partialize` (excludes nothing meaningful — `currentUser` itself is persisted, meaning a "logged in" session survives a full browser restart indefinitely with no expiry).

---

## 6. Authentication

`src/pages/auth/LoginPage.tsx` contains a hardcoded `DEMO_ACCOUNTS` array (9 accounts, one per role) with plaintext password `demo123` for all of them. Login is a client-side `Array.find()` against this array — see `AUTH_AUDIT_REPORT.md`.

## 7. Permissions / RBAC

`ProtectedRoute` in `App.tsx` only checks `currentUser !== null`. **There is no role-based route guard anywhere in the codebase.** Verified live (Playwright, this session): a Student session can navigate directly to `/super-admin/settings`, `/super-admin/audit`, `/super-admin/users`, `/finance/expenses`, `/coordinator/interventions` — all render fully, and `/finance/expenses`'s "Add Expense" button is present and functional. See `SECURITY_REPORT.md` Finding #1.

## 8. Environment variables

`.env.example` lists `VITE_APP_NAME`, `VITE_APP_URL`, and commented-out future keys. **Confirmed via grep: `import.meta.env` has zero usages anywhere in `src/`.** No environment variable is ever actually read by the running app.

## 9. Database integrations

None. See `DATABASE_REPORT.md`.

## 10. Third-party integrations

None are live. The following are referenced only as **unused input-field placeholders** in `GoLivePage.tsx`, never wired to any actual SDK call: Stripe, AWS S3, SendGrid, Meta WhatsApp Business API, Anthropic/OpenAI. Zero network calls exist in the codebase (`fetch`/`axios`/`XMLHttpRequest`: 0 matches).

---

## Inventory summary table

| Category | Count | Real / Functional | Demo / Non-functional |
|---|---|---|---|
| Routes | 74 | 74 render without crashing | 74 — none talk to a real backend |
| Distinct page components | ~62 | All render with seeded data | All client-only |
| Forms with an "Add/Create/Save" action | ~25 (sampled) | Persist to local Zustand+localStorage | No validation library, no server round-trip |
| Delete operations | 0 | — | Not implemented anywhere |
| Real API/database calls | 0 | — | — |
| Third-party integrations wired up | 0 of 5 referenced (Stripe, S3, SendGrid, WhatsApp, AI) | — | Input fields exist, do nothing |
| Legal pages | 0 | — | Not built |
