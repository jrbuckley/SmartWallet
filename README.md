# SmartWallet — Next.js rebuild

Personal financial planner: expense tracking, investment monitoring, and
savings insights. Rebuilt on the Next.js App Router as a full-stack learning
project.

> The original Vite + React SPA is preserved on the `main` branch history.
> This branch (`nextjs-rebuild`) replaces it with the Next.js app.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- PostgreSQL via Drizzle ORM (`postgres-js` driver)
- Plain CSS with the original app's variable/class naming, so the theme
  ports over drop-in

## Phases

- **Phase 1 (weeks 1–4):** App Router rebuild — routes, layouts, server vs
  client components, SSR/streaming. Postgres wired with Drizzle migrations
  and real reads/writes; single demo user until auth lands.
- **Phase 2 (weeks 5–8):** Docker, GitHub Actions → ECR → ECS Fargate, RDS
  with migrations in the pipeline, Playwright E2E, Sentry, CloudWatch.
- **Phase 3 (ongoing):** FastAPI backend service behind the Next.js
  frontend; real LLM-powered insights; system-design reps.

## Run it

```bash
npm install
docker compose up -d   # local Postgres
npm run db:migrate      # apply drizzle/ migrations
npm run db:seed         # fictional sample data
npm run dev            # http://localhost:3000
```

Copy `.env.example` to `.env` and set `DATABASE_URL`
(`<redacted>` for the compose setup above).

## Project layout

- `app/` — routes: `/dashboard`, `/expenses`, `/investments`, `/insights`
- `components/` — `site-nav` + `expense-form` are client components;
  everything else renders on the server
- `lib/data.ts` — domain types + async Postgres reads (aggregates stay pure
  functions over arrays, so `lib/insights.ts` stays testable)
- `lib/insights.ts` — the savings-insight rules as pure functions
- `lib/schema.ts` — Drizzle table definitions; migrations in `drizzle/`
- `lib/db.ts` — lazy Drizzle client (build-safe without `DATABASE_URL`)
- `lib/actions.ts` — server actions: create / mark paid / delete expense
- `scripts/seed.ts` — fictional sample data (`npm run db:seed`)
