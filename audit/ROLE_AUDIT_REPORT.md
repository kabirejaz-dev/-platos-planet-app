# Role Audit Report

**Scoring rubric:** each role is checked against 9 criteria worth up to ~11 points each (Dashboard exists, Navigation works, Tabs work, Buttons work, Forms submit, Data updates, Permissions enforced, Mobile responsive, No dead UI). **"Permissions enforced" is a hard 0/11 for every single role** — verified live: there is no role-based route guard anywhere (see `SECURITY_REPORT.md` Finding #1), so this single architectural gap caps every role's maximum possible score at ~89/100 before any other deduction.

**Mobile responsive** is graded from code inspection (Tailwind breakpoint usage per page, absence of a mobile-drawer pattern in `Sidebar.tsx`/`AppShell.tsx`), not a live narrow-viewport click-through. Content grids inside pages do collapse to 1 column on small screens; the persistent 240px/64px sidebar shell does not have an off-canvas mobile pattern, so every role takes a partial deduction here.

---

## Super Admin — 74/100

| Check | Result |
|---|---|
| Dashboard exists | ✅ `SuperAdminDashboard.tsx` |
| Navigation works | ✅ all 10 sidebar links route correctly |
| Tabs work | ✅ (`GoLivePage` section tabs work) |
| Buttons work | ✅ |
| Forms submit | ⚠️ Branches/Users forms persist via `addBranch`/`addUser`; **`GoLivePage` only persists the "Business Info" section** — Payment/Storage/Email/WhatsApp/AI key fields are saved to local component state only and lost on navigation/reload (real bug, not a demo simplification) |
| Data updates | ✅ for Branches, Users, Settings, Audit Logs (read-only by design) |
| Permissions enforced | ❌ 0/11 (universal) |
| Mobile responsive | ⚠️ partial |
| No dead UI | ⚠️ Command Palette omits most Super Admin-specific deep links beyond what's hardcoded |

**Notable:** No delete action exists for Branches or Users — once created, demo entities accumulate forever.

---

## Branch Admin — 76/100

| Check | Result |
|---|---|
| Dashboard exists | ✅ |
| Navigation works | ✅ all 9 links |
| Tabs work | ✅ |
| Buttons work | ✅ |
| Forms submit | ✅ Batches create form, Requests approve/reject (functional, updates `BranchRequest.status` live) |
| Data updates | ✅ |
| Permissions enforced | ❌ 0/11 |
| Mobile responsive | ⚠️ partial |
| No dead UI | ✅ no dead buttons found in sampled pages |

**Notable:** `FeeOverviewPage` and `BranchReportsPage` are read-only computed dashboards (no forms) — correctly scoped, not broken.

---

## Sales — 78/100 (highest-scoring role)

| Check | Result |
|---|---|
| Dashboard exists | ✅ |
| Navigation works | ✅ all 8 links |
| Tabs work | ✅ (Leads kanban view, filter tabs on Scholarships/Campaigns) |
| Buttons work | ✅ |
| Forms submit | ✅ Leads CRM (add/update/convert), Scholarships approve/reject (functional), Trial scheduling |
| Data updates | ✅ — this is the most fully-wired CRM loop in the app (lead → trial → enrolled) |
| Permissions enforced | ❌ 0/11 |
| Mobile responsive | ⚠️ partial |
| No dead UI | ✅ |

**Notable:** Sales is the most mature module in the codebase — full lead lifecycle, kanban board, and the only place where a "conversion" (lead → enrolled status) is modeled end-to-end.

---

## Teacher — 75/100

| Check | Result |
|---|---|
| Dashboard exists | ✅ |
| Navigation works | ✅ all 8 links |
| Tabs work | ✅ |
| Buttons work | ✅ |
| Forms submit | ✅ Attendance marking, Homework create/grade, Tests/Assessments create+grade, Class Notes "upload" |
| Data updates | ✅ — attendance and grading correctly fan out to Parent/Student views (see `DATA_FLOW_REPORT.md`) |
| Permissions enforced | ❌ 0/11 |
| Mobile responsive | ⚠️ partial |
| No dead UI | ✅ |

**Notable:** "Class Notes" upload (`ClassNotesPage.tsx`) has no real file picker — it records a title/description/file-type label only. There is no actual file storage anywhere in the app (see `DATABASE_REPORT.md` / `SECURITY_REPORT.md`).

---

## Academic Coordinator — 70/100 (lowest among staff roles)

| Check | Result |
|---|---|
| Dashboard exists | ✅ |
| Navigation works | ✅ all 8 sidebar links |
| Tabs work | ✅ |
| Buttons work | ✅ |
| Forms submit | ⚠️ Interventions "Resolve" works; Teacher Reviews are seed-only (no "create review" form exists — coordinators can only view pre-seeded reviews, not author new ones) |
| Data updates | ✅ for Interventions; static for Reviews |
| Permissions enforced | ❌ 0/11 |
| Mobile responsive | ⚠️ partial |
| No dead UI | ❌ **Command Palette (`CommandPalette.tsx`) lists only 1 of this role's 8 real nav items** ("Dashboard") — ⌘K search is effectively broken for this role |

**Notable:** This is the only role where a documented feature (Teacher Reviews) is view-only with no corresponding create/edit form, despite the page visually implying a review workflow.

---

## Finance Manager — 76/100

| Check | Result |
|---|---|
| Dashboard exists | ✅ |
| Navigation works | ✅ all 8 links |
| Tabs work | ✅ |
| Buttons work | ✅ |
| Forms submit | ✅ Fee Collection (record payment), Expenses (add), Invoices |
| Data updates | ✅ — paid invoices flow into VAT Reports and Parent Fees views |
| Permissions enforced | ❌ 0/11 |
| Mobile responsive | ⚠️ partial |
| No dead UI | ✅ |

**Notable:** "Record Payment" only flips `invoice.status` locally — there is no real payment gateway, no transaction record, no idempotency/double-submit protection, and no receipt persisted beyond a client-rendered modal (see `SECURITY_REPORT.md`, `DATABASE_REPORT.md`).

---

## Parent — 74/100

| Check | Result |
|---|---|
| Dashboard exists | ✅ |
| Navigation works | ✅ all 8 links |
| Tabs work | ✅ |
| Buttons work | ✅ |
| Forms submit | ✅ Meetings booking (functional, creates a real `Meeting` record) |
| Data updates | ✅ Progress/Exams/Attendance/Fees correctly read from the same store rows Teachers/Finance write to |
| Permissions enforced | ❌ 0/11 |
| Mobile responsive | ⚠️ partial |
| No dead UI | ✅ |

**Notable:** Mostly a read-only consumer role by design (Progress, Exams, Attendance, Fees) — this is appropriate for a parent persona, not a gap.

---

## Student — 73/100

| Check | Result |
|---|---|
| Dashboard exists | ✅ |
| Navigation works | ✅ all 8 links |
| Tabs work | ✅ |
| Buttons work | ✅ |
| Forms submit | ✅ Homework submission flow, AI Tutor chat, Study Plan "Generate" |
| Data updates | ✅ — XP/streak/planet gamification updates on AI Tutor use and quiz completion |
| Permissions enforced | ❌ 0/11 |
| Mobile responsive | ⚠️ partial |
| No dead UI | ✅ |

**Notable:** Gamification (XP, Planet Journey, Achievements) is cosmetic-only — `addXP` exists and updates correctly, but most "Achievement" unlock conditions in `seed.ts` are static booleans, not computed from live behavior, so achievements don't actually unlock dynamically as a student does more work.

---

## AI Tutor — 55/100 (lowest-scoring role)

| Check | Result |
|---|---|
| Dashboard exists | ✅ |
| Navigation works | ⚠️ links route, but... |
| Tabs work | ❌ **Five of the seven AI Tutor routes (`/ask`, `/doubt-solver`, `/quiz`, `/flashcards`, and the bare `/ai-tutor`) all render the identical `AITutorPage` component, which always mounts with its internal tab state hardcoded to `'ask'`.** Clicking "Quiz Generator" or "Flashcards" in the sidebar does not open those tabs — the user lands on "Ask Question" every time. Confirmed in code: `AppShell` forces a full remount on every path change (`key={location.pathname}`), so the tab state never persists or syncs to the URL it was navigated from. |
| Buttons work | ✅ within whichever tab is shown |
| Forms submit | ✅ chat send, quiz generate, flashcard flip, "Save answer" toggle |
| Data updates | ✅ saved answers correctly persist and surface on `/ai-tutor/saved` |
| Permissions enforced | ❌ 0/11 |
| Mobile responsive | ⚠️ partial |
| No dead UI | ❌ see Tabs row |

**Notable — most important finding for this role:** there is **no real AI**. `generateAIResponse()` in `AITutorPage.tsx` is a hardcoded function: it pattern-matches on two literal keyword strings ("newton"/"second law" and "integrate by parts") and returns one of two pre-written canned answers, or a generic templated fallback for every other question. The Quiz Generator produces the same three placeholder questions ("Option B — Correct answer") regardless of subject or topic typed in. This is clearly labeled as demo data in the UI (`DemoBadge`), so it is not deceptive to an end user reading the badge — but it means the "AI Tutor" product pillar does not exist as a working feature today.

---

## Score summary

| Role | Score | Classification |
|---|---|---|
| Sales | 78 | Demo Ready |
| Branch Admin | 76 | Demo Ready |
| Finance Manager | 76 | Demo Ready |
| Teacher | 75 | Demo Ready |
| Super Admin | 74 | Demo Ready |
| Parent | 74 | Demo Ready |
| Student | 73 | Demo Ready |
| Academic Coordinator | 70 | Demo Ready (low) |
| AI Tutor | 55 | Not Ready |

**Average: 72.3/100.** No role exceeds ~78 because the missing RBAC layer is a hard ceiling on every single one.
