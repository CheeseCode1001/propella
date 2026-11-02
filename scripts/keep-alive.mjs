#!/usr/bin/env node

/**
 * Propella 24/7 Keep-Alive & Supabase Database Heartbeat
 *
 * Why this is needed:
 * 1. Cloud PaaS (Render / Railway / Fly / etc.): Free instances spin down after 15m of inactivity.
 *    Pinging every 10-14 minutes keeps the backend alive with ZERO cold-start wait times.
 * 2. Supabase PostgreSQL: Free-tier projects auto-pause after 7 days of inactivity (0 SQL queries).
 *    Our /health endpoint actively runs `SELECT 1` on Postgres, resetting Supabase's 7-day pause timer!
 *
 * Usage:
 *   - One-shot heartbeat:
 *       node scripts/keep-alive.mjs
 *       node scripts/keep-alive.mjs --url https://propella-uo1q.onrender.com
 *   - Continuous daemon (every 10-14 minutes):
 *       node scripts/keep-alive.mjs --daemon
 *       node scripts/keep-alive.mjs --daemon --interval 12
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

// Auto-load environment variables from apps/api/.env
function loadEnvFile() {
  const envPath = path.resolve(__dirname, '../apps/api/.env')
  if (fs.existsSync(envPath)) {
    try {
      const content = fs.readFileSync(envPath, 'utf8')
      for (const line of content.split('\n')) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const idx = trimmed.indexOf('=')
          const key = trimmed.slice(0, idx).trim()
          const val = trimmed.slice(idx + 1).trim()
          // If shell has stale old tenant, prioritize apps/api/.env
          if (!process.env[key] || process.env[key].includes('ztainilhlyevffbakfex')) {
            process.env[key] = val
          }
        }
      }
    } catch {}
  }
}
loadEnvFile()

// Dynamically resolve 'pg' client
let PgClient = null
try {
  PgClient = require('../apps/api/node_modules/pg').Client
} catch {
  try {
    PgClient = require('pg').Client
  } catch {}
}

const DEFAULT_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://propella-uo1q.onrender.com'
const DEFAULT_INTERVAL_MINUTES = 12

// Parse CLI flags
const args = process.argv.slice(2)
const isDaemon = args.includes('--daemon') || args.includes('-d')

function getArgValue(flag) {
  const index = args.indexOf(flag)
  return index !== -1 && args[index + 1] ? args[index + 1] : null
}

const customUrl = getArgValue('--url') || getArgValue('-u')
const customInterval = getArgValue('--interval') || getArgValue('-i')
const intervalMinutes = customInterval ? Math.max(1, parseInt(customInterval, 10)) : DEFAULT_INTERVAL_MINUTES

async function pingEndpoint(baseUrl) {
  const cleanUrl = baseUrl.replace(/\/+$/, '')
  const targetUrl = cleanUrl.endsWith('/api') ? `${cleanUrl}/health` : `${cleanUrl}/health`
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 45_000) // 45s timeout for Render cold boot

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Propella-KeepAlive-Heartbeat/1.0 (+https://propellastudy.com)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const latencyMs = Date.now() - startTime

    let json = null
    try {
      json = await res.json()
    } catch {
      // response body might not be json
    }

    return {
      url: targetUrl,
      status: res.status,
      latencyMs,
      dbStatus: json?.db || (res.ok ? 'connected' : 'unknown'),
      data: json,
    }
  } catch (err) {
    return {
      url: targetUrl,
      status: 'CONNECTION_ERROR',
      latencyMs: Date.now() - startTime,
      error: err.name === 'AbortError' ? 'Timeout waiting for response (backend may be cold-booting)' : err.message,
    }
  }
}

async function pingPostgresDirect(connectionString) {
  if (!PgClient) {
    return {
      success: false,
      latencyMs: 0,
      error: "PostgreSQL driver 'pg' not found. Will rely on HTTP /health endpoint.",
    }
  }

  const startTime = Date.now()
  const client = new PgClient({
    connectionString,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 15000,
  })

  try {
    await client.connect()
    const res = await client.query('SELECT NOW() as current_time, 1 as alive;')
    await client.end()

    return {
      success: true,
      latencyMs: Date.now() - startTime,
      time: res.rows[0]?.current_time,
    }
  } catch (err) {
    try {
      await client.end()
    } catch {}
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: err.message,
    }
  }
}

async function performKeepAlive() {
  const timestamp = new Date().toISOString()
  console.log(`\n=============================================================`)
  console.log(`[${timestamp}] 🚀 Propella Keep-Alive & Database Heartbeat`)
  console.log(`=============================================================`)

  let anySuccess = false

  // 1. Direct Supabase Database Ping
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    console.log(`🐘 Supabase Database: Executing direct SQL query (SELECT 1)...`)
    const dbResult = await pingPostgresDirect(dbUrl)
    if (dbResult.success) {
      anySuccess = true
      console.log(`✅ [Supabase PostgreSQL 200] Heartbeat executed in ${dbResult.latencyMs}ms!`)
      console.log(`   Database Timestamp : ${dbResult.time}`)
      console.log(`   Status             : ACTIVE (Supabase 7-day inactivity pause counter refreshed)`)
    } else {
      console.warn(`⚠️  [Supabase Warning] ${dbResult.error}`)
    }
  }

  // 2. HTTP Backend Ping (Render / Cloud PaaS)
  const targets = customUrl ? [customUrl] : [DEFAULT_API_URL]
  if (process.env.BACKUP_API_URL && !customUrl) {
    targets.push(process.env.BACKUP_API_URL)
  }

  for (const url of targets) {
    console.log(`\n📡 Backend API: Pinging ${url}/health ...`)
    const result = await pingEndpoint(url)

    if (result.status === 200) {
      anySuccess = true
      console.log(`✅ [HTTP 200 OK] Backend is warm and active!`)
      console.log(`   Latency          : ${result.latencyMs}ms`)
      console.log(`   Database Status  : ${result.dbStatus === 'connected' ? 'CONNECTED' : result.dbStatus}`)
      if (result.data) {
        console.log(`   Health Payload   :`, JSON.stringify(result.data))
      }
    } else {
      console.warn(`⚠️ [${result.status}] Warning from ${result.url}:`)
      if (result.error) console.warn(`   Detail: ${result.error}`)
      if (result.data) console.warn(`   Body:`, JSON.stringify(result.data))
    }
  }

  console.log(`=============================================================\n`)
  return anySuccess
}

async function start() {
  if (isDaemon) {
    console.log(`🤖 Starting Propella Keep-Alive Daemon`)
    console.log(`⏱️  Frequency: Every ${intervalMinutes} minutes`)
    console.log(`📍 Target   : ${customUrl || DEFAULT_API_URL}`)
    console.log(`Press Ctrl+C to terminate the daemon process.\n`)

    await performKeepAlive()
    setInterval(async () => {
      try {
        await performKeepAlive()
      } catch (e) {
        console.error('Heartbeat cycle error:', e)
      }
    }, intervalMinutes * 60 * 1000)
  } else {
    await performKeepAlive()
    // Let Node naturally exit once all sockets close cleanly
  }
}

start().catch((err) => {
  console.error('Fatal error in keep-alive runner:', err)
  process.exit(1)
})
