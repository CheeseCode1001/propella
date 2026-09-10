# Production deployment

Three pieces:

| Piece | Host | What it is |
|---|---|---|
| `apps/api` | **Render** | Express API, the only thing that talks to the database |
| `apps/web` | **Vercel** | Student app (Next.js) |
| `apps/admin` | **Vercel** | Admin console (Next.js) |
| Database | **Supabase** | Postgres — already provisioned |

Deploy in that order. The apps need the API's URL, and the API needs theirs.

---

## A note on WebSockets

**Propella does not use WebSockets, and does not need them.**

The one streaming feature — the AI assistant typing its answer — uses
**Server-Sent Events** (`Content-Type: text/event-stream`), which is plain HTTP.
Render supports it on a normal web service with no extra configuration, no
protocol upgrade and no special plan.

Two things matter for SSE on Render:

1. **Do not put a buffering proxy in front of it.** Render's own router streams
   fine. The API already sends `Cache-Control: no-cache` and flushes headers
   before writing.
2. **The free plan sleeps after 15 minutes of inactivity.** A sleeping instance
   drops in-flight streams and delays the scheduler that sends study reminders.
   Use **Starter** or above for anything real.

If you later add true WebSockets, Render supports them on the same service and
port — no config change, just make sure the client connects to `wss://`.

---

## 1. Database (Supabase)

You need two connection strings from **Project Settings → Database**:

| Variable | Which string | Used by |
|---|---|---|
| `DATABASE_URL` | **Connection pooling** (host contains `-pooler`, port 5432) | The running app |
| `DIRECT_URL` | **Direct connection** | `prisma migrate` only |

Migrations cannot run through the pooler, which is why both exist.

---

## 2. API on Render

### Option A — Blueprint (recommended)

The repo has [`render.yaml`](../render.yaml). In Render: **New → Blueprint**,
point it at the repo, and it will prompt for every secret.

### Option B — by hand

**New → Web Service**, connect the repo, then:

| Setting | Value |
|---|---|
| Root Directory | *(leave blank — the build needs the workspace root)* |
| Runtime | Node |
| Region | Frankfurt (nearest to the `eu-west-1` database) |
| Instance type | Starter or above |
| Health check path | `/health` |

