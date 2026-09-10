#!/usr/bin/env node
/**
 * End-to-end smoke test against a running API.
 *
 * Exercises the real HTTP surface — health, subjects, signup, the OTP flow,
 * /users/me and onboarding — against the real database. Creates a throwaway
 * account each run and deletes it afterwards.
 *
 * Usage: node scripts/smoke.cjs [baseUrl]
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), quiet: true })

const crypto = require('crypto')
const { Client } = require('pg')

const BASE = process.argv[2] || `http://localhost:${process.env.PORT || 5000}`
const email = `smoke_${Date.now()}@propella.test`
const password = 'SmokeTest123!'

let passed = 0
let failed = 0
let accessToken = null

function check(name, ok, detail) {
  if (ok) {
    passed += 1
    console.log('  PASS  ' + name)
  } else {
    failed += 1
    console.log('  FAIL  ' + name + (detail ? ' -> ' + detail : ''))
  }
}

async function call(method, path, body, opts = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (accessToken && !opts.anon) headers.Authorization = 'Bearer ' + accessToken
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  let json = null
  try {
    json = await res.json()
  } catch {
    /* some endpoints return no body */
  }
  return { status: res.status, json }
}

async function main() {
  console.log('Smoke test against ' + BASE + '\n')

  // ── Public surface ─────────────────────────────────────────────────
  const health = await call('GET', '/health', undefined, { anon: true })
  check('GET /health returns ok', health.status === 200 && health.json?.status === 'ok')

  const subjects = await call('GET', '/api/subjects', undefined, { anon: true })
  const subjectList = subjects.json?.data ?? []
  check('GET /api/subjects returns the seeded syllabus',
    subjects.status === 200 && subjectList.length > 0,
    'status=' + subjects.status + ' count=' + subjectList.length)
  check('subjects carry topics',
    Array.isArray(subjectList[0]?.topics) && subjectList[0].topics.length > 0)
  check('subjects carry examTypes',
    Array.isArray(subjectList[0]?.examTypes) && subjectList[0].examTypes.length > 0)

  // ── Auth requires a token ──────────────────────────────────────────
  const unauth = await call('GET', '/api/users/me', undefined, { anon: true })
  check('GET /api/users/me is 401 without a token', unauth.status === 401)

  // ── Signup ─────────────────────────────────────────────────────────
  const signup = await call('POST', '/api/auth/signup',
    { name: 'Smoke Test', email, password }, { anon: true })
  if (signup.status === 429) {
    console.error(
      [
        '',
        '  Signup is rate limited (3 per hour per IP, by design).',
        '  The limiter is in-memory, so restarting the API resets it:',
        '    pnpm --filter @propella/api dev',
        '',
      ].join('\n'),
    )
    process.exit(1)
  }
  check('POST /api/auth/signup creates an account',
    signup.status === 201 && !!signup.json?.data?.accessToken,
    'status=' + signup.status + ' ' + JSON.stringify(signup.json?.error ?? ''))
  accessToken = signup.json?.data?.accessToken ?? null
  check('new account starts unverified', signup.json?.data?.user?.emailVerified === false)

  const dupe = await call('POST', '/api/auth/signup',
    { name: 'Smoke Test', email, password }, { anon: true })
  check('duplicate signup is rejected with 409', dupe.status === 409)

  // ── OTP ────────────────────────────────────────────────────────────
  const badCode = await call('POST', '/api/auth/verify-email', { code: '000000' })
  check('wrong OTP is rejected', badCode.status === 400)

  // Read the real code straight from the database — it is only ever stored hashed,
  // so the test brute-forces the 6 digits against the stored hash.
  const db = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await db.connect()
  const userRow = await db.query('SELECT id FROM users WHERE email = $1', [email])
  const userId = userRow.rows[0]?.id
  check('user row exists in Postgres', !!userId)

  const codeRow = await db.query(
    'SELECT "codeHash" FROM email_verifications WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
    [userId],
  )
  check('a verification code was issued on signup', codeRow.rowCount === 1)

  let realCode = null
  if (codeRow.rowCount === 1) {
    const target = codeRow.rows[0].codeHash
    for (let i = 0; i < 1_000_000; i++) {
      const candidate = String(i).padStart(6, '0')
      if (crypto.createHash('sha256').update(candidate).digest('hex') === target) {
        realCode = candidate
        break
      }
    }
  }
  check('stored code is a sha256 hash, not plaintext', realCode !== null)

  if (realCode) {
    const verify = await call('POST', '/api/auth/verify-email', { code: realCode })
    check('correct OTP verifies the account',
      verify.status === 200 && verify.json?.data?.emailVerified === true,
      'status=' + verify.status)
  }

  const resend = await call('POST', '/api/auth/resend-verification', {})
  check('resend is refused once already verified', resend.status === 400)

  // ── Authenticated surface ──────────────────────────────────────────
  const me = await call('GET', '/api/users/me')
  check('GET /api/users/me returns the profile',
    me.status === 200 && me.json?.data?.user?.email === email,
    'status=' + me.status)
  check('/me reports verified', me.json?.data?.user?.emailVerified === true)
  check('/me includes xp + streak', typeof me.json?.data?.xp?.totalXP === 'number' &&
    typeof me.json?.data?.streak?.currentStreak === 'number')

  // ── Onboarding ─────────────────────────────────────────────────────
  const step1 = await call('POST', '/api/onboarding/step/1', { examTypes: ['jamb'] })
  check('onboarding step 1 saves exam types', step1.status === 200, 'status=' + step1.status)

  const step2 = await call('POST', '/api/onboarding/step/2/jamb', {
    intendedCourse: 'Computer Science',
    institutionType: 'university',
  })
  check('onboarding step 2 saves the course', step2.status === 200, 'status=' + step2.status)

  const slugs = subjectList.slice(0, 4).map((s) => s.slug)
  const step3 = await call('POST', '/api/onboarding/step/3', { subjectSlugs: slugs })
  check('onboarding step 3 saves subjects', step3.status === 200, 'status=' + step3.status)

  const step5 = await call('POST', '/api/onboarding/step/5', {
    examDate: new Date(Date.now() + 120 * 864e5).toISOString(),
  })
  check('onboarding step 5 saves the exam date', step5.status === 200, 'status=' + step5.status)

  // Empty windows must be accepted — study times are optional now.
  const step6 = await call('POST', '/api/onboarding/step/6', {
    dailyStudyMinutes: 120,
    preferredStudyWindows: [],
  })
  check('onboarding step 6 accepts automatic study times',
    step6.status === 200, 'status=' + step6.status)

  const complete = await call('POST', '/api/onboarding/complete')
  check('onboarding completes and builds a roadmap',
    complete.status === 200 && !!complete.json?.data?.roadmap?.id,
    'status=' + complete.status)

  const roadmap = await call('GET', '/api/roadmap')
  check('GET /api/roadmap returns generated nodes',
    roadmap.status === 200 && (roadmap.json?.data?.nodes?.length ?? 0) > 0,
    'nodes=' + (roadmap.json?.data?.nodes?.length ?? 0))

  const dashboard = await call('GET', '/api/dashboard')
  check('GET /api/dashboard works after onboarding', dashboard.status === 200,
    'status=' + dashboard.status)

  const progress = await call('GET', '/api/progress')
  check('GET /api/progress returns syllabus coverage',
    progress.status === 200 && typeof progress.json?.data?.syllabusCoverage?.total === 'number',
    'status=' + progress.status)

  const leaderboard = await call('GET', '/api/leaderboard?period=all')
  check('GET /api/leaderboard works', leaderboard.status === 200, 'status=' + leaderboard.status)

  const notifications = await call('GET', '/api/notifications')
  check('GET /api/notifications works', notifications.status === 200)

  // ── Cleanup ────────────────────────────────────────────────────────
  if (userId) {
    await db.query('DELETE FROM users WHERE id = $1', [userId])
    const gone = await db.query('SELECT 1 FROM users WHERE id = $1', [userId])
    check('cascade delete removes the test account', gone.rowCount === 0)
  }
  await db.end()

  console.log('\n' + passed + ' passed, ' + failed + ' failed')
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('\nSmoke run crashed:', err.message)
  process.exit(1)
})
