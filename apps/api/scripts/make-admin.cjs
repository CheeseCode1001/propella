#!/usr/bin/env node
/**
 * Grants (or revokes) admin access for an existing account.
 *
 * There is deliberately no self-service route to become an admin — the first
 * one has to be created from a machine that already has database credentials.
 *
 * Usage:
 *   node scripts/make-admin.cjs someone@example.com
 *   node scripts/make-admin.cjs someone@example.com --revoke
 *   node scripts/make-admin.cjs --list
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), quiet: true })

const { Client } = require('pg')

const args = process.argv.slice(2)
const revoke = args.includes('--revoke')
const list = args.includes('--list')
const email = args.find((a) => !a.startsWith('--'))

const url = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set in apps/api/.env')
  process.exit(1)
}

async function main() {
  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  })
  await client.connect()

  try {
    if (list) {
      const res = await client.query(
        `SELECT email, name, role, "createdAt" FROM users WHERE role = 'admin' ORDER BY "createdAt"`,
      )
      if (res.rowCount === 0) {
        console.log('No administrators yet. Create one with:')
        console.log('  node scripts/make-admin.cjs you@example.com')
        return
      }
      console.log(`${res.rowCount} administrator(s):`)
      for (const r of res.rows) console.log(`  ${r.email}  (${r.name})`)
      return
    }

    if (!email) {
      console.error('Usage: node scripts/make-admin.cjs <email> [--revoke] | --list')
      process.exit(1)
    }

    const role = revoke ? 'student' : 'admin'
    const res = await client.query(
      'UPDATE users SET role = $1 WHERE lower(email) = lower($2) RETURNING email, name, role',
      [role, email],
    )

    if (res.rowCount === 0) {
      console.error(`No account found for "${email}".`)
      console.error('Sign up in the web app first, then run this again.')
      process.exit(1)
    }

    const u = res.rows[0]
    console.log(`${u.email} (${u.name}) is now: ${u.role}`)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('Failed:', err.message)
  process.exit(1)
})
