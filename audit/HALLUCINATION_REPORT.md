# Hallucination Audit Report

## Methodology

Case-insensitive grep across all of `src/` for: `KHDA`, `award`, `ranking`, `partnership`, `testimonial`, `accredited`, `certified`, `trusted by`, `#1 in`, `leading provider`. Cross-checked `DemoBadge`/"Demo Data" label coverage across all 79 page files. Read `index.html` SEO/OG meta tags and `LoginPage.tsx` hero copy in full.

## Result: no fabricated business claims found

Zero matches for KHDA, awards, rankings, partnerships, testimonials, accreditation claims, or "trusted by / #1 / leading provider" superlatives anywhere in the codebase. The only matches for "award"/"ranking" are the Lucide `Award` icon import (used for the Achievements/Scholarships UI) and a `rankings` *variable name* in `ResultsPage.tsx` computing top student performers from real seeded assessment data — neither is a marketing claim.

The login page hero copy (`"AI-Powered Education OS — UAE & GCC"`, `"9 User Roles"`, `"3+ Curricula"`, `"AI-First Platform"`) is generic product positioning describing the demo itself, not a factual claim about a real, operating business, named clients, revenue, or student counts. This is acceptable as-is.

## Demo Data labeling coverage

129 occurrences of `<DemoBadge />` / "Demo Data" across **60 of 79** page files. **7 files display seeded business data without the label:**

| File | Risk |
|---|---|
| `ai-tutor/AITutorPage.tsx` | **Highest priority.** The chat responses are 100% scripted/keyword-matched (see `ROLE_AUDIT_REPORT.md`), but nothing in the UI discloses this is simulated rather than a live AI model. A user could reasonably believe they're talking to a real, intelligent tutor. Recommend adding an explicit "Simulated responses — Demo Mode" disclosure directly in the chat UI, not just relying on the generic page-level badge convention used elsewhere. |
| `finance/InvoicesPage.tsx` | Shows seeded invoice amounts/student names with no badge — inconsistent with `OutstandingFeesPage`/`CollectionPage` which do label it |
| `teacher/AttendancePage.tsx` | Same — seeded attendance shown unlabeled |
| `teacher/TestsPage.tsx` | Same — seeded test results shown unlabeled |
| `shared/MessagesPage.tsx` | Lower priority — message content is flavor text, but still seeded names/content |
| `auth/LoginPage.tsx`, `super-admin/GoLivePage.tsx` | Not a concern — neither displays seeded business records |

**Recommendation:** add `<DemoBadge />` to the 5 flagged data-displaying pages for labeling consistency, and add an explicit in-chat disclosure to the AI Tutor specifically, since that's the one place a user could mistake simulated output for a real capability.

## Fictional data inventory (already correctly contained to demo context)

All of the following exist only in `src/data/seed.ts` and render exclusively behind the "Demo Data" convention described above — none should be treated as real and none should ever be copied into real marketing/legal material without replacement:
- 3 branch addresses, phone numbers, emails, and "established" years (Dubai Marina Centre, Jumeirah Learning Hub, Abu Dhabi Main Campus)
- All staff/parent/student names, emails, phone numbers (fictional)
- All revenue/invoice amounts, lead counts, attendance rates, exam scores

## One item to verify before go-live (not a hallucination, but adjacent)

`index.html` sets `<meta property="og:url" content="https://platos-planet-app.vercel.app" />`. This asserts a specific canonical production URL. **Confirm this exact URL is the real, intended production domain before launch** — if the eventual Vercel deployment URL differs, social-share previews (Open Graph/Twitter Card) will silently point at the wrong canonical link. Also note: `og:image` references `/og-image.png` and the `<link rel="icon">` references `/favicon.svg` — **neither file exists in `public/`** (see `DEVOPS_REPORT.md`), so social previews and the browser tab icon are currently broken regardless of the URL question.

## Verdict

**No remediation required for fabricated factual claims — there are none.** The two real action items are (1) labeling consistency on 5 files and (2) an explicit "simulated" disclosure inside the AI Tutor chat UI itself.
