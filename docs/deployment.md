# Production deployment

Three pieces:

| Piece | Host | What it is |
|---|---|---|
| `apps/api` | **Render** | Express API, the only thing that talks to the database |
| `apps/web` | **Vercel** | Student app (Next.js) |
| `apps/admin` | **Vercel** | Admin console (Next.js) |
| Database | **Supabase** | Postgres — already provisioned |

Deploy in that order — but note the loop: the front-ends need the API's URL,
and the API needs theirs. You cannot know both up front, so:

1. Deploy the **API** first. `FRONTEND_URL` and `ADMIN_URL` can be left unset —
   the service starts anyway and logs a warning. CORS blocks every browser
   origin until they are set, which fails closed rather than open.
2. Deploy **web** and **admin**, pointing `NEXT_PUBLIC_API_URL` at the Render URL.
3. Go back to Render, set `FRONTEND_URL` and `ADMIN_URL` to the Vercel origins,
   and redeploy. **Nothing works in a browser until you do this step.**

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

**Build command** — paste this as a **single line**. Render's build field runs
one command, so newlines are not separators; without `&&` it becomes
`corepack enable pnpm install …` and fails immediately:

```bash
corepack enable && pnpm install --frozen-lockfile && pnpm --filter @propella/shared build && pnpm --filter @propella/api exec prisma migrate deploy && pnpm --filter @propella/api build
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
| `FRONTEND_URL` | ⚠️ | `https://your-web.vercel.app` — exact origin, **no trailing slash**. Can be set after the first deploy |
| `ADMIN_URL` | ⚠️ | `https://your-admin.vercel.app`. Same |
| `CORS_EXTRA_ORIGINS` | — | Comma-separated extras (custom domain, second preview) |
| `GEMINI_API_KEY` | ✅ | From [AI Studio](https://aistudio.google.com/apikey) |
| `GEMINI_QUIZ_MODEL` | — | `gemini-flash-latest` |
| `GEMINI_CHAT_MODEL` | — | `gemini-flash-latest` |
| `RESEND_API_KEY` | — | Blank disables email; sign-up still works |
| `EMAIL_FROM` | — | Must be on a **domain you verified with Resend** — see below |
| `EMAIL_REPLY_TO` | — | Where replies go. An ordinary Gmail address is fine here |
| `VAPID_PUBLIC_KEY` | — | From `pnpm --filter @propella/api push:keys` |
| `VAPID_PRIVATE_KEY` | — | Same command. **Secret** — never ship to the browser |
| `VAPID_SUBJECT` | — | `mailto:` any address you read — Gmail is fine. Defaults if blank |
| `SUPER_ADMIN_EMAIL` | ⚠️ | The first admin account. Deferrable — see below |
| `SUPER_ADMIN_PASSWORD` | ⚠️ | A real password. Both must be set together |
| `COOKIE_DOMAIN` | — | Only if API and web share a parent domain (see below) |

### Seeding

Seeding writes to the **database**, not to the server — so run it from your own
machine. You do not need Render's shell, which the free plan does not provide
anyway.

Your `apps/api/.env` already points at the production Supabase database, so:

```bash
pnpm --filter @propella/api seed
```

That loads the subject syllabus and, in development, creates a super admin with
default credentials. It is idempotent — safe to re-run, and re-running after
editing `src/seeds/subjects.ts` updates the syllabus in place.

**Because dev and production share one database, that seed has already run.**
The syllabus is loaded and `admin@propella.local` exists.

#### Optional: seed automatically on deploy

If you would rather not run it by hand, append it to Render's build command.
It is idempotent, so running on every deploy is harmless:

```bash
pnpm --filter @propella/api seed
```

The super-admin part still skips in production unless `SUPER_ADMIN_EMAIL` and
`SUPER_ADMIN_PASSWORD` are both set.

### ⚠️ Change the seeded admin password before launch

The existing `admin@propella.local` account was created with the development
default. **That is now a production credential on a publicly reachable API.**

The normal reset flow needs email, which a fresh deployment usually lacks, so
there is a script for exactly this:

```bash
pnpm --filter @propella/api admin:password admin@propella.local 'a-real-password'

# Or omit the password and it prompts without echoing:
pnpm --filter @propella/api admin:password admin@propella.local
```

Better still, use your own email address as the admin rather than the
placeholder:

```bash
# Sign up through the student app first, then:
pnpm --filter @propella/api admin:grant you@example.com
pnpm --filter @propella/api admin:list
```

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

## Running on Render's free plan

It works, with three real limitations. None of them need a code change, but you
should know about them before students use it.

### No shell

Free services have no **Shell** tab. Everything you might have wanted a shell
for is a database operation, so run it from your machine instead — the Supabase
database is reachable from anywhere:

```bash
pnpm --filter @propella/api seed              # syllabus + super admin
pnpm --filter @propella/api db:deploy         # apply migrations
pnpm --filter @propella/api admin:grant  you@example.com
pnpm --filter @propella/api admin:list
pnpm --filter @propella/api admin:password you@example.com
```

The only thing that genuinely needs the server is reading logs, and those are
in the Render dashboard.

### It sleeps after 15 minutes

An idle free service spins down, and the next request waits **around 50 seconds**
for it to wake. In practice:

- The first student to arrive after a quiet spell sees a very slow page.
- **Scheduled work does not run while asleep.** Study reminders, streak warnings
  and the weekly digest fire from an in-process scheduler, so they are delayed
  until something wakes the service — or missed entirely.
- A long AI answer can be cut off if the service sleeps mid-stream.

Pinging the service to keep it awake is against Render's terms and burns the
750 free hours anyway. If reminders matter, that is the reason to upgrade.

### 750 instance-hours a month

One always-on service uses about 730, so a single free service fits — but two do
not. Keep the API as your only Render service; both front-ends are on Vercel,
which does not count against this.

### What still works fine on free

Sign-up, study, quizzes, mocks, the syllabus reader, notes, the planner,
achievements, push notifications and admin broadcasts all work normally. It is a
perfectly reasonable way to demo the app or run a small pilot — just not to
launch reminders on.

---

## What you can leave until later

Only these actually block a first deploy:

`NODE_ENV` · `DATABASE_URL` · `DIRECT_URL` · `JWT_ACCESS_SECRET` ·
`JWT_REFRESH_SECRET` · `FRONTEND_URL` · `ADMIN_URL` · `GEMINI_API_KEY`

Everything else can be added afterwards with a redeploy. Specifically:

### `EMAIL_REPLY_TO` — leave it out entirely

No consequence at all. The reply-to header is simply omitted, and replies go to
whatever `EMAIL_FROM` is. Add it whenever you like.

### `VAPID_SUBJECT` — safe to skip

Falls back to `mailto:support@propella.app`. Push services do not verify that
you own the address, so push still works; it is only the contact point if a
push service needs to reach the operator. Blank and whitespace are both treated
as "use the default", so an empty variable in the Render dashboard is harmless.

Worth setting to an address you actually read before you have many users.

### `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD` — deferrable, with a caveat

The API boots fine without them. The seed logs
`Skipping super-admin seed: …` and moves on — **so there will be no admin
account, and no way into the admin console.**

Set them together whenever you are ready, then re-run the seed:

```bash
pnpm --filter @propella/api seed
```

If you would rather not put a password in the environment at all, sign up
through the student app as normal and promote that account instead:

```bash
pnpm --filter @propella/api admin:grant you@example.com
pnpm --filter @propella/api admin:list
```

Either route works, and both are idempotent. Note that setting
`SUPER_ADMIN_EMAIL` to an address that already has an account **promotes** it
rather than creating a second one, and never overwrites its password.

---

## Email: what a Gmail address can and cannot be

Two different addresses, two different rules.

### `EMAIL_FROM` — **a Gmail address will not work**

Resend will only send `from` an address on a domain you have **verified with
Resend**, which means adding SPF/DKIM records to that domain's DNS. You cannot
add DNS records to `gmail.com`, so `you@gmail.com` is rejected. This is not a
Resend quirk — every reputable sender works this way, because otherwise anyone
could send mail claiming to be you.

Your options:

| Option | What happens | Good for |
|---|---|---|
| **Leave `EMAIL_FROM` blank** | Falls back to Resend's sandbox sender, `onboarding@resend.dev`. Works instantly with no domain — but **only delivers to the address that owns your Resend account** | Testing |
| **Verify a domain** | Buy a domain (~$10/year), add it in Resend → Domains, paste the DNS records it gives you, then set `EMAIL_FROM="Propella <noreply@yourdomain.com>"` | Production |

Until you verify a domain, real students will not receive verification codes.
Sign-up still works — the code is written to the Render logs — but you cannot
launch on that.

### `EMAIL_REPLY_TO` — **a Gmail address is fine**

Reply-to is not authenticated, so it can be any mailbox. Set it to your Gmail
and replies to Propella's emails land in your normal inbox:

```
EMAIL_REPLY_TO=youraddress@gmail.com
```

### `VAPID_SUBJECT` — **a Gmail address is fine**

This is only a contact URI. Push services (Google, Mozilla, Apple) use it to
reach the operator if a server starts misbehaving. **No mail is ever sent to
it**, it is never shown to students, and it needs no verification. It just has
to be a valid `mailto:` or `https:` URI:

```
VAPID_SUBJECT=mailto:youraddress@gmail.com
```

---

## Generating the VAPID keys

VAPID is a keypair that proves to a push service that a notification really came
from your server. You generate it **once per environment** and it is not issued
by anyone — there is no account to sign up for.

```bash
pnpm --filter @propella/api push:keys
```

It prints something like:

```
Add these to apps/api/.env:

VAPID_PUBLIC_KEY=BP7ahRbpUNBWNO_XRbk3LCoGTwHGhCKJwaYDYhViPJJABKIWlckml_g3gZPTblL8qqPTRQAZvnvtnZaazXRudfo
VAPID_PRIVATE_KEY=6HxSF8wXLWPshX4esrS8T27WSvBGMpOiZdOCHG5JsD8

And to apps/web/.env.local:

NEXT_PUBLIC_VAPID_PUBLIC_KEY=BP7ahRbpUNBWNO_XRbk3LCoGTwHGhCKJwaYDYhViPJJABKIWlckml_g3gZPTblL8qqPTRQAZvnvtnZaazXRudfo
```

Where each value goes:

| Value | Goes to | Notes |
|---|---|---|
| `VAPID_PUBLIC_KEY` | **Render** | Also shipped to browsers — not a secret |
| `VAPID_PRIVATE_KEY` | **Render only** | A secret. Never commit it, never put it in a `NEXT_PUBLIC_*` variable |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | **Vercel** (web project) | Must be **byte-identical** to `VAPID_PUBLIC_KEY` on Render, or subscriptions are rejected |
| `VAPID_SUBJECT` | **Render** | `mailto:` your address — Gmail is fine |

Two rules:

- **Generate a separate pair for production.** The dev pair is already in
  `apps/api/.env`; do not reuse it.
- **Never rotate the keys on a live deployment** unless you have to. Changing
  them invalidates every existing subscription, and every student has to turn
  notifications on again.

Leave all three blank and push is simply off — in-app notifications still work.

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

# Set a password directly (no email needed — use when mail is not configured,
# or to change the seeded super admin on a host with no shell)
pnpm --filter @propella/api admin:password someone@example.com

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
