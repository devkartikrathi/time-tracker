# Chronos

A time tracker for the twenty-four hours you actually have. Log a day in about
twenty seconds, then watch a month of your real life appear as a grid.

Built with Next.js 16, React 19, Tailwind 4, Prisma 7 on Neon Postgres, and
Clerk for auth.

## Getting started

```bash
npm install
cp .env.example .env.local     # fill in DATABASE_URL and the Clerk keys
npx prisma migrate deploy      # apply the schema
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build (runs `prisma generate` first) |
| `npm test` | Domain logic tests — streaks, achievements, goals, insights |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint 9 flat config |
| `npm run db:studio` | Prisma Studio |

## How it is put together

```
app/
  (marketing)      /, /pricing, /privacy, /terms
  app/             the authenticated product — layout.tsx is the auth boundary
  api/             route handlers; every one calls requireUser()
components/
  app/             product UI (day grid, month heatmap, charts, pickers)
  marketing/       landing page pieces
  ui/              shadcn primitives, Tailwind 4
lib/               domain logic — pure and testable
  categories.ts    the validated colour system
  insights.ts      the deterministic insight engine
  ai-insights.ts   optional narrative layer over it
  streaks.ts       streak arithmetic
  stats.ts         aggregations shared by charts, goals and insights
proxy.ts           Next 16 middleware; attaches the Clerk session only
```

### Authorization

Authorization is checked at each resource, never by path matching:

- every API route calls `requireUser()` before touching data
- `app/app/layout.tsx` is a server component that redirects unauthenticated or
  un-onboarded users before any child renders

`proxy.ts` deliberately does nothing but attach the session. Clerk 7 deprecated
`createRouteMatcher` because middleware path matching can diverge from how
Next.js actually resolves a route, leaving protected resources reachable.

### The colour system

Activity colours come from one validated eight-slot categorical palette rather
than shades of a parent category. Within a single hue you get roughly three
perceptually separable steps before adjacent shades fall below the threshold
where even full-colour vision can tell them apart — so a user with six "Work"
activities would have seen six near-identical cells.

Light and dark carry different values because the dark surface has a narrower
usable lightness band. The light hex is the stored identity; `resolveColor()`
maps it to its dark twin at render time.

### Data model note

`DailyTask.date` is unique **per user** (`@@unique([userId, date])`). An earlier
version also had a global `@unique` on `date`, which meant the first user to log
a given calendar day silently blocked every other user from logging it.

## Deploying

The app targets Vercel. `vercel.json` registers an hourly cron that hits
`/api/cron/reminders`; it sends only to users whose configured reminder hour
matches the current hour in their own timezone, so one job covers every region.