**Build command:**

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm --filter @propella/shared build
pnpm --filter @propella/api exec prisma migrate deploy
pnpm --filter @propella/api build
```

**Start command:**

```bash
node apps/api/dist/server.js
```

Migrations run in the *build*, not at boot — a bad migration then fails the
deploy instead of taking down a running instance. Render keeps the old version
live until the new build succeeds.

### API environment variables

| Variable | Required | Value |
|---|---|---|
| `NODE_ENV` | ✅ | `production` |
| `NODE_VERSION` | ✅ | `22` |
| `PORT` | — | Render sets this itself |
| `DATABASE_URL` | ✅ | Supabase **pooled** string |
| `DIRECT_URL` | ✅ | Supabase **direct** string |
| `JWT_ACCESS_SECRET` | ✅ | `openssl rand -hex 64` |
| `JWT_REFRESH_SECRET` | ✅ | `openssl rand -hex 64` (different from the above) |
| `ACCESS_TOKEN_TTL` | — | `1d` |
| `REFRESH_TOKEN_TTL` | — | `30d` |
| `FRONTEND_URL` | ✅ | `https://your-web.vercel.app` — exact origin, **no trailing slash** |
| `ADMIN_URL` | ✅ | `https://your-admin.vercel.app` |
| `CORS_EXTRA_ORIGINS` | — | Comma-separated extras (custom domain, second preview) |
| `GEMINI_API_KEY` | ✅ | From [AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_QUIZ_MODEL` | — | `gemini-flash-latest` |
| `GEMINI_CHAT_MODEL` | — | `gemini-flash-latest` |
| `RESEND_API_KEY` | — | Blank disables email; sign-up still works |
| `EMAIL_FROM` | — | e.g. `Propella <noreply@yourdomain.com>` |
| `VAPID_PUBLIC_KEY` | — | From `pnpm --filter @propella/api push:keys` |
| `VAPID_PRIVATE_KEY` | — | Same command. **Secret** — never ship to the browser |
| `VAPID_SUBJECT` | — | `mailto:you@yourdomain.com` |
| `SUPER_ADMIN_EMAIL` | ✅ | The first admin account |
| `SUPER_ADMIN_PASSWORD` | ✅ | A real password — the seed refuses defaults in production |
| `COOKIE_DOMAIN` | — | Only if API and web share a parent domain (see below) |

### Seeding

Once the service is live, run this **once** from Render's shell
(**Dashboard → Shell**):

```bash
pnpm --filter @propella/api seed
```

That loads the subject syllabus and creates the super admin from
`SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`. It is idempotent — safe to re-run.

---

## 3. Web app on Vercel

**Add New → Project**, import the repo, then:

| Setting | Value |
|---|---|
| Root Directory | `apps/web` |
| Framework | Next.js *(auto-detected)* |
| Build & install | Taken from [`apps/web/vercel.json`](../apps/web/vercel.json) |

Leave the build settings alone — the committed `vercel.json` builds
`@propella/shared` first, which the app imports.

### Web environment variables

| Variable | Required | Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | `https://your-api.onrender.com` — **no trailing slash, no `/api`** |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | — | Must match `VAPID_PUBLIC_KEY` on Render exactly |

Set them for **Production, Preview and Development**.

---

## 4. Admin console on Vercel

A **second** Vercel project from the same repo:

| Setting | Value |
|---|---|
| Root Directory | `apps/admin` |
| Framework | Next.js |

### Admin environment variables

| Variable | Required | Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | The same Render URL |

---

## 5. Close the loop

Once both Vercel projects have URLs, go back to Render and set `FRONTEND_URL`
and `ADMIN_URL` to those exact origins, then redeploy. Until you do, the browser
will block every API call with a CORS error.

---

## The cross-site cookie, and why it matters

In production the web app and the API are on **different domains**
(`*.vercel.app` and `*.onrender.com`). Every API call is therefore *cross-site*,
and browsers only send cookies on cross-site requests when they are
`SameSite=None; Secure`.

The API sets that automatically when `NODE_ENV=production`. Locally it uses
`SameSite=Lax`, because `Secure` cookies are not stored over plain `http`.

**What this means for you:**

- `NODE_ENV` **must** be `production` on Render. If it is not, the refresh
  cookie will be rejected and students will be asked to sign in on every page
  load.
- The API must be served over **HTTPS**. Render does this by default.
- Leave `COOKIE_DOMAIN` unset unless the API and the web app share a parent
  domain (`api.propella.app` and `app.propella.app`). If they do, set it to
  `.propella.app` and the cookie becomes same-site, which is more robust.

---

## Gotcha: a stale `DATABASE_URL` in your shell

This machine has a `DATABASE_URL` set in the **Windows user environment** that
differs from `apps/api/.env`. In development the loader prefers `.env` and warns
about it; with `NODE_ENV=production` the OS variable wins and the API silently
connects to the wrong database — the first symptom is
`relation "public.users" does not exist`.

Clear it once:

```powershell
[Environment]::SetEnvironmentVariable('DATABASE_URL', $null, 'User')
```

Then restart your terminal. This does not affect Render or Vercel, which have
their own environment — it only bites local production-mode testing.

---

## Custom domains

If you point both apps at subdomains of one domain:

1. Vercel: add `app.propella.app` to the web project, `admin.propella.app` to
   the admin project.
2. Render: add `api.propella.app` to the API service.
3. Render env: set `FRONTEND_URL=https://app.propella.app`,
   `ADMIN_URL=https://admin.propella.app`, and `COOKIE_DOMAIN=.propella.app`.
4. Vercel env: `NEXT_PUBLIC_API_URL=https://api.propella.app`.

---

## Commands you will actually use

From your machine, against the repo:

```bash
# Generate the web-push key pair (once per environment)
pnpm --filter @propella/api push:keys

# Apply pending migrations to a remote database
DATABASE_URL="…" DIRECT_URL="…" pnpm --filter @propella/api db:deploy

# Seed subjects + super admin
pnpm --filter @propella/api seed

# Grant admin access to an existing account
pnpm --filter @propella/api admin:grant someone@example.com
pnpm --filter @propella/api admin:list

# Verify a deployment end to end (signup → study → quiz → admin).
# The base URL is an argument; with none it targets localhost:5000.
node apps/api/scripts/smoke.cjs https://your-api.onrender.com
node apps/api/scripts/smoke-admin.cjs https://your-api.onrender.com
```

> The smoke tests create a real account on whatever they point at, so run them
> against a staging deployment rather than production, or delete the account
> afterwards.

Building locally, the way CI does:

```bash
pnpm install --frozen-lockfile
pnpm --recursive type-check
pnpm --recursive lint
pnpm build
```

> On a machine with limited RAM the Next build can be killed mid-way. If you see
> exit code `3221226505` (Windows) or a bare `Killed` (Linux), raise the heap:
> `NODE_OPTIONS=--max-old-space-size=8192 pnpm build`.

---

## Post-deploy checklist

1. `GET https://your-api.onrender.com/health` returns 200.
2. Sign up in the web app; the verification code arrives (or, with no
   `RESEND_API_KEY`, appears in the Render logs).
3. **Refresh the page while signed in** — you should stay signed in. If you are
   bounced to the login screen, `NODE_ENV` is not `production` or
   `FRONTEND_URL` does not match the browser's origin exactly.
4. Sign in to the admin console with `SUPER_ADMIN_EMAIL`. **Change that
   password.**
5. Settings → Notifications → *Turn on* → *Send a test*. A push should arrive.
6. Send a test announcement from the admin console and confirm it appears in a
   student's notifications.
