# Data Flow Audit Report

## Architecture

Single Zustand store (`src/store/appStore.ts`), single source of truth, no duplicate state anywhere in the sampled pages. Every page reads via `useAppStore()` and filters the same arrays by `studentId`/`batchId`/`branchId`/`teacherId` — there is no per-role copy of student/attendance/assessment data. This is architecturally correct for what it is: **the propagation pattern itself is sound**, the gaps are in specific flows not being fully wired end-to-end.

---

## Flow 1: Sales enrolls a lead → student appears everywhere

**Verified by reading `LeadsPage.tsx:handleEnroll()` directly.** This is real, not fake:

```
addUser({ role: 'student', ... })
addStudent({ ...lead data, batchIds: [], xp: 0, planet: 'Mercury' })
updateLead(leadId, { status: 'enrolled', convertedAt: ... })
addNotification(...)
```

✅ A real `User` + `Student` record is created from the lead data.
✅ `updateLead` correctly marks the source lead as converted (no duplicate/orphaned lead).
✅ A notification fires.

**Gap found:** the new `Student` is created with **`batchIds: []`** and **no `parentId`** — the lead's `parentName`/`parentEmail` data is never used to create or link a `Parent` record. Consequences:
- The newly enrolled student will **not** appear on any Parent dashboard (`ParentDashboard`, `ProgressPage`, `ExamsPage`, etc. all resolve via `parents.find(p => p.userId === currentUser.id)` → `student.find(s => s.id === parent.studentIds[0])` — there is no parent pointing at this student).
- The student won't appear in any Teacher's class roster or Attendance/Homework/Assessment pages until a Branch Admin separately assigns them to a batch — no such "assign existing student to batch" UI was found in the sampled Branch Admin pages (`BatchesPage.tsx` creates new batches; it does not appear to support adding an existing student to an existing batch's roster).

**Verdict: partially real.** The enrollment event itself is genuine and creates real records, but the promise "student appears everywhere" breaks for the Parent role and for Teacher class rosters immediately after enrollment.

---

## Flow 2: Teacher marks attendance → Parent sees it

**Verified by code inspection of `AttendancePage.tsx` (teacher) and `ParentAttendancePage.tsx` (parent).** Both read/write the single `attendance: AttendanceRecord[]` array, filtered by `studentId`. Teacher calls `bulkAddAttendance(records)`; Parent page computes `calculateAttendanceRate()` over the same array.

**Verdict: real.** ✅ No duplicate state, no fake numbers — a present/absent mark made by a teacher is the exact same record the parent's percentage is computed from.

---

## Flow 3: Finance records a payment → Parent/Student/Finance update

**Verified:** `CollectionPage.tsx` and `InvoicesPage.tsx` both call `updateInvoice(id, { status: 'paid', paidDate, paymentMethod })` against the single `invoices: Invoice[]` array. `ParentFeesPage`, `ParentDashboard`, `OutstandingFeesPage`, `FeeOverviewPage` (Branch Admin), and the new `VATReportsPage` all read from that same array.

**Verdict: real**, with caveats already covered in `SECURITY_REPORT.md`/`ROLE_AUDIT_REPORT.md`: it's a local status flip, not a real payment — no money moves, no gateway webhook, no idempotency guard against double-clicking "Record Payment" twice (would currently just call `updateInvoice` twice with the same result — harmless here, but indicates no submit-lock pattern exists, which matters once this is backed by a real charge API).

---

## Flow 4: Teacher publishes marks → Parent/Student/Analytics update

**Verified:** `AssessmentsPage.tsx` (teacher-facing, sampled) and the Coordinator's `AssessmentsPage.tsx`/`ResultsPage.tsx`/`AcademicReportsPage.tsx`, plus `ParentExamsPage.tsx`/`ParentProgressPage.tsx`/`StudentTestsPage.tsx`, all read the identical `assessments: Assessment[]` array and its nested `results: AssessmentResult[]`, matched by `studentId`.

**Verdict: real**, and notably the field-name bug fixed earlier this session (`assessment.submissions` → `assessment.results`) was exactly in this flow — confirming this pathway was actually exercised and tested, not just assumed to work.

---

## Disconnected / one-way modules found

| Module | Issue |
|---|---|
| Campaigns, Payment Plans, Syllabus Plans, Teacher Reviews | 100% read-only (see `FORM_AUDIT_REPORT.md`) — these are dead-end leaves with no inbound mutation flow at all, so there's no "flow" to audit; they just display static seed data forever |
| Audit Logs | One-directional in the wrong sense: it's meant to be the *output* of every other module's actions, but no module writes to it. Approving a scholarship, resolving an intervention, recording a payment — none of these append an `AuditLogEntry`. The feature exists as a static list, not a real audit trail |
| Scholarships | Application can be approved/rejected but never *created* by a Parent/Student — so the "applications" sales reviews are permanently limited to the 4 seeded ones |
| Branch Requests | Same shape: approvable but not creatable from the UI |
| Class Notes → Resources | This one **is** correctly wired: `ClassNotesPage` (teacher) writes to `classNotes`, `ResourcesPage` (student) reads the same array filtered by the student's `batchIds`. ✅ Real, working, cross-role flow. |
| AI Tutor "Saved Answers" | Correctly wired: the `saved` flag toggled in `AITutorPage` chat is read live by `SavedAnswersPage`. ✅ |

## Fake / static data flows

None of the *built* flows fabricate numbers from nothing — every chart/stat reads from the shared store. The closest thing to "fake data flow" is the **Audit Logs and read-only entities above**, which look like live data flows but are actually frozen seed snapshots with no write path.

## Summary

| Verdict | Count |
|---|---|
| Fully real, end-to-end, cross-role flows | 5 (Attendance, Fees/Invoices, Assessments/Results, Class Notes → Resources, AI Saved Answers) |
| Partially real (creates records but misses a link) | 1 (Lead → Enrolled Student: misses Parent link + batch assignment) |
| Read-only dead ends (no write path exists) | 4 (Campaigns, Payment Plans, Syllabus Plans, Teacher Reviews) |
| Should-be-automatic but entirely missing | 1 (Audit Log — nothing in the app writes to it) |
