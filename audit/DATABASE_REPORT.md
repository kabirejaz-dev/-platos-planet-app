# Database Audit Report

## Verdict: there is no database

This is unambiguous and was confirmed multiple ways:
- No ORM in `package.json` (no Prisma, Drizzle, Mongoose, TypeORM, Sequelize)
- No DB driver (no `pg`, `mysql2`, `mongodb`, `@supabase/supabase-js`, `firebase`)
- No `.sql` files, no `migrations/` directory, no schema files anywhere in the repo
- Zero network calls anywhere in `src/` (`fetch`/`axios`: 0 matches) — there is nothing for a database to even be reached *through*
- `server.js` at the repo root (an orphaned, unrelated Express scaffold — see `PLATO_APP_INVENTORY.md` / `DEVOPS_REPORT.md`) has one static route and connects to nothing

## What exists instead

| Real DB concept | What this app has |
|---|---|
| Schema | TypeScript interfaces in `src/types/index.ts` — 30 well-named interfaces (`User`, `Student`, `Teacher`, `Parent`, `Batch`, `Invoice`, `Assessment`, etc.) with sensible field typing. **This is genuinely good schema *design* work** — it would translate cleanly to real SQL tables or a Prisma schema — it just isn't backed by an actual database engine. |
| Foreign keys | None — relationships are informal string-ID references (`Student.parentId: string`, `Batch.teacherId: string`) with **no referential integrity enforced anywhere**. Nothing stops `addStudent({ parentId: 'does-not-exist' })` from being called; the app would simply fail to resolve the lookup silently (`.find()` returns `undefined`) rather than erroring. |
| User table | `users: User[]` in `src/data/seed.ts` — 27 hardcoded records, held in memory/localStorage only |
| Student table | `students: Student[]` — 12 hardcoded records |
| Parent table | `parents: Parent[]` — 8 hardcoded records |
| Finance tables | `invoices: Invoice[]`, `expenses: Expense[]`, `paymentPlans: PaymentPlan[]` — all in-memory arrays |
| Migrations | None — the only "migration" concept is Zustand's `persist` `version` number (currently `3`) with a `migrate: () => ({ currentUser: null, ...seedData })` function that **discards all user changes and resets to the hardcoded seed** on any version bump. This is the opposite of a real migration — it's a wipe. |
| Backups | None — and none are possible, because all data lives in one browser's `localStorage` for one user on one device. Clearing site data, using a different browser, or using incognito mode all produce a completely empty/reset app with no recovery path. |
| Uniqueness constraints | None — nothing stops two `User` records sharing the same `email`, two `Invoice` records sharing the same `invoiceNumber`, etc. |
| Multi-user / multi-device consistency | None — two people opening this app in two different browsers see two entirely independent, diverging copies of "the database." There is no shared backend state at all. |

## What this means concretely

- Every demo session is single-browser, single-device, and ephemeral. There is no concept of "the real data" that two staff members at the same branch could both see and edit.
- The `addX`/`updateX`/no-`deleteX` pattern noted in `FORM_AUDIT_REPORT.md` would need to become real API calls (`POST`/`PATCH`/`DELETE` against real endpoints) before any of this is usable beyond a single-user demo.
- The existing TypeScript interfaces in `types/index.ts` are a solid starting point for a real schema (e.g. a Prisma schema or SQL DDL) — this is the one piece of "database work" that's actually reusable going forward.

## Recommendation for the next step (not built in this audit pass)

Pick a managed Postgres provider (Supabase, Neon, or Vercel Postgres given the `vercel.json` already present) + an ORM (Prisma fits the existing TS-first codebase well), translate `types/index.ts` into a real schema with proper foreign keys and unique constraints, and replace every Zustand `addX`/`updateX` call with a real API call. This is a multi-week backend build, not a config change.
