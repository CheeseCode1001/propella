#!/usr/bin/env node
/**
 * End-to-end smoke test for the admin surface: role gating, metrics, the
 * past-question CSV importer (including de-duplication and row rejection),
 * listing/filtering and deletion.
 *
 * Usage: node scripts/smoke-admin.cjs [baseUrl]
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), quiet: true })

const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { Client } = require('pg')

const BASE = process.argv[2] || `http://localhost:${process.env.PORT || 5000}`
const ADMIN_PASSWORD = 'AdminSmoke123!'
// Self-contained: the run creates its own throwaway admin and deletes it after.
const stamp = Date.now()
const adminEmail = `adminsmoke_${stamp}@propella.test`
const studentEmail = `studentsmoke_${stamp}@propella.test`

let passed = 0
let failed = 0
let adminToken = null
let studentToken = null

function check(name, ok, detail) {
  if (ok) {
    passed += 1
    console.log('  PASS  ' + name)
  } else {
    failed += 1
    console.log('  FAIL  ' + name + (detail ? ' -> ' + detail : ''))
  }
}

async function call(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = 'Bearer ' + token
  const res = await fetch(BASE + path, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  let json = null
  try {
    json = await res.json()
  } catch {
    /* no body */
  }
  return { status: res.status, json }
}

// Two valid rows, one with a bad answer, one with a missing option.
const CSV = [
  'exam,year,subject,topic,question,a,b,c,d,answer,explanation,source',
  'jamb,2019,physics,motion,"A body starts from rest and accelerates at 2 m/s2. Velocity after 5 s?","5 m/s","10 m/s","15 m/s","20 m/s",B,"v = u + at","JAMB 2019"',
  'waec,2021,chemistry,mole-concept,"How many moles in 44 g of CO2?","0.5","1.0","1.5","2.0",B,"n = m/M","WAEC 2021"',
  'jamb,2020,biology,cell,"Which organelle makes ATP?","Nucleus","Mitochondrion","Ribosome","Golgi",Z,"bad answer",""',
  'jamb,2020,biology,cell,"Missing an option here","Only one",,,,A,"",""',
].join('\n')

