#!/usr/bin/env node
/**
 * End-to-end smoke test for the past-question bank: quizzes and mocks served
 * from real past questions, shuffled, graded correctly, and fresh between
 * sittings. Needs a running API and a seeded bank (`pnpm seed:past-questions`).
 *
 * Uses economics, biology and literature, which have enough bank questions
 * that no AI top-up is needed - so the run is quick and costs nothing. Physics
 * covers the questions that carry a diagram.
 *
 * Usage: node scripts/smoke-past-questions.cjs [baseUrl]
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env'), quiet: true, override: true })

const crypto = require('crypto')
const bcrypt = require('bcryptjs')
const { Client } = require('pg')

const BASE = process.argv[2] || `http://localhost:${process.env.PORT || 5000}`
const PASSWORD = 'BankSmoke123!'
const stamp = Date.now()
const emails = {
  student: `banksmoke_${stamp}@propella.test`,
  // Generation is rate limited per user, so validation checks use a second one.
  other: `banksmoke_b_${stamp}@propella.test`,
  physics: `banksmoke_p_${stamp}@propella.test`,
  maths: `banksmoke_m_${stamp}@propella.test`,
  admin: `banksmoke_admin_${stamp}@propella.test`,
}

/** How many questions each data file holds - what the seeded bank must match. */
function fileCounts() {
  const fs = require('fs')
  const path = require('path')
  const dir = path.resolve(__dirname, '../data/past-questions')
  return Object.fromEntries(
    fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => [
      f.replace(/\.json$/, ''),
      JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).questions.length,
    ]),
  )
}

let passed = 0
let failed = 0

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

const db = new Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function seedUser(email, role) {
  const id = crypto.randomUUID()
  await db.query(
    `INSERT INTO users (id, email, "passwordHash", name, role, "emailVerifiedAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5::"UserRole", now(), now())`,
    [id, email, bcrypt.hashSync(PASSWORD, 10), 'Bank smoke', role],
  )
  const login = await call('POST', '/api/auth/login', { email, password: PASSWORD })
  return { id, token: login.json?.data?.accessToken ?? null }
}

/** Bank rows behind a list of served questions, keyed by row id. */
async function bankRows(questions) {
  const ids = questions.filter((q) => q.id.startsWith('pq_')).map((q) => q.id.slice(3))
  if (ids.length === 0) return new Map()
  const r = await db.query(
    'SELECT id, "subjectSlug", "topicSlug", options, "correctOptionId" FROM past_questions WHERE id = ANY($1)',
    [ids],
  )
  return new Map(r.rows.map((row) => [row.id, row]))
}

function answerText(options, id) {
  return (options.find((o) => o.id === id) || {}).text
}

/** Every served answer must be the bank's answer, whatever letter it now has. */
function answersIntact(questions, rows) {
  return questions.every((q) => {
    const row = rows.get(q.id.slice(3))
    return row && answerText(q.options, q.correctOptionId) === answerText(row.options, row.correctOptionId)
  })
}

async function startQuiz(quizId, token) {
  const attempt = await call('POST', `/api/quizzes/${quizId}/attempt`, undefined, token)
  const attemptId = attempt.json?.data?.attemptId
  const detail = await call('GET', `/api/quizzes/attempts/${attemptId}`, undefined, token)
  return { attemptId, quiz: detail.json?.data?.quiz }
}

