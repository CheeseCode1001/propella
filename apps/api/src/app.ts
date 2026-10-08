import path from 'path'
import express, { type Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'express-async-errors'
import { env } from './config/env'
import { errorHandler, AppError } from './middleware/error-handler'
import { authenticate } from './middleware/auth'
import authRoutes from './features/auth/auth.routes'
import subjectsRouter from './features/subjects/subjects.routes'
import onboardingRouter from './features/onboarding/onboarding.routes'
import dashboardRouter from './features/dashboard/dashboard.routes'
import roadmapRouter from './features/roadmap/roadmap.routes'
import sessionsRouter from './features/sessions/sessions.routes'
import gamificationRouter from './features/gamification/gamification.routes'
import usersRouter from './features/users/users.routes'
import progressRouter from './features/progress/progress.routes'
import quizzesRouter from './features/quizzes/quizzes.routes'
import marathonRouter from './features/marathon/marathon.routes'
import assistantRouter from './features/assistant/assistant.routes'
import mocksRouter from './features/mocks/mocks.routes'
import leaderboardRouter from './features/leaderboard/leaderboard.routes'
import notificationsRouter from './features/notifications/notifications.routes'
import adminRouter from './features/admin/admin.routes'
import notesRouter from './features/notes/notes.routes'
import plannerRouter from './features/planner/planner.routes'
import topicsRouter from './features/topics/topics.routes'
import badgesRouter from './features/badges/badges.routes'
import referralsRouter from './features/referrals/referrals.routes'
import coursesRouter from './features/courses/courses.routes'
import subscriptionsRouter from './features/subscriptions/subscriptions.routes'

const app: Express = express()

// Behind reverse proxies like Render / Cloudflare
app.set('trust proxy', 1)

// Security middleware
app.use(helmet())

/**
 * Diagrams for past questions (data/past-questions/images). Mounted ahead of
 * CORS because the web and admin apps load them with plain <img> tags from
 * another origin; helmet's default Cross-Origin-Resource-Policy of same-origin
 * would block that, so this route relaxes it. The files are public exam
 * material and never change under the same name, hence the long cache.
 */
app.use(
  '/static/past-questions',
  express.static(path.resolve(__dirname, '../data/past-questions/images'), {
    index: false,
    maxAge: '30d',
    setHeaders(res) {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    },
  }),
  // A missing file is a plain 404, not an application error.
  (_req: express.Request, res: express.Response) => {
    res.status(404).end()
  },
)
// app.use(
//   cors({
//     origin: env.FRONTEND_URL,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//   }),
// )

/**
 * Origins allowed to call the API with credentials.
 *
 * The two app URLs come from the environment so a deployment does not need a
 * code change; CORS_EXTRA_ORIGINS takes a comma-separated list for anything
 * else (a custom domain, a second preview).
 */
const allowedOrigins = [
  env.FRONTEND_URL,
  'https://propellastudy.com',
  'https://www.propellastudy.com',
  'https://admin.propellastudy.com',
  env.ADMIN_URL,
  ...env.CORS_EXTRA_ORIGINS.split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  // Local development.
  'http://localhost:3000',
  'http://localhost:3001',
].filter(Boolean)

/**
 * Vercel gives every deployment its own hostname, so preview builds cannot be
 * listed ahead of time. They are matched by pattern instead, and only outside
 * production — a live API should answer the known origins alone.
 */
const VERCEL_PREVIEW = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i

function isAllowedOrigin(origin: string): boolean {
  if (allowedOrigins.includes(origin)) return true
  if (VERCEL_PREVIEW.test(origin)) return true
  return false
}

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: same-origin, curl, or a native app. Nothing to block.
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true)
      } else {
        callback(new AppError(403, `CORS blocked for origin: ${origin}`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)

// Body parsing — captures rawBody for Paystack webhook HMAC verification
app.use(
  express.json({
    limit: '25mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf
    },
  }),
)
app.use(express.urlencoded({ extended: false, limit: '25mb' }))
app.use(cookieParser())

// NoSQL-injection sanitisation is gone with MongoDB — Prisma parameterises
// every query, so string operators cannot be smuggled in through request bodies.

// Health check (before auth)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() })
})

// Feature routes
app.use('/api/auth', authRoutes)
app.use('/api/subjects', subjectsRouter)
app.use('/api/onboarding', authenticate, onboardingRouter)
app.use('/api/dashboard', authenticate, dashboardRouter)
app.use('/api/roadmap', authenticate, roadmapRouter)
app.use('/api/sessions', authenticate, sessionsRouter)
app.use('/api/gamification', authenticate, gamificationRouter)
app.use('/api/users', authenticate, usersRouter)
app.use('/api/progress', authenticate, progressRouter)

app.use('/api/quizzes', authenticate, quizzesRouter)
app.use('/api/marathon', authenticate, marathonRouter)
app.use('/api/assistant', authenticate, assistantRouter)
app.use('/api/mocks', authenticate, mocksRouter)
app.use('/api/leaderboard', authenticate, leaderboardRouter)
app.use('/api/notifications', authenticate, notificationsRouter)
app.use('/api/notes', authenticate, notesRouter)
app.use('/api/planner', authenticate, plannerRouter)
app.use('/api/topics', authenticate, topicsRouter)
app.use('/api/badges', authenticate, badgesRouter)
app.use('/api/referrals', authenticate, referralsRouter)
app.use('/api/courses', authenticate, coursesRouter)
app.use('/api/subscriptions', subscriptionsRouter)
app.use('/api/admin', authenticate, adminRouter)

// Global error handler — must be last
app.use(errorHandler)

export default app
