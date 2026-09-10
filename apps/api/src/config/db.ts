import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client'
import { env } from './env'
import { logger } from './logger'

/**
 * Single import site for everything Prisma. Prisma 7 generates its client into
 * `src/generated/prisma`, so re-exporting here keeps the rest of the codebase
 * free of deep relative paths into generated code.
 */
export * from '../generated/prisma/client'

/**
 * The client's log-event types are carried by a generic that is inferred from
 * the constructor argument, so this must NOT be annotated as a bare
 * `PrismaClient` — that resets the generic to `never` and `$on` stops accepting
 * any event name.
 */
function createClient() {
  // Prisma 7 talks to Postgres through a driver adapter. DATABASE_URL is the
  // pooled endpoint; migrations use the direct one via prisma.config.ts.
  //
  // Managed Postgres (Supabase, Neon) terminates TLS with a certificate that
  // does not chain to a public root, so chain verification is off — the
  // equivalent of libpq's `sslmode=require`. Do not put `sslmode=` in the URL
  // itself: node-postgres now reads that as `verify-full` and it overrides this.
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  return new PrismaClient({
    adapter,
    log: [
      { emit: 'event', level: 'warn' },
      { emit: 'event', level: 'error' },
    ],
  })
}

type AppPrismaClient = ReturnType<typeof createClient>

const globalForPrisma = globalThis as unknown as { prisma?: AppPrismaClient }

/**
 * One client for the whole process, cached on globalThis so `tsx watch` reloads
 * do not open a new connection pool on every restart.
 */
export const prisma: AppPrismaClient = globalForPrisma.prisma ?? createClient()

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Route Prisma's own diagnostics through pino rather than raw stdout.
prisma.$on('error', (e) => {
  logger.error({ target: e.target }, e.message)
})

prisma.$on('warn', (e) => {
  logger.warn({ target: e.target }, e.message)
})

/**
 * Masks credentials in a connection string. Matches greedily up to the LAST `@`
 * before the host, because a password may itself contain `@` — stopping at the
 * first one leaks the remainder of the password into the logs.
 */
function redact(url: string): string {
  return url.replace(/:\/\/[^/?#]*@/, '://***:***@')
}

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect()
    logger.info({ url: redact(env.DATABASE_URL) }, 'PostgreSQL connected')
  } catch (err) {
    logger.error({ err }, 'PostgreSQL connection failed')
    process.exit(1)
  }
}

export async function disconnectDB(): Promise<void> {
  await prisma.$disconnect()
  logger.info('PostgreSQL disconnected')
}