async function main() {
  console.log('Past-question bank smoke test against ' + BASE + '\n')
  await db.connect()

  const users = {}
  const cleanup = []
  try {
    for (const [key, email] of Object.entries(emails)) {
      users[key] = await seedUser(email, key === 'admin' ? 'admin' : 'student')
      cleanup.push(users[key].id)
    }
    check('test accounts can sign in', Object.values(users).every((u) => !!u.token))
    const token = users.student.token

    // A page load asks for the streak from several places at once; an account
    // without a streak row used to 500 on the second request.
    const streaks = await Promise.all([1, 2, 3].map(() => call('GET', '/api/gamification/streak', undefined, token)))
    check('parallel streak requests all succeed',
      streaks.every((s) => s.status === 200 && s.json?.data?.currentStreak === 0),
      streaks.map((s) => s.status).join(','))

    // ── The bank is in the admin ─────────────────────────────────────
    const facets = await call('GET', '/api/admin/past-questions/facets', undefined, users.admin.token)
    const counts = Object.fromEntries(
      (facets.json?.data?.subjects ?? []).map((s) => [s.subjectSlug, s.count]),
    )
    const expected = fileCounts()
    check('admin sees every seeded subject in full',
      Object.entries(expected).every(([slug, n]) => counts[slug] >= n),
      'bank=' + JSON.stringify(counts) + ' files=' + JSON.stringify(expected))

    const listed = await call('GET', '/api/admin/past-questions?subjectSlug=biology&limit=5&page=1',
      undefined, users.admin.token)
    check('admin can browse the biology bank',
      listed.status === 200 && (listed.json?.data?.questions?.length ?? 0) === 5 &&
        listed.json.data.questions.every((q) => !!q.topicSlug),
      'status=' + listed.status)

    // ── Whole-subject quiz ──────────────────────────────────────────
    const gen1 = await call('POST', '/api/quizzes/generate', {
      subjectSlug: 'economics', type: 'subject', difficulty: 'adaptive', mode: 'study', questionCount: 10,
    }, token)
    check('whole-subject quiz generates without a topic', gen1.status === 201, 'status=' + gen1.status)
    const q1 = await startQuiz(gen1.json?.data?.quizId, token)
    const questions1 = q1.quiz?.questions ?? []

    check('it has 10 questions, all from the bank',
      questions1.length === 10 && questions1.every((q) => q.id.startsWith('pq_')),
      questions1.map((q) => q.id).join(','))
    check('each question names its paper',
      questions1.every((q) => /^JAMB UTME \d{4} Q\d+$/.test(q.source || '')))
    check('each question has options A-D and a valid answer',
      questions1.every((q) =>
        q.options.map((o) => o.id).join('') === 'ABCD' && 'ABCD'.includes(q.correctOptionId)))

    const rows1 = await bankRows(questions1)
    check('every question is economics', [...rows1.values()].every((r) => r.subjectSlug === 'economics'))
    check('shuffled answers still match the bank', answersIntact(questions1, rows1))

    const stored = await db.query('SELECT "generatedByModel" FROM quizzes WHERE id = $1', [q1.quiz?.id])
    check('no AI was needed', stored.rows[0]?.generatedByModel === 'past-question-bank',
      stored.rows[0]?.generatedByModel)

    // Answer all correctly: grading must follow the shuffled letters.
    const submit = await call('POST', `/api/quizzes/attempts/${q1.attemptId}/submit`, {
      quizId: q1.quiz.id,
      answers: questions1.map((q) => ({ questionId: q.id, selectedOptionId: q.correctOptionId, timeSpentSec: 5 })),
      durationSec: 50,
    }, token)
    check('correct answers score 100%', submit.json?.data?.score === 100,
      'score=' + submit.json?.data?.score)
    const streakAfter = await call('GET', '/api/gamification/streak', undefined, token)
    check('a passed quiz starts the streak', streakAfter.json?.data?.currentStreak === 1,
      JSON.stringify(streakAfter.json?.data))
    const byTopic = submit.json?.data?.byTopic ?? []
    check('results break down by real syllabus topics',
      byTopic.length > 0 && byTopic.every((t) => t.topicSlug && t.topicSlug !== 'economics'),
      JSON.stringify(byTopic.map((t) => t.topicSlug)))

    // ── Freshness between sittings ─────────────────────────────────
    const gen2 = await call('POST', '/api/quizzes/generate', {
      subjectSlug: 'economics', type: 'subject', difficulty: 'adaptive', mode: 'exam', questionCount: 10,
    }, token)
    const q2 = await startQuiz(gen2.json?.data?.quizId, token)
    const ids1 = new Set(questions1.map((q) => q.id))
    const repeats = (q2.quiz?.questions ?? []).filter((q) => ids1.has(q.id)).length
    check('a second quiz serves different questions', gen2.status === 201 && repeats === 0,
      'repeats=' + repeats)

    // ── Topic quiz ─────────────────────────────────────────────────
    const gen3 = await call('POST', '/api/quizzes/generate', {
      subjectSlug: 'economics', topicSlug: 'demand', type: 'topic', difficulty: 'adaptive', mode: 'study', questionCount: 5,
    }, token)
    const q3 = await startQuiz(gen3.json?.data?.quizId, token)
    const rows3 = await bankRows(q3.quiz?.questions ?? [])
    check('a topic quiz only draws that topic',
      gen3.status === 201 && rows3.size === 5 && [...rows3.values()].every((r) => r.topicSlug === 'demand'),
      'status=' + gen3.status + ' rows=' + rows3.size)

    // Options must actually move: across 25 questions, the chance that none
    // was reordered is (1/24)^25.
    const served = [...questions1, ...(q2.quiz?.questions ?? []), ...(q3.quiz?.questions ?? [])]
    const allRows = new Map([...rows1, ...(await bankRows(q2.quiz?.questions ?? [])), ...rows3])
    const reordered = served.filter((q) => {
      const row = allRows.get(q.id.slice(3))
      return row && q.options.map((o) => o.text).join('|') !== row.options.map((o) => o.text).join('|')
    }).length
    check('options are shuffled', reordered > 0, `${reordered}/${served.length} reordered`)

    // ── Mock exam ──────────────────────────────────────────────────
    const subjects = ['economics', 'biology', 'literature']
    const mock = await call('POST', '/api/mocks/generate', { examType: 'jamb', subjectSlugs: subjects }, token)
    check('JAMB mock generates', mock.status === 201, 'status=' + mock.status + ' ' + JSON.stringify(mock.json))
    check('it is full length: 40 per subject', mock.json?.data?.questionCount === 120,
      'count=' + mock.json?.data?.questionCount)

    const summary = await call('GET', `/api/mocks/${mock.json?.data?.mockId}`, undefined, token)
    check('GET /api/mocks/:id returns the summary',
      summary.status === 200 && summary.json?.data?.questionCount === 120 && summary.json?.data?.timeLimit === 7200,
      'status=' + summary.status)

    const mockAttempt = await call('POST', `/api/mocks/${mock.json?.data?.mockId}/attempt`, undefined, token)
    const paper = await call('GET', `/api/mocks/attempts/${mockAttempt.json?.data?.attemptId}`, undefined, token)
    const mockQuestions = paper.json?.data?.quiz?.questions ?? []
    const mockRows = await bankRows(mockQuestions)
    check('every mock question comes from the bank',
      mockQuestions.length === 120 && mockRows.size === 120)
    const blocks = [0, 1, 2].map((i) =>
      new Set(mockQuestions.slice(i * 40, i * 40 + 40).map((q) => mockRows.get(q.id.slice(3))?.subjectSlug)))
    check('the paper is sat subject by subject',
      blocks.every((b, i) => b.size === 1 && b.has(subjects[i])),
      blocks.map((b) => [...b].join('/')).join(' | '))
    check('mock answers still match the bank', answersIntact(mockQuestions, mockRows))

    const mockStored = await db.query('SELECT "generatedByModel" FROM quizzes WHERE id = $1',
      [mock.json?.data?.mockId])
    check('the mock needed no AI', mockStored.rows[0]?.generatedByModel === 'past-question-bank')

    const half = mockQuestions.map((q, i) => ({
      questionId: q.id,
      selectedOptionId: i % 2 === 0 ? q.correctOptionId : 'ABCD'.replace(q.correctOptionId, '')[0],
      timeSpentSec: 1,
    }))
    const mockSubmit = await call('POST', `/api/mocks/attempts/${mockAttempt.json?.data?.attemptId}/submit`, {
      quizId: mock.json?.data?.mockId, answers: half, durationSec: 600,
    }, token)
    check('half right scores 50%', mockSubmit.status === 200 && mockSubmit.json?.data?.score === 50,
      'status=' + mockSubmit.status + ' ' + JSON.stringify(mockSubmit.json?.data ?? mockSubmit.json))

    const mock2 = await call('POST', '/api/mocks/generate', { examType: 'jamb', subjectSlugs: subjects }, token)
    const attempt2 = await call('POST', `/api/mocks/${mock2.json?.data?.mockId}/attempt`, undefined, token)
    const paper2 = await call('GET', `/api/mocks/attempts/${attempt2.json?.data?.attemptId}`, undefined, token)
    const order1 = mockQuestions.map((q) => q.id).join()
    const order2 = (paper2.json?.data?.quiz?.questions ?? []).map((q) => q.id).join()
    check('a second mock is a different paper', mock2.status === 201 && order1 !== order2)

    // ── Diagrams ───────────────────────────────────────────────────
    const pictured = await db.query(
      `SELECT id, "imageUrl" FROM past_questions WHERE "subjectSlug" = 'physics' AND "imageUrl" IS NOT NULL`)
    check('physics diagrams are in the bank', pictured.rowCount >= 50, 'count=' + pictured.rowCount)
    const unserved = []
    for (const row of pictured.rows) {
      const res = await fetch(BASE + row.imageUrl)
      const bytes = (await res.arrayBuffer()).byteLength
      if (res.status !== 200 || res.headers.get('content-type') !== 'image/png' ||
          res.headers.get('cross-origin-resource-policy') !== 'cross-origin' || bytes < 500) {
        unserved.push(`${row.imageUrl} ${res.status} ${res.headers.get('content-type')} ${bytes}b`)
      }
    }
    check('every diagram is served as a cross-origin PNG', unserved.length === 0, unserved.slice(0, 3).join('; '))
    const missing = await fetch(BASE + '/static/past-questions/physics/no-such-diagram.png')
    check('a missing diagram is a 404', missing.status === 404, 'status=' + missing.status)

    // All 18 scalars-vectors questions, three of which have a diagram.
    const genP = await call('POST', '/api/quizzes/generate', {
      subjectSlug: 'physics', topicSlug: 'scalars-vectors', type: 'topic', difficulty: 'adaptive', mode: 'study', questionCount: 18,
    }, users.physics.token)
    const qP = await startQuiz(genP.json?.data?.quizId, users.physics.token)
    const physicsQuestions = qP.quiz?.questions ?? []
    const rowsP = await db.query('SELECT id, "imageUrl" FROM past_questions WHERE id = ANY($1)',
      [physicsQuestions.map((q) => q.id.slice(3))])
    const imageOf = new Map(rowsP.rows.map((r) => [r.id, r.imageUrl]))
    const withImage = physicsQuestions.filter((q) => q.imageUrl)
    check('a physics quiz carries its diagrams',
      genP.status === 201 && physicsQuestions.length === 18 && withImage.length >= 3,
      `status=${genP.status} questions=${physicsQuestions.length} diagrams=${withImage.length}`)
    check('each diagram belongs to its own question',
      physicsQuestions.every((q) => (imageOf.get(q.id.slice(3)) ?? undefined) === q.imageUrl))

    const physicsMock = await call('POST', '/api/mocks/generate', { examType: 'jamb', subjectSlugs: ['physics'] },
      users.physics.token)
    const physicsAttempt = await call('POST', `/api/mocks/${physicsMock.json?.data?.mockId}/attempt`, undefined,
      users.physics.token)
    const physicsPaper = await call('GET', `/api/mocks/attempts/${physicsAttempt.json?.data?.attemptId}`, undefined,
      users.physics.token)
    const physicsMockQuestions = physicsPaper.json?.data?.quiz?.questions ?? []
    const physicsMockRows = await bankRows(physicsMockQuestions)
    check('a physics mock is a full bank paper',
      physicsMock.status === 201 && physicsMockQuestions.length === 40 && physicsMockRows.size === 40,
      `status=${physicsMock.status} questions=${physicsMockQuestions.length}`)
    check('physics mock answers still match the bank', answersIntact(physicsMockQuestions, physicsMockRows))

    // ── Mathematics: the largest subject, with diagrams of its own ──
    const picturedM = await db.query(
      `SELECT id, "imageUrl" FROM past_questions WHERE "subjectSlug" = 'mathematics' AND "imageUrl" IS NOT NULL`)
    check('mathematics diagrams are in the bank', picturedM.rowCount >= 70, 'count=' + picturedM.rowCount)
    const unservedM = []
    for (const row of picturedM.rows) {
      const res = await fetch(BASE + row.imageUrl)
      const bytes = (await res.arrayBuffer()).byteLength
      if (res.status !== 200 || res.headers.get('content-type') !== 'image/png' ||
          res.headers.get('cross-origin-resource-policy') !== 'cross-origin' || bytes < 500) {
        unservedM.push(`${row.imageUrl} ${res.status} ${res.headers.get('content-type')} ${bytes}b`)
      }
    }
    check('every maths diagram is served as a cross-origin PNG', unservedM.length === 0,
      unservedM.slice(0, 3).join('; '))

    const genM = await call('POST', '/api/quizzes/generate', {
      subjectSlug: 'mathematics', type: 'subject', difficulty: 'adaptive', mode: 'study', questionCount: 20,
    }, users.maths.token)
    const qM = await startQuiz(genM.json?.data?.quizId, users.maths.token)
    const mathsQuestions = qM.quiz?.questions ?? []
    const mathsRows = await bankRows(mathsQuestions)
    check('a mathematics quiz is 20 bank questions',
      genM.status === 201 && mathsQuestions.length === 20 && mathsRows.size === 20,
      `status=${genM.status} questions=${mathsQuestions.length}`)
    check('maths answers survive the shuffle', answersIntact(mathsQuestions, mathsRows))
    const mathsYears = new Set(mathsQuestions.map((q) => (q.source || '').match(/\d{4}/)?.[0]))
    check('one draw spans several papers', mathsYears.size >= 5, [...mathsYears].sort().join(','))

    const mathsMock = await call('POST', '/api/mocks/generate', { examType: 'jamb', subjectSlugs: ['mathematics'] },
      users.maths.token)
    const mathsAttempt = await call('POST', `/api/mocks/${mathsMock.json?.data?.mockId}/attempt`, undefined,
      users.maths.token)
    const mathsPaper = await call('GET', `/api/mocks/attempts/${mathsAttempt.json?.data?.attemptId}`, undefined,
      users.maths.token)
    const mathsMockQuestions = mathsPaper.json?.data?.quiz?.questions ?? []
    const mathsMockRows = await bankRows(mathsMockQuestions)
    check('a mathematics mock is a full bank paper',
      mathsMock.status === 201 && mathsMockQuestions.length === 40 && mathsMockRows.size === 40,
      `status=${mathsMock.status} questions=${mathsMockQuestions.length}`)
    check('mathematics mock answers still match the bank',
      answersIntact(mathsMockQuestions, mathsMockRows))

    // ── Validation ─────────────────────────────────────────────────
    const other = users.other.token
    const noTopic = await call('POST', '/api/quizzes/generate', {
      subjectSlug: 'economics', type: 'topic', difficulty: 'adaptive', questionCount: 5,
    }, other)
    check('a topic quiz still requires a topic', noTopic.status === 400, 'status=' + noTopic.status)

    const badType = await call('POST', '/api/quizzes/generate', {
      subjectSlug: 'economics', type: 'everything', difficulty: 'adaptive', questionCount: 5,
    }, other)
    check('an unknown quiz type is rejected', badType.status === 400, 'status=' + badType.status)

    const noSubjects = await call('POST', '/api/mocks/generate', { examType: 'jamb', subjectSlugs: [] }, other)
    check('a mock needs at least one subject', noSubjects.status === 400, 'status=' + noSubjects.status)
  } finally {
    // Quizzes and attempts cascade with the user.
    if (cleanup.length > 0) {
      await db.query('DELETE FROM users WHERE id = ANY($1)', [cleanup])
      const left = await db.query('SELECT 1 FROM users WHERE id = ANY($1)', [cleanup])
      check('test accounts are removed', left.rowCount === 0)
    }
    await db.end()
  }

  console.log('\n' + passed + ' passed, ' + failed + ' failed')
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error('\nSmoke run crashed:', err.message)
  process.exit(1)
})
