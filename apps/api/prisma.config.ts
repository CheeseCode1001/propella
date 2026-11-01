import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'prisma/config'

function normalizeMigrationUrl(raw?: string): string | undefined {
  if (!raw) return undefined
  let url = raw.trim()
  if (!url) return undefined

  // Fix unencoded @ in password (e.g. postgres.ref:Propella@101@aws-1-...)
  const match = url.match(/^postgresql:\/\/([^:]+):(.*)@([^@\/]+)(.*)$/)
  if (match) {
    const [, user, pass, host, rest] = match
    const encodedPass = encodeURIComponent(decodeURIComponent(pass))
    url = `postgresql://${user}:${encodedPass}@${host}${rest}`
  }

  // Supabase pooler on port 6543 is transaction mode (PgBouncer), which does not support
  // DDL migrations or Prisma db push advisory locks. Migrate/push connects to session mode (5432).
  if (url.includes('.pooler.supabase.com:6543')) {
    url = url.replace('.pooler.supabase.com:6543', '.pooler.supabase.com:5432')
  }

  // Ensure SSL parameters are present for cloud Postgres (Supabase, Neon)
  if (!url.includes('sslmode=') && !url.includes('sslaccept=')) {
    url += (url.includes('?') ? '&' : '?') + 'sslmode=require'
  }

  return url
}

const envDirect = process.env['DIRECT_URL']?.trim()
const envDatabase = process.env['DATABASE_URL']?.trim()

// Prisma 7 no longer reads .env automatically, and connection URLs have moved
// out of schema.prisma into this file. fileURLToPath (not URL.pathname) is what
// survives a project path containing spaces.
loadEnv({ path: resolve(dirname(fileURLToPath(import.meta.url)), '.env') })

/**
 * Migrations run over a direct connection — poolers in transaction mode cannot
 * hold the advisory locks and DDL sessions Migrate needs. DIRECT_URL is optional
 * because plenty of hosts need no separate direct endpoint; when it is blank the
 * pooled URL is used instead.
 *
 * If the user explicitly provided DATABASE_URL or DIRECT_URL in their environment, respect it!
 */
const rawUrl =
  envDirect ||
  envDatabase ||
  process.env['DIRECT_URL']?.trim() ||
  process.env['DATABASE_URL']?.trim()

const migrationUrl = normalizeMigrationUrl(rawUrl)

export default defineConfig({
  schema: 'prisma/schema.prisma',

  // Omitted entirely when unset so `prisma generate` still works on a fresh
  // clone that has no .env yet. Commands that need a database report it clearly.
  ...(migrationUrl ? { datasource: { url: migrationUrl } } : {}),

  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx src/seeds/run-seed.ts',
  },
})