async function main() {
  console.log('Admin smoke test against ' + BASE + '\n')

  // ── Sign in ────────────────────────────────────────────────────────
  // Seeded directly rather than via /auth/signup: that route is rate limited to
  // 3 accounts per hour per IP (correctly), which would make this suite
  // order-dependent. Admin role is granted the same way make-admin.cjs does it.
  const bootstrap = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await bootstrap.connect()

  const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 10)
  async function seedUser(email, role) {
    await bootstrap.query(
      `INSERT INTO users (id, email, "passwordHash", name, role, "emailVerifiedAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5::"UserRole", now(), now())`,
      [crypto.randomUUID(), email, passwordHash, 'Smoke ' + role, role],
    )
  }
  await seedUser(adminEmail, 'admin')
  await seedUser(studentEmail, 'student')
  await bootstrap.end()

  check('test accounts seeded', true)

  const login = await call('POST', '/api/auth/login', {
    email: adminEmail,
    password: ADMIN_PASSWORD,
  })
  check('admin can sign in', login.status === 200 && !!login.json?.data?.accessToken,
    'status=' + login.status)
  adminToken = login.json?.data?.accessToken ?? null

  // ── Role gating ────────────────────────────────────────────────────
  const anon = await call('GET', '/api/admin/metrics')
  check('admin API rejects anonymous callers (401)', anon.status === 401)

  const studentLogin = await call('POST', '/api/auth/login', {
    email: studentEmail,
    password: ADMIN_PASSWORD,
  })
  studentToken = studentLogin.json?.data?.accessToken ?? null
  check('non-admin can sign in', !!studentToken, 'status=' + studentLogin.status)

  const asStudent = await call('GET', '/api/admin/metrics', undefined, studentToken)
  check('admin API rejects a normal student (403)', asStudent.status === 403,
    'status=' + asStudent.status)

  // ── Metrics ────────────────────────────────────────────────────────
  const metrics = await call('GET', '/api/admin/metrics', undefined, adminToken)
  check('GET /api/admin/metrics returns figures',
    metrics.status === 200 && typeof metrics.json?.data?.users?.total === 'number',
    'status=' + metrics.status)
  check('metrics count the seeded subjects', (metrics.json?.data?.content?.subjects ?? 0) > 0)

  const before = metrics.json?.data?.content?.pastQuestions ?? 0

  // ── Import ─────────────────────────────────────────────────────────
  const imp = await call('POST', '/api/admin/past-questions/import', {
    filename: 'smoke.csv',
    format: 'csv',
    content: CSV,
  }, adminToken)
  const s = imp.json?.data
  check('CSV import succeeds', imp.status === 200 && !!s, 'status=' + imp.status)
  check('import reads every data row', s?.total === 4, 'total=' + s?.total)
  check('import accepts the 2 valid rows', s?.imported === 2, 'imported=' + s?.imported)
  check('import rejects the 2 malformed rows', s?.failed === 2, 'failed=' + s?.failed)
  check('rejection explains why',
    Array.isArray(s?.errors) && /answer must be/i.test(s.errors[0]?.reason ?? ''),
    JSON.stringify(s?.errors?.[0] ?? {}))

  // ── Idempotency ────────────────────────────────────────────────────
  const again = await call('POST', '/api/admin/past-questions/import', {
    filename: 'smoke.csv',
    format: 'csv',
    content: CSV,
  }, adminToken)
  check('re-uploading the same file imports nothing new',
    again.json?.data?.imported === 0 && again.json?.data?.skipped === 2,
    'imported=' + again.json?.data?.imported + ' skipped=' + again.json?.data?.skipped)

  // ── JSON format ────────────────────────────────────────────────────
  const jsonImport = await call('POST', '/api/admin/past-questions/import', {
    filename: 'smoke.json',
    format: 'json',
    content: JSON.stringify([
      {
        exam: 'neco',
        year: 2022,
        subject: 'mathematics',
        stem: 'What is 7 x 8?',
        options: [
          { id: 'A', text: '54' },
          { id: 'B', text: '56' },
          { id: 'C', text: '58' },
          { id: 'D', text: '62' },
        ],
        answer: 'B',
      },
    ]),
  }, adminToken)
  check('JSON import works too', jsonImport.json?.data?.imported === 1,
    'imported=' + jsonImport.json?.data?.imported)

  // ── Listing + filters ──────────────────────────────────────────────
  const list = await call('GET', '/api/admin/past-questions?limit=50', undefined, adminToken)
  check('GET /api/admin/past-questions lists the bank',
    list.status === 200 && (list.json?.data?.questions?.length ?? 0) >= 3,
    'count=' + (list.json?.data?.questions?.length ?? 0))

  const filtered = await call('GET', '/api/admin/past-questions?exam=waec', undefined, adminToken)
  const allWaec = (filtered.json?.data?.questions ?? []).every((q) => q.exam === 'waec')
  check('exam filter works', filtered.status === 200 && allWaec)

  const facets = await call('GET', '/api/admin/past-questions/facets', undefined, adminToken)
  check('facets expose subjects and years',
    facets.status === 200 &&
      Array.isArray(facets.json?.data?.subjects) &&
      Array.isArray(facets.json?.data?.years))

  const after = await call('GET', '/api/admin/metrics', undefined, adminToken)
  check('metrics reflect the new questions',
    (after.json?.data?.content?.pastQuestions ?? 0) === before + 3,
    'before=' + before + ' after=' + (after.json?.data?.content?.pastQuestions ?? 0))

  // ── Import history ─────────────────────────────────────────────────
  const batches = await call('GET', '/api/admin/imports', undefined, adminToken)
  check('import history records the uploads',
    batches.status === 200 && (batches.json?.data?.batches?.length ?? 0) >= 3)

  // ── Users + role management ────────────────────────────────────────
  const users = await call('GET', '/api/admin/users?limit=5', undefined, adminToken)
  check('GET /api/admin/users lists accounts',
    users.status === 200 && (users.json?.data?.users?.length ?? 0) > 0)

  const me = (users.json?.data?.users ?? []).find((u) => u.email === adminEmail)
  const selfDemote = await call('PATCH', `/api/admin/users/${me?.id}/role`,
    { role: 'student' }, adminToken)
  check('an admin cannot demote themselves', selfDemote.status === 400,
    'status=' + selfDemote.status)

  // ── Deletion ───────────────────────────────────────────────────────
  const toDelete = list.json?.data?.questions?.[0]
  const del = await call('DELETE', `/api/admin/past-questions/${toDelete?.id}`,
    undefined, adminToken)
  check('a question can be deleted', del.status === 200, 'status=' + del.status)

  // ── Cleanup ────────────────────────────────────────────────────────
  const db = new Client({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  await db.connect()
  await db.query(
    'DELETE FROM past_questions WHERE "subjectSlug" = ANY($1::text[])',
    [['physics', 'chemistry', 'biology', 'mathematics']],
  )
  await db.query('DELETE FROM import_batches WHERE filename IN ($1, $2)', ['smoke.csv', 'smoke.json'])
  await db.query('DELETE FROM users WHERE email = ANY($1::text[])', [[studentEmail, adminEmail]])
  const remaining = await db.query('SELECT count(*)::int n FROM past_questions')
  check('test questions cleaned up', remaining.rows[0].n === 0,
    'remaining=' + remaining.rows[0].n)
  await db.end()

  console.log('\n' + passed + ' passed, ' + failed + ' failed')
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('\nAdmin smoke run crashed:', err.message)
  process.exit(1)
})
