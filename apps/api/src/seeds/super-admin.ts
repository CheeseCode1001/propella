import bcrypt from 'bcryptjs'
import { prisma } from '../config/db'
import { env } from '../config/env'

/**
 * Ensures a super-admin account exists so a fresh install has a way into the
 * admin console before anyone has signed up.
 *
 * Credentials come from SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD. In production
 * both must be set explicitly — the seed refuses to create a default-password
 * account on a real deployment.
 *
 * Re-running is safe: an existing account is promoted to admin and marked
 * verified, but its password is never overwritten.
 */
export async function seedSuperAdmin(): Promise<void> {
  const email = (env.SUPER_ADMIN_EMAIL || 'admin@propella.local').toLowerCase().trim()
  const password = env.SUPER_ADMIN_PASSWORD

  const isProduction = env.NODE_ENV === 'production'

  if (isProduction && (!env.SUPER_ADMIN_EMAIL || !password)) {
    console.log(
      'Skipping super-admin seed: set SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD to create one in production.',
    )
    return
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  })

  if (existing) {
    if (existing.role !== 'admin') {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: 'admin', emailVerifiedAt: new Date() },
      })
      console.log(`Promoted existing account to super admin: ${email}`)
    } else {
      console.log(`Super admin already present: ${email}`)
    }
    return
  }

  const effectivePassword = password || 'ChangeMe!2026'

  await prisma.user.create({
    data: {
      email,
      name: 'Super Admin',
      passwordHash: await bcrypt.hash(effectivePassword, 12),
      role: 'admin',
      // Skips the OTP screen so the console is reachable immediately.
      emailVerifiedAt: new Date(),
      onboardingCompleted: true,
      onboardingStep: 6,
      streak: { create: { lastActiveDate: new Date() } },
    },
  })

  console.log('')
  console.log('  Super admin created')
  console.log(`    email:    ${email}`)
  console.log(`    password: ${password ? '(from SUPER_ADMIN_PASSWORD)' : effectivePassword}`)
  if (!password) {
    console.log('    ^ default password — change it, or set SUPER_ADMIN_PASSWORD before seeding.')
  }
  console.log('    sign in:  http://localhost:3001')
  console.log('')
}
