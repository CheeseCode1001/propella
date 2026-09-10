#!/usr/bin/env node
/**
 * Applies a Prisma migration through the `pg` driver instead of Prisma's Rust
 * schema engine, and records it in `_prisma_migrations` so the normal Prisma
 * tooling treats it as applied.
 *
 * Why this exists: on some Windows setups the bundled schema-engine binary
 * cannot open outbound connections (firewall / AV), reporting P1001, while the
 * Node driver connects to the very same database without trouble. Generating
 * the SQL offline with `prisma migrate diff` and applying it here sidesteps
 * that entirely.
 *
 * Usage: node scripts/apply-migration.cjs <path-to-migration.sql> <migration_name>
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), quiet: true })

const fs = require('fs')
const crypto = require('crypto')
const { Client } = require('pg')

const [, , sqlPath, migrationName] = process.argv

if (!sqlPath || !migrationName) {
  console.error('Usage: node scripts/apply-migration.cjs <migration.sql> <migration_name>')
  process.exit(1)
}

const url = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!url) {
  console.error('DIRECT_URL / DATABASE_URL not set in apps/api/.env')
  process.exit(1)
}

const sql = fs.readFileSync(sqlPath, 'utf8')
const checksum = crypto.createHash('sha256').update(sql).digest('hex')

const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
  id                  VARCHAR(36) PRIMARY KEY NOT NULL,
  checksum            VARCHAR(64) NOT NULL,
  finished_at         TIMESTAMPTZ,
  migration_name      VARCHAR(255) NOT NULL,
  logs                TEXT,
  rolled_back_at      TIMESTAMPTZ,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  applied_steps_count INTEGER NOT NULL DEFAULT 0
);`

async function main() {
  // Supabase's pooler presents a cert that does not chain to a public root, so
  // verification is disabled here the same way sslmode=require behaves.
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  })

  await client.connect()

  try {
    await client.query(MIGRATIONS_TABLE)

    const existing = await client.query(
      'SELECT migration_name FROM "_prisma_migrations" WHERE migration_name = $1 AND rolled_back_at IS NULL',
      [migrationName],
    )
    if (existing.rowCount > 0) {
      console.log(`Migration "${migrationName}" is already applied — nothing to do.`)
      return
    }

    // All or nothing: a half-applied schema is far worse than a clean failure.
    await client.query('BEGIN')
    await client.query(sql)
    await client.query(
      `INSERT INTO "_prisma_migrations"
         (id, checksum, migration_name, started_at, finished_at, applied_steps_count)
       VALUES ($1, $2, $3, now(), now(), 1)`,
      [crypto.randomUUID(), checksum, migrationName],
    )
    await client.query('COMMIT')

    const tables = await client.query(
      "SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public' AND table_name <> '_prisma_migrations'",
    )
    console.log(`Applied "${migrationName}". Tables now in public: ${tables.rows[0].n}`)
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw err
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message)
  process.exit(1)
})
