# Form Audit Report

## Methodology

Grepped every `addX`/`updateX` store action against its usage count in `src/pages/**` and `src/components/**` to find orphaned (dead) actions, then read the forms that *are* wired up to check validation/error-handling patterns.

---

## 1. Validation — universal finding

**Zero forms in the entire app use a validation library**, despite `react-hook-form` and `zod` being installed as dependencies (0 usages of either in `src/`). Every form is `useState<FormShape>` + plain `<input>`/`<select>` elements. The only gate on submission anywhere is:

```tsx
disabled={!form.title || !form.batchId}   // truthy-check pattern, repeated in 15+ files
```

This means, for every form in the app:
- No email format validation (e.g. `UsersPage`, `LeadsPage` parent email fields accept any string)
- No phone format validation beyond a placeholder hint (`+971 50 XXX XXXX`)
- No max-length limits (a `description` field can be arbitrarily long with no truncation/warning)
- No numeric range checks (`ExpensesPage` amount field accepts negative numbers or zero — confirmed: `type="number"` with no `min`)
- The only native HTML `required` attributes in the entire codebase are on `LoginPage.tsx`'s email/password inputs (2 fields out of an estimated 150+ form inputs across all pages)

## 2. Error handling — universal finding

There is no error path in any form. Because there's no backend, every "submit" handler simply calls a Zustand action, which always succeeds (it's a synchronous in-memory array push). **No form anywhere demonstrates what happens on failure** because failure is structurally impossible in the current architecture. This will need to be built from scratch once a real backend exists — there is no existing pattern to extend.

## 3. Success handling — consistent and good

Where forms *are* wired up, success feedback is consistent and decent: `toast.success(title, message)` fires via the shared `Toaster`, and most modals close themselves and reset local form state. This pattern (`src/hooks/useToast.ts` + `src/components/ui/Toaster.tsx`) is the one genuinely reusable, well-built piece of form infrastructure in the app.

## 4. Data persistence

Local only — `localStorage` via Zustand `persist`. No optimistic-update-then-rollback pattern is needed or present because there's no network round trip to fail.

---

## 5. Missing forms (orphaned store actions — verified by usage count)

10 of the 24 entity-creation actions defined in `appStore.ts` are **never invoked from any page** — meaning the corresponding "create" UI does not exist even though the data model and store plumbing do:

| Action | Used in UI? | What's missing |
|---|---|---|
| `addTeacher` | ❌ 0 files | No "Add Teacher" form on `TeachersPage` — branch admins can view teachers but not onboard new ones |
| `addCampaign` | ❌ 0 files | No "Create Campaign" form on `CampaignsPage` — Sales can only view seeded campaigns |
| `addScholarship` | ❌ 0 files | No "Apply for Scholarship" form anywhere (Parent/Student side) — only pre-seeded applications can be approved/rejected |
| `addBranchRequest` | ❌ 0 files | No way for a teacher to request leave or a parent to submit a request through the UI — `RequestsPage` can only approve/reject pre-seeded requests |
| `addSyllabusPlan` | ❌ 0 files | Coordinators can view syllabus progress but cannot create a new term's plan |
| `addTeacherReview` | ❌ 0 files | Confirmed in `ROLE_AUDIT_REPORT.md` — review authoring doesn't exist |
| `addIntervention` | ❌ 0 files | Coordinators can resolve an existing intervention but can't flag a new at-risk student |
| `addPaymentPlan` | ❌ 0 files | Finance can view instalment plans but cannot set one up for a family |
| `addAuditLog` | ❌ 0 files | Ironic: approving a scholarship, resolving an intervention, and every other "auditable" action in the app does **not** write to the Audit Log — it remains static seed data forever |

Additionally, these 4 entities have **both** create and update dead: `updateTeacherReview`, `updatePaymentPlan`, `updateSyllabusPlan`, `updateCampaign` are also never called — meaning **Teacher Reviews, Payment Plans, Syllabus Plans, and Campaigns are 100% read-only in the live app**, despite full CRUD scaffolding existing in the store.

## 6. Duplicate / generic forms

No literal code duplication, but a single generic shape is copy-pasted with field-name changes across ~15 "Add X" modals (`BatchesPage`, `ExpensesPage`, `ClassNotesPage`, `MeetingsPage` booking, etc.). This consistency is good for UX but means a validation fix has to be applied 15+ times individually rather than once in a shared hook/component — there is no shared `useEntityForm()` abstraction.

## 7. Subject-specific forms — do not exist (by design, with a real gap)

`Subject` (Physics, Chemistry, Biology, Mathematics, English, Business Studies, Accounting, Computer Science, Economics, History, Geography, Arabic, French) is **only ever a `<select>` dropdown value**. Every form that captures a subject (Homework, Assessments, Batches, Leads) uses one identical generic form regardless of which subject is chosen — there is no subject-specific field (e.g. no "practical/lab component" field for Physics/Chemistry/Biology, no "essay word count" field for English, no "programming language" field for Computer Science). This is reasonable for a v1 generic ERP, but it means the claim of "subject-specific forms" does not hold — it's one form with a label that changes.

## 8. Curriculum-specific forms — do not exist, and there's a real grading-accuracy bug

`Curriculum` (IGCSE, A-Level, CBSE, IB, American) is likewise only a dropdown value with no curriculum-specific form fields or logic. More importantly: **`gradeFromPercentage()` in `src/lib/utils.ts` applies a single UK-style A\*/A/B/C/D/E/U letter-grade scale to every assessment result regardless of curriculum**, including CBSE assessments. Real CBSE schools in India/UAE grade on a percentage or CGPA (0–10) basis, not a Cambridge A\*–U scale — so a CBSE student's results pages (`CoordinatorResultsPage`, `ParentExamsPage`, `ParentProgressPage`) are showing a grading scheme that doesn't match how that curriculum is actually graded in reality. This is a product-accuracy gap, not just a missing feature, and should be flagged to whoever owns curriculum SME input before this goes anywhere near a real CBSE-curriculum branch.

---

## Summary

| Metric | Result |
|---|---|
| Forms using a validation library | 0 |
| Forms with native HTML validation beyond Login | 0 |
| Store "create" actions with no corresponding UI | 10 of 24 (42%) |
| Entities that are fully read-only despite having CRUD scaffolding | 4 (Teacher Reviews, Payment Plans, Syllabus Plans, Campaigns) |
| Subject-specific form logic | None — single generic form per entity type |
| Curriculum-specific form/grading logic | None — and the universal A*-U grading scale is factually wrong for CBSE |
