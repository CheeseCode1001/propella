#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), quiet: true })

const { Client } = require('pg')

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
    const beforeCount = await client.query('SELECT COUNT(*) FROM users')
    console.log(`Users before clearing: ${beforeCount.rows[0].count}`)

    await client.query('TRUNCATE TABLE users CASCADE;')

    const afterCount = await client.query('SELECT COUNT(*) FROM users')
    console.log(`Users after clearing: ${afterCount.rows[0].count}`)
    console.log('Successfully cleared all users from the database.')
  } catch (err) {
    console.error('Failed to clear users:', err)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
