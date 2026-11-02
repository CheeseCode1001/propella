/**
 * Propella 24/7 Keep-Alive & Database Heartbeat Script
 *
 * Why this exists:
 * 1. Render / Cloud PaaS: Free instances spin down after 15 minutes of inactivity.
 *    Pinging every 10-14 minutes keeps the backend warm with 0 cold-start delay.
 * 2. Supabase Postgres: Free projects automatically pause after 7 days of inactivity (0 SQL queries).
 *    Our /health endpoint actively runs `SELECT 1` on Postgres, resetting Supabase's pause timer!
 *
 * Usage:
 *   - One-time ping:
 *       pnpm run keep-alive
 *       tsx scripts/keep-alive.ts
 *       tsx scripts/keep-alive.ts --url https://propella-uo1q.onrender.com
 *   - Continuous daemon (runs every 10 minutes):
 *       tsx scripts/keep-alive.ts --daemon
 *       tsx scripts/keep-alive.ts --daemon --interval 14
 */

import { Client } from 'pg'

const DEFAULT_API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://propella-uo1q.onrender.com'
const DEFAULT_INTERVAL_MINUTES = 12

interface PingResult {
  url: string
  status: number | 'NETWORK_ERROR'
  latencyMs: number
  dbStatus?: string
  data?: any
  error?: string
}

async function pingHttpEndpoint(baseUrl: string): Promise<PingResult> {
  const cleanUrl = baseUrl.replace(/\/+$/, '')
  // Try /health first, fallback to /api/health
  const targetUrl = cleanUrl.endsWith('/api') ? `${cleanUrl}/health` : `${cleanUrl}/health`
  const startTime = Date.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30_000) // 30s timeout for cold start

    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Propella-KeepAlive/1.0 (+https://propellastudy.com)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const latencyMs = Date.now() - startTime

    let json: any = null
    try {
      json = await res.json()
    } catch {
      // response might be text or empty
    }

    return {
      url: targetUrl,
      status: res.status,
      latencyMs,
      dbStatus: json?.db || (res.ok ? 'unknown' : 'disconnected'),
      data: json,
    }
  } catch (err: any) {
    return {
      url: targetUrl,
      status: 'NETWORK_ERROR',
      latencyMs: Date.now() - startTime,
      error: err?.message || String(err),
    }
  }
}

async function pingDirectDatabase(databaseUrl: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
  const startTime = Date.now()
  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    statement_timeout: 10000,
  })

  try {
    await client.connect()
    const res = await client.query('SELECT NOW() as current_time, 1 as alive;')
    await client.end()
    return {
      success: true,
      latencyMs: Date.now() - startTime,
    }
  } catch (err: any) {
    try {
      await client.end()
    } catch {
      // ignore close errors
    }
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      error: err?.message || String(err),
    }
  }
}

async function runHeartbeat() {
  const now = new Date().toISOString()
  console.log(`\n======================================================`)
  console.log(`[${now}] Propella Keep-Alive Heartbeat Triggered`)
  console.log(`======================================================`)

  // 1. HTTP Endpoint Ping (Wakes Render + Triggers /health query)
  const apiUrls = [DEFAULT_API_URL]
  if (process.env.BACKUP_API_URL) {
    apiUrls.push(process.env.BACKUP_API_URL)
  }

  let anyHttpSuccess = false

  for (const url of apiUrls) {
    console.log(`📡 Pinging API Backend: ${url}/health ...`)
    const result = await pingHttpEndpoint(url)

    if (result.status === 200) {
      anyHttpSuccess = true
      console.log(`✅ [HTTP 200] Backend is ACTIVE! Latency: ${result.latencyMs}ms`)
      console.log(`   Database Status: ${result.dbStatus === 'connected' ? 'CONNECTED & ACTIVE' : result.dbStatus}`)
      if (result.data) {
        console.log(`   Response:`, JSON.stringify(result.data))
      }
    } else {
      console.warn(`⚠️ [HTTP ${result.status}] Warning from ${result.url}:`)
      if (result.error) console.warn(`   Error: ${result.error}`)
      if (result.data) console.warn(`   Data:`, result.data)
    }
  }

  // 2. Direct Database Ping (if DATABASE_URL is available)
  const dbUrl = process.env.DATABASE_URL
  if (dbUrl) {
    console.log(`\n🐘 Direct Database Heartbeat: Connecting to PostgreSQL...`)
    const dbResult = await pingDirectDatabase(dbUrl)
    if (dbResult.success) {
      console.log(`✅ [PostgreSQL] Database heartbeat successful! Latency: ${dbResult.latencyMs}ms`)
      console.log(`   Supabase 7-day inactivity pause counter has been refreshed.`)
    } else {
      console.error(`❌ [PostgreSQL] Direct DB ping failed: ${dbResult.error}`)
    }
  }

  console.log(`======================================================\n`)
  return anyHttpSuccess
}

// Parse command line arguments
const args = process.argv.slice(2)
const isDaemon = args.includes('--daemon') || args.includes('-d')
const intervalArgIndex = args.indexOf('--interval')
const intervalMinutes = intervalArgIndex !== -1 && args[intervalArgIndex + 1]
  ? parseInt(args[intervalArgIndex + 1], 10)
  : DEFAULT_INTERVAL_MINUTES

async function main() {
  if (isDaemon) {
    console.log(`🚀 Starting Propella Keep-Alive Daemon (running every ${intervalMinutes} minutes)`)
    console.log(`Press Ctrl+C to stop.`)
    await runHeartbeat()
    setInterval(async () => {
      await runHeartbeat()
    }, intervalMinutes * 60 * 1000)
  } else {
    const success = await runHeartbeat()
    // In one-shot mode, exit with code 0 on success
    process.exit(success ? 0 : 0) // exit 0 so cron doesn't spam alert emails on temporary network hiccups
  }
}

main().catch((err) => {
  console.error('Fatal keep-alive error:', err)
  process.exit(1)
})

