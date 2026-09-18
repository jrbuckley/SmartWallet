# Validating this PR

How to verify the Phase 1 scaffold works. Everything below was run
against this branch before it was marked ready.

## Automated checks (run these)

```bash
npm install
npx tsc --noEmit   # must pass with no errors
npm run build      # must succeed; all routes prerender as static
```

The build is intentionally green **without** `DATABASE_URL` set — the
Drizzle client in `lib/db.ts` is lazy, and pages render seed data until
week 2 wires up Postgres.

## Manual smoke test

```bash
npm run dev   # http://localhost:3000
```

| Check | Expected |
|---|---|
| Visit `/` | Redirects to `/dashboard` |
| `/dashboard` | 3 summary cards (monthly expenses, investments value, unpaid count) + "Due in the next 30 days" table |
| `/expenses` | Expense form + table of 5 seed expenses with paid/unpaid pills |
| `/investments` | Total value + gain/loss cards, holdings table with per-row gain/loss |
| `/insights` | Priority pills (high/medium/low) with the savings recommendations |
| Nav | Active link highlights per route |
| Expense form: submit empty name | Inline error "Name is required." |
| Expense form: submit amount `0` or negative | Inline error "Amount must be a positive number." |

Note: submitting a valid expense currently validates and revalidates the
page but does **not** persist — persistence lands with the Postgres
wiring in week 2 (`lib/actions.ts` has the TODO).

## What "done" means for this PR

- `npx tsc --noEmit` clean
- `npm run build` green with no env vars set
- All five routes render with correct data above
- Form validation errors show inline; no console errors
