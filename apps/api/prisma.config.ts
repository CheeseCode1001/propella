import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import { defineConfig } from 'prisma/config'

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
 * The running app does NOT use this url. It connects through @prisma/adapter-pg
 * with DATABASE_URL — see src/config/db.ts.
 */
const migrationUrl = process.env['DIRECT_URL']?.trim() || process.env['DATABASE_URL']?.trim()

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
