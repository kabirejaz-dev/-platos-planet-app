# UX Audit Report

## Design consistency — strong

A single, well-documented design system is applied with real discipline across all 79 pages: dark base (`#0A0E1A`), a 5-color accent palette (Electric Blue `#4D7CFF`, Neo Purple `#7B61FF`, Neon Mint `#00FFA3`, Coral `#FF6B7A`, Lime `#C6FF00`), Sora for display type / Inter for body, and a shared component kit (`PageHeader`, `StatCard`, `EmptyState`, `Modal`, `Avatar`, `DemoBadge`) reused consistently rather than reinvented per page. Spacing and type scale (a tight `text-[11px]`–`text-[14px]` micro-scale typical of dense SaaS dashboards) is applied uniformly. This is the strongest area of the app.

## Typography & color

Good hierarchy via weight/size/color rather than decoration — headings use `font-display` (Sora) consistently, body text uses Inter, and color is used semantically (mint for success/positive, coral for danger/overdue, amber for warning/pending) in the same way across Finance, Coordinator, and Branch Admin modules. This consistency is a genuine strength and is rare to see maintained across 79 pages built incrementally.

## Accessibility — weak, with two concrete, checkable failures

1. **Almost no ARIA/semantic accessibility annotation exists.** Grepped the entire `src/` tree for `aria-label`, `aria-*`, `role="`, `alt=` — **1 match in the whole codebase** (inside `Avatar.tsx`). The app uses many icon-only buttons (e.g. close buttons, sidebar toggle, notification bell) with no accessible name — a screen reader user would hear "button" with no indication of what it does.
2. **Likely WCAG contrast failures.** 24 occurrences across 17 files of text at `text-white/10` through `text-white/25` opacity directly on the `#0A0E1A` near-black background. White at 25% opacity composited over that background renders at roughly RGB(64,64,68) on RGB(10,14,26) — an estimated contrast ratio in the ~2:1 range, well under WCAG AA's 4.5:1 minimum for normal text (or even the relaxed 3:1 for large text). This affects secondary labels and metadata text broadly (e.g. "11px text-white/25" timestamp/sub-label patterns repeated throughout `StatCard`, table sub-rows, and empty states).
3. No visible focus-ring styling was found in the sampled CSS/components — keyboard users tabbing through the app likely have a hard time telling which element is focused (not exhaustively verified across every page, but no `focus-visible:` or `:focus` ring utility classes were found in the components read this session).

**Positives:** real `<button>`/`<a>`(`NavLink`)/`<select>`/`<input>` elements are used throughout rather than div-soup, so basic keyboard tabbing and semantic structure are better than the missing-ARIA finding alone would suggest — this is a "needs annotation," not a "needs rebuild," gap.

## Responsiveness

Content grids inside individual pages are genuinely responsive — `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` patterns appear throughout and correctly collapse to single-column on narrow viewports. **The persistent app shell is not mobile-optimized**: `Sidebar.tsx` is a fixed-width `<aside>` (240px expanded / 64px "collapsed") with no off-canvas/overlay drawer pattern for phone-width screens, and `TopBar.tsx`'s search bar is explicitly `hidden sm:flex` (intentionally hidden below 640px) with no mobile-specific replacement (e.g. a full-screen search sheet). On an actual phone, expect a cramped 64px icon rail permanently eating horizontal space rather than a proper slide-over menu.

## User flows

The core flows that exist are coherent: Login → role dashboard → sidebar nav → detail page → modal/form → toast confirmation, repeated consistently. The two flows worth calling out:
- **AI Tutor navigation is broken UX**, not just a missing feature: clicking "Quiz Generator" or "Flashcards" in the sidebar navigates the URL but always lands the user back on the "Ask Question" tab (see `ROLE_AUDIT_REPORT.md`) — this will read as a bug to any real user, not an intentional simplification.
- **Command Palette (⌘K)** is a nice touch matching the Linear/Stripe/Notion-style power-user pattern this app is visually emulating, but its hardcoded `ROLE_PAGES` map is stale (missing `ai_tutor` entirely, missing 7 of 8 `coordinator` items, missing all pages built this session) — so the power-user shortcut under-delivers relative to what the sidebar already offers.

## Comparison to named benchmarks

| Benchmark | What Plato's Planet does well by comparison | Where it falls short |
|---|---|---|
| **Linear** | Dark theme, dense info-per-pixel dashboards, ⌘K palette concept, consistent micro-typography — visually the closest match | Linear's actual keyboard/focus handling and command palette completeness far exceed this app's (stale palette, no visible focus rings) |
| **Stripe** | Clean tabular data presentation (invoices, fee collection tables), restrained color-as-signal use | Stripe's forms have real-time inline validation everywhere; this app has none (see `FORM_AUDIT_REPORT.md`) |
| **Notion** | Sidebar-driven nav structure, consistent spacing rhythm | Notion's UI is fully keyboard-navigable with strong focus indication; not demonstrated here |
| **Duolingo** | The gamification layer (XP, streaks, "Planet Journey," achievements) is a genuine, well-executed nod to Duolingo's reward loop, and visually distinct/fun rather than generic | Duolingo's gamification is driven by real, continuously-evaluated progress; here, most `Achievement.isUnlocked` flags are static seed booleans rather than computed live from behavior (see `ROLE_AUDIT_REPORT.md` Student section) — the loop looks real but isn't dynamically earned |
| **Khan Academy** | Subject/curriculum-aware content structure (batches, assessments tagged by subject+curriculum) | Khan Academy's content adapts pacing per learner; this app's "AI Study Planner" generates from a small static `TOPIC_BANK` keyed only by subject name, not from actual performance data per topic |

## Verdict

Visual/brand execution is genuinely strong and consistent — better than many real funded SaaS MVPs at this stage. Functional UX has two concrete bugs (AI Tutor tab navigation, stale command palette) and a real, fixable accessibility gap (near-zero ARIA coverage, low-contrast secondary text) that should be addressed before this is shown to anyone outside the building team, let alone a real branch.
