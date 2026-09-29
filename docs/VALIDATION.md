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

## Latest validation pass (2026-09-28)

Re-ran from a clean checkout of this branch after the corrective commit
(`45d6ce6`): full Vite leftovers (`src/`, `vite.config.ts`,
`tsconfig.app.json`, `tsconfig.node.json`) removed, seed finance data
replaced with obviously fictional samples, `package-lock.json` confirmed
committed.

- `npm install` — clean
- `npx tsc --noEmit` — clean, no errors
- `npm run build` — green; `/`, `/dashboard`, `/expenses`, `/investments`,
  `/insights`, `/_not-found` all prerender as static
- Production smoke (`next start`): `/` → 307 to `/dashboard`;
  `/dashboard`, `/expenses`, `/investments`, `/insights` → 200.
  Fictional seed entries render on `/expenses`.

## Not covered by this PR

- **No linter is configured** — there is no eslint config and no `lint`
  script, so nothing here implies lint passed.
- **No Playwright/E2E suite exists yet** — E2E lands in Phase 2.
