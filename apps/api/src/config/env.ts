import { z } from 'zod'
import { config } from 'dotenv'
import { resolve } from 'path'

const ENV_PATH = resolve(__dirname, '../../.env')
const isProduction = process.env['NODE_ENV'] === 'production'

// Which of our variables were already present in the real environment before
// the file was read. A stale machine-wide value silently shadowing apps/api/.env
// is very hard to spot otherwise — it once pointed this app at the wrong database.
const OWNED_KEYS = [
  'DATABASE_URL',
  'DIRECT_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'GEMINI_API_KEY',
  'RESEND_API_KEY',
  'FRONTEND_URL',
] as const

const preexisting = new Map<string, string>()
for (const key of OWNED_KEYS) {
  const value = process.env[key]
  if (value) preexisting.set(key, value)
}

// In production the platform's environment is authoritative and there is no
// .env file. In development the project's file wins, so a leftover shell or
// user-scope variable cannot quietly redirect the app.
const parsedFile = config({ path: ENV_PATH, override: !isProduction })

if (!isProduction && parsedFile.parsed) {
  const fromFile = parsedFile.parsed
  const shadowed = [...preexisting.entries()]
    .filter(([key, value]) => fromFile[key] !== undefined && fromFile[key] !== value)
    .map(([key]) => key)

  if (shadowed.length > 0) {
    const lines = [
      '',
      '[env] These variables are set in your shell / OS environment and differ from apps/api/.env:',
      ...shadowed.map((key) => `        - ${key}`),
      '      apps/api/.env has been used. Clear the stale values to avoid confusion, e.g.',
      "        PowerShell:  [Environment]::SetEnvironmentVariable('DATABASE_URL', $null, 'User')",
      '',
    ]
    console.warn(lines.join('\n'))
  }
}

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Postgres. DIRECT_URL is only used by `prisma migrate`; when a host does not
  // need a separate direct connection it falls back to DATABASE_URL.
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),

  JWT_ACCESS_SECRET: z.string().min(1, 'JWT_ACCESS_SECRET is required'),
  JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),

  // How long a signed-in session lasts before the token is renewed, and how
  // long that renewal stays possible.
  ACCESS_TOKEN_TTL: z.string().default('1d'),
  REFRESH_TOKEN_TTL: z.string().default('30d'),

  // Web push. Generate a pair with: pnpm --filter @propella/api push:keys
  // Blank disables push delivery, the same way a blank Resend key disables email.
  VAPID_PUBLIC_KEY: z.string().optional().default(''),
  VAPID_PRIVATE_KEY: z.string().optional().default(''),
  // Hosting dashboards write an empty string for a variable added with no
  // value, and a zod default only covers undefined — so map blank to the
  // default explicitly rather than letting an empty subject reach web-push.
  VAPID_SUBJECT: z
    .string()
    .transform((v) => v.trim() || 'mailto:support@propella.app')
    .default('mailto:support@propella.app'),

  // Google Gemini — powers quiz generation, mock exams and the AI assistant.
  GEMINI_API_KEY: z.string().optional().default(''),
  GEMINI_QUIZ_MODEL: z.string().default('gemini-flash-latest'),
  GEMINI_CHAT_MODEL: z.string().default('gemini-flash-latest'),

  RESEND_API_KEY: z.string().optional().default(''),

  // Must be on a domain verified with Resend. Free mailbox providers
  // (gmail.com and friends) cannot be verified, so they will be rejected.
  // Blank falls back to Resend's sandbox sender, which only reaches your own
  // account address.
  EMAIL_FROM: z.string().optional().default(''),

  // Where replies land. Not authenticated, so an ordinary mailbox is fine.
  EMAIL_REPLY_TO: z.string().optional().default(''),
  FRONTEND_URL: z.string().min(1, 'FRONTEND_URL is required'),
  // Origin of the admin dashboard (apps/admin).
  ADMIN_URL: z.string().default('http://localhost:3001'),

  // Any additional origins allowed to call the API with credentials,
  // comma-separated. Use for custom domains or a second preview deployment.
  CORS_EXTRA_ORIGINS: z.string().default(''),

  // Seeded super-admin. Both are required to seed one in production.
  SUPER_ADMIN_EMAIL: z.string().optional().default(''),
  SUPER_ADMIN_PASSWORD: z.string().optional().default(''),
  COOKIE_DOMAIN: z.string().optional(),
})

// `prisma migrate` reads DIRECT_URL straight from .env, but the schema declares
// it, so make sure it is always present for tooling too.
if (!process.env['DIRECT_URL'] && process.env['DATABASE_URL']) {
  process.env['DIRECT_URL'] = process.env['DATABASE_URL']
}

const parsed = EnvSchema.safeParse(process.env)

if (!parsed.success) {
  const problems = parsed.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
  throw new Error(
    `Invalid environment configuration in apps/api/.env:\n${problems}\n\n` +
      `Copy apps/api/.env.example to apps/api/.env and fill it in.`,
  )
}

export const env = {
  ...parsed.data,
  DIRECT_URL: parsed.data.DIRECT_URL || parsed.data.DATABASE_URL,
}
