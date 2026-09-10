#!/usr/bin/env node
/**
 * Sets the password for an existing account, straight in the database.
 *
 * Exists because the ordinary reset flow needs email delivery, and a fresh
 * deployment often has no mail provider configured yet. It is also the only
 * practical way to change the seeded super admin's password on a host with no
 * shell access (Render's free plan, for one).
 *
 * Run it from a machine that has the database credentials.
 *
 * Usage:
 *   node scripts/set-password.cjs someone@example.com 'new-password'
 *   node scripts/set-password.cjs someone@example.com          # prompts
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), quiet: true })

const { Client } = require('pg')
const bcrypt = require('bcryptjs')
const readline = require('readline')

// Matches BCRYPT_ROUNDS in src/features/auth/auth.service.ts.
const BCRYPT_ROUNDS = 12
const MIN_LENGTH = 8

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const email = args[0]
const passwordArg = args[1]

const url = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!url) {
  console.error('DATABASE_URL is not set in apps/api/.env')
  process.exit(1)
}

if (!email) {
  console.error("Usage: node scripts/set-password.cjs someone@example.com 'new-password'")
  process.exit(1)
}

/** Reads a password without echoing it, so it stays out of the terminal. */
function prompt(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    const onData = (char) => {
      // Stop muting once the line is submitted.
      if (['\n', '\r', ''].includes(char.toString('utf8'))) {
        process.stdin.removeListener('data', onData)
        return
      }
      readline.moveCursor(process.stdout, -1000, 0)
      readline.clearLine(process.stdout, 1)
      process.stdout.write(question)
    }
    process.stdin.on('data', onData)
    rl.question(question, (answer) => {
      process.stdout.write('\n')
      rl.close()
      resolve(answer)
    })
  })
}

async function main() {
  const password = passwordArg || (await prompt('New password: '))

  if (!password || password.length < MIN_LENGTH) {
    console.error(`Password must be at least ${MIN_LENGTH} characters.`)
    process.exit(1)
  }

  const client = new Client({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 30000,
  })
  await client.connect()

  try {
    const normalized = email.toLowerCase().trim()
    const found = await client.query('SELECT id, name, role FROM users WHERE email = $1', [
      normalized,
    ])

    if (found.rowCount === 0) {
      console.error(`No account with email ${normalized}`)
      process.exitCode = 1
      return
    }

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS)

    // Clearing any outstanding reset token stops an old emailed link from
    // undoing the change.
    await client.query(
      `UPDATE users
         SET "passwordHash" = $1,
             "resetPasswordToken" = NULL,
             "resetPasswordExpires" = NULL,
             "updatedAt" = now()
       WHERE email = $2`,
      [hash, normalized],
    )

    const user = found.rows[0]
    console.log(`Password updated for ${normalized} (${user.name}, ${user.role}).`)
    console.log('Existing sessions stay valid until their tokens expire.')
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
