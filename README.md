# Propella

**Exam preparation for serious candidates.**

Propella is a full-stack AI-powered study platform built for Nigerian students sitting JAMB, WAEC, and NECO. It generates a personalized, topic-by-topic roadmap from the official syllabus, enforces spaced repetition automatically, and uses AI to produce quizzes, mock exams, and on-demand explanations — all inside a single focused product.

---

## Stack

**Frontend**

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white)

**Backend**

![Express](https://img.shields.io/badge/Express_4-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js_20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)

**AI**

![Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

**Tooling & Deployment**

![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black)

---

## Project structure

```
propella/
├── apps/
│   ├── web/                  Next.js 16 student app        (port 3000)
│   ├── admin/                Next.js 16 admin console      (port 3001)
│   └── api/                  Express 4 backend            (port 5000)
│       ├── prisma/
│       │   └── schema.prisma PostgreSQL schema
│       └── scripts/          Migrations, seeding, admin, smoke tests
├── packages/
│   ├── shared/               Zod schemas, TypeScript types, XP constants
│   └── config/               Shared tsconfig, ESLint, Prettier
├── pnpm-workspace.yaml
└── README.md
```

---

## Getting started

### Prerequisites

- Node.js 20+
- pnpm 10+
- A PostgreSQL database — [Supabase](https://supabase.com), [Neon](https://neon.tech), or a local Postgres 14+
- A [Gemini API key](https://aistudio.google.com/apikey) for the AI features

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

Fill in `apps/api/.env`:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection string — used by the running app |
| `DIRECT_URL` | Direct Postgres connection string — used only by `prisma migrate`. Leave blank to reuse `DATABASE_URL` |
| `JWT_ACCESS_SECRET` | Long random string — `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | Long random string — `openssl rand -hex 64` |
| `GEMINI_API_KEY` | From [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — required for quizzes and AI chat |
| `GEMINI_QUIZ_MODEL` | Defaults to `gemini-2.5-pro` — quiz and mock generation |
| `GEMINI_CHAT_MODEL` | Defaults to `gemini-2.5-flash` — assistant chat |
| `RESEND_API_KEY` | Transactional email. Leave blank to disable sending |
| `FRONTEND_URL` | `http://localhost:3000` in development |
| `COOKIE_DOMAIN` | Optional — for cross-subdomain cookies (e.g. `.propella.com`) |

<details>
<summary><b>Where to find the connection strings</b></summary>

**Supabase** — Project Settings ▸ Database ▸ Connection string

```
DATABASE_URL=postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

**Neon** — Dashboard ▸ Connection details

```
DATABASE_URL=postgresql://<user>:<pw>@ep-xxx-pooler.<region>.aws.neon.tech/propella?sslmode=require
DIRECT_URL=postgresql://<user>:<pw>@ep-xxx.<region>.aws.neon.tech/propella?sslmode=require
```

Port `6543` (Supabase) and the `-pooler` host (Neon) are the pooled endpoints. Migrations must run over the direct connection, which is why `DIRECT_URL` exists.

</details>

### 3. Create the database schema

```bash
pnpm db:migrate       # creates the tables and writes a migration file
```

Use `pnpm db:push` instead if you want to sync the schema without generating migration history.

> `DIRECT_URL` may be left blank — the `db:*` scripts fall back to `DATABASE_URL` automatically.

### 4. Seed the syllabus

Loads all 11 subjects and their topics (JAMB, WAEC, NECO). Safe to re-run — subjects are upserted by slug, so editing the seed file and re-running updates the syllabus in place.

```bash
pnpm seed
```

### 5. Start development servers

```bash
pnpm dev
```

| Server | URL |
|---|---|
| Web app | http://localhost:3000 |
| Admin console | http://localhost:3001 |
| API | http://localhost:5000 |
| Health check | http://localhost:5000/health |

### 6. Sign in to the admin console

`pnpm seed` creates a super admin. With `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`
left blank in development it uses:

| | |
|---|---|
| Email | `admin@propella.local` |
| Password | `ChangeMe!2026` |
| Console | http://localhost:3001 |

**Change that password before exposing the app to anyone.** In production the
seed refuses to create a super admin unless both variables are set explicitly,
so there is never a default-password account on a real deployment.

To promote any other account (there is deliberately no self-service route):

```bash
pnpm --filter @propella/api admin:grant you@example.com
pnpm --filter @propella/api admin:list      # who currently has access
```

### Push notifications

Study reminders, streak warnings, achievements and admin announcements are
delivered as web push. It needs a VAPID key pair:

```bash
pnpm --filter @propella/api push:keys
```

Paste the output into `apps/api/.env` and `apps/web/.env.local` as printed.
Leave the keys blank and push is simply disabled — in-app notifications still
work, exactly as a blank `RESEND_API_KEY` disables email but not sign-up.

Changing the keys invalidates every existing subscription, so keep them stable
once a deployment is live.

Students opt in per device from **Settings → Notifications**. iPhone only
allows push from an installed PWA, so on iOS the app must be added to the home
screen first; the settings page says so rather than showing a control that
cannot work.

### Email verification in development

Sign-up sends a six-digit code. With `RESEND_API_KEY` blank nothing can be
delivered, so in development the code is:

- printed in the API log (`Email verification code (dev only)`), and
- shown directly on the verification screen, with a **Use this code** button.

Both are gated on `NODE_ENV !== 'production'` **and** `RESEND_API_KEY` being
empty — the moment either changes, `/api/auth/dev-verification-code` returns 404
and the banner disappears.

---

## Testing

The suite runs against a **live API and a real database** — it is an end-to-end
smoke test rather than unit tests, so it catches wiring problems that mocks hide.
Every run creates throwaway accounts and deletes them afterwards.

```bash
pnpm --filter @propella/api dev   # in one terminal
pnpm test                         # in another
```

| Command | Covers |
|---|---|
| `pnpm test` | Both suites below (52 checks) |
| `pnpm --filter @propella/api test:smoke` | Health, subjects, signup, OTP verification, onboarding, roadmap, dashboard, progress, leaderboard |
| `pnpm --filter @propella/api test:admin` | Role gating, metrics, past-question import (CSV + JSON, de-duplication, row rejection), filtering, deletion |

> Signup is rate limited to 3 accounts per hour per IP. The limiter is
> in-memory, so restarting the API resets it if you run the suite repeatedly.

---

## Deploying

Production setup for Vercel (both apps) and Render (API), with every environment
variable and the commands you will need: **[docs/deployment.md](docs/deployment.md)**.

The brand voice all user-facing copy follows: **[docs/brand-voice.md](docs/brand-voice.md)**.

## Features

**Adaptive roadmap** — generates a topic-by-topic study plan from the official syllabus, weighted by the student's self-assessed strengths and weaknesses. The plan recomputes after every quiz attempt and study session using the SM-2 spaced repetition algorithm.

**AI quiz generation** — quizzes are generated on demand by Gemini, calibrated to the exact JAMB/WAEC/NECO syllabus. Questions come back through a declared response schema, so the model returns structured JSON rather than prose to be parsed. Questions include full explanations, and recently-seen stems are excluded to prevent repetition.

**Mock exams** — full-length timed practice papers structured like the actual exam (40 questions/subject for JAMB, 60 total for WAEC/NECO), with a per-topic breakdown on results.

**AI assistant** — streaming chat powered by Gemini Flash. Contextualized to the student's current syllabus. Explains concepts, provides worked examples, and suggests practice questions.

**Marathon mode** — long focused study runs with a configurable Pomodoro cycle, SVG progress ring, and 2× XP multiplier. Runs as a full-screen distraction-free layout.

**Gamification** — XP ledger (append-only), streak tracking with freeze logic, seven rank tiers (Novice → Distinction, modeled on the Nigerian university classification system), weekly/monthly/all-time leaderboard.

**Reminder scheduler** — node-cron jobs fire streak-warning reminders for at-risk users, process due notifications every 5 minutes, and sweep expired notifications hourly.

**Admin console** — a separate Next.js app (`apps/admin`, port 3001) for platform
staff: usage metrics, account management with admin role grant/revoke, and bulk
upload of past questions.

**Achievements** — fifteen badges across streaks, study time, quizzes, syllabus
progress and XP. The catalogue lives in `packages/shared/src/badges.ts` so both
apps render a badge from its id alone; only who earned what is stored. Awarding
is idempotent and hangs off every XP event, so a badge check can never fail the
quiz or session that earned it.

**Announcements** — admins can send a notification to all students, to those
active in the last 30 days, or to unverified accounts. It lands in-app and as a
push on devices that opted in.

**Installable (PWA)** — both the student app and the admin console ship a web
manifest, generated PNG icons and a service worker, so they can be installed to
a phone home screen or desktop and keep working offline for pages already
visited. The worker is deliberately hand-written rather than generated:
`next-pwa` does not support Next 16 with Turbopack, and the caching rules need to
be explicit. **Nothing from `/api/` is ever cached** — this app serves per-user
data, so only build assets and page shells are stored. It registers in
production builds only; in development the dev server's constantly changing
bundles would go stale behind it.

### Uploading past questions

The admin console accepts CSV or JSON. Required columns are `exam`, `year`,
`subject`, `question`, `a`–`d` and `answer`; `topic`, `explanation` and `source`
are optional. Column names are matched loosely, so `stem`/`question` and
`correct`/`answer` both work.

```csv
exam,year,subject,topic,question,a,b,c,d,answer,explanation,source
jamb,2019,physics,motion,"A body starts from rest and accelerates at 2 m/s². Velocity after 5 s?","5 m/s","10 m/s","15 m/s","20 m/s",B,"v = u + at","JAMB 2019"
```

Each question is fingerprinted on `exam|year|subject|normalised question text`,
so **re-uploading the same file imports nothing new** — safe to retry. Malformed
rows are rejected individually with the spreadsheet row number and a reason;
the rest of the file still imports. Every upload is recorded under *Import
history*, including its rejections.

---

## Architecture notes

- **Monorepo** — shared Zod schemas live in `packages/shared` and are imported by both `apps/web` and `apps/api`. Types are never duplicated.
- **Auth** — JWT access tokens (15 min) + refresh tokens (30 days) stored in httpOnly cookies. Automatic token rotation on refresh. Passwords hashed with `bcryptjs` (pure JS — no native build step).
- **Prisma 7** — the client is generated into `apps/api/src/generated/prisma` (gitignored) rather than `node_modules`, and Postgres is reached through the `@prisma/adapter-pg` driver adapter. `postinstall` regenerates it, so a fresh `pnpm install` is enough. Everything Prisma is re-exported from [`apps/api/src/config/db.ts`](apps/api/src/config/db.ts) — import models and enums from there, not from `@prisma/client`.
- **Data model** — hybrid. Anything filtered, sorted or aggregated (XP, scores, streaks, notifications) is a real indexed column. Structures always read and written as a whole — roadmap nodes, quiz questions, chat messages, syllabus topics — are `jsonb`. Their TypeScript shapes live in [`apps/api/src/models/types.ts`](apps/api/src/models/types.ts).
- **Dates in `jsonb`** — `jsonb` has no date type, so every date inside a JSON column is an **ISO-8601 string**. Parse with `new Date(...)` before doing date arithmetic.
- **XP** — stored as an append-only ledger in `xp_events`. Total XP is always computed by aggregation; no denormalized total that can drift.
- **Roadmap** — one row per user. Nodes carry SM-2 state (`easeFactor`, `interval`, `repetitions`) updated after every quiz. Mastery formula: `mastery_new = mastery_old × 0.7 + quiz_correctness × 30`, clamped to [0, 100].
- **AI calls** — always routed through the Express backend. The Gemini API key is never exposed to the browser.
- **Admin access** — the `admin` role is re-read from the database on every admin request rather than trusted from the JWT, so revoking access takes effect immediately instead of when the token expires.
- **Connection strings** — do not put `sslmode=` in `DATABASE_URL`. Recent `node-postgres` reads it as `verify-full`, which managed Postgres certificates fail; SSL is configured on the adapter in [`db.ts`](apps/api/src/config/db.ts) instead. Percent-encode any `@`, `:` or `/` in the password (`@` → `%40`).
- **Mobile navigation** — a Tools sheet (Framer Motion slide-up with drag-to-dismiss) houses the secondary nav items on mobile, keeping the bottom tab bar to five focused slots.

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start all dev servers in parallel |
| `pnpm build` | Build all packages and apps |
| `pnpm type-check` | Run TypeScript across the monorepo |
| `pnpm db:migrate` | Create/apply a migration in development |
| `pnpm db:deploy` | Apply pending migrations (production) |
| `pnpm db:push` | Sync schema without migration history |
| `pnpm db:generate` | Regenerate the Prisma client |
| `pnpm db:studio` | Open Prisma Studio to browse the database |
| `pnpm seed` | Seed syllabus data |
| `pnpm test` | End-to-end smoke tests (needs the API running) |
| `pnpm --filter @propella/api admin:grant <email>` | Grant admin access |
| `pnpm --filter @propella/api admin:list` | List administrators |
| `pnpm --filter @propella/web build` | Production build for the web app |
| `pnpm --filter @propella/admin dev` | Admin console only |

---

## License

Private. All rights reserved.
