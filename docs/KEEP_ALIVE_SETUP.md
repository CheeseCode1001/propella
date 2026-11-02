# Propella 24/7 Keep-Alive & Supabase Database Heartbeat Guide

This guide explains how to prevent **Supabase Database auto-pausing** and **Render / Backend PaaS sleeping** due to inactivity.

---

## 1. Why Did Your Database & Backend Go Down?

1. **Supabase PostgreSQL Free Tier**:
   - Supabase automatically **pauses** projects after **7 days of zero SQL queries**.
   - Simply visiting a frontend website does **NOT** prevent Supabase from pausing if the database is not queried.
   - Once paused, database queries fail until manually unpaused in the Supabase dashboard.

2. **Backend PaaS (Render / Railway / Fly Free Tiers)**:
   - Free instances spin down (go to sleep) after **15 minutes of zero HTTP traffic**.
   - When the next user visits after 15 minutes, they experience a **50–60 second cold-start delay** while the server boots up.

---

## 2. What We Implemented to Fix This Permanently

### Layer 1: Active SQL Heartbeat inside `/health` Endpoint
In `apps/api/src/app.ts`, the `/health` and `/api/health` endpoints were upgraded:
```ts
// Runs SELECT 1 on Postgres on every ping
await prisma.$queryRaw`SELECT 1`
```
✅ **Result**: Any HTTP ping to `/health` or `/api/health` now simultaneously:
- Wakes up the Render backend process.
- Executes a live SQL query on Supabase PostgreSQL, **resetting the 7-day inactivity timer**.

---

### Layer 2: Cloud 24/7 Automation (GitHub Actions)
A workflow has been configured at [`.github/workflows/keep-alive.yml`](file:///.github/workflows/keep-alive.yml):
- Runs automatically in the cloud on GitHub's servers **every 14 minutes** (`*/14 * * * *`).
- **Does not require your laptop to be on** — it runs 24/7/365 in GitHub Actions.
- Pings your API URL (`https://propella-uo1q.onrender.com/health`) and executes the database heartbeat.

#### How to configure GitHub Actions:
1. Push your repo to GitHub (`git push origin main`).
2. (Optional) In GitHub repo → **Settings** → **Secrets and variables** → **Actions**, you can add:
   - `API_URL`: `https://propella-uo1q.onrender.com`
   - `DATABASE_URL`: `postgresql://postgres.acihpxtqbdidzjukrelv:Propella@101@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`
3. In your GitHub repo, click the **Actions** tab → **Keep-Alive 24/7 Heartbeat** → Click **Run workflow** to test it anytime.

---

### Layer 3: Local Script & Daemon

You can also run the heartbeat locally anytime:

```bash
# Run a one-time ping (checks Supabase DB + Render API)
pnpm run keep-alive

# Or run with Node directly:
node scripts/keep-alive.mjs

# Run continuously as a background daemon (pings every 12 minutes):
pnpm run keep-alive:daemon

# Custom URL or interval:
node scripts/keep-alive.mjs --url https://propella-uo1q.onrender.com --interval 10
```

---

### Layer 4: Free External Uptime Monitor (Recommended 1-Minute Setup)

External uptime monitors are the gold standard for free web hosting because they are 100% free, take 1 minute to set up, and ping your server with second-precision reliability.

#### Option A: cron-job.org (100% Free Forever)
1. Go to [https://cron-job.org](https://cron-job.org) and create a free account.
2. Click **Create Cronjob**.
3. Set **Title**: `Propella Keep-Alive`
4. Set **URL**: `https://propella-uo1q.onrender.com/health` (or your custom API domain).
5. Set **Execution schedule**: Every **10 minutes**.
6. Click **Create**.

#### Option B: UptimeRobot (100% Free)
1. Go to [https://uptimerobot.com](https://uptimerobot.com) and create a free account.
2. Click **Add New Monitor**.
3. Select **Monitor Type**: `HTTP(s)`
4. Set **Friendly Name**: `Propella Backend & Supabase`
5. Set **URL**: `https://propella-uo1q.onrender.com/health`
6. Set **Monitoring Interval**: `5 minutes` or `10 minutes`.
7. Click **Create Monitor**.

---

## 3. Verification

To verify that the health check and database query are working:
1. Open your browser or run in terminal:
   ```bash
   curl https://propella-uo1q.onrender.com/health
   ```
2. You will receive:
   ```json
   {
     "status": "ok",
     "db": "connected",
     "latencyMs": 42,
     "timestamp": "2026-11-02T..."
   }
   ```
Supabase will record active database queries, and your backend will stay permanently warm for all users!

