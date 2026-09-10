import { Resend } from 'resend'
import { env } from '../config/env'
import { logger } from '../config/logger'

const resend = new Resend(env.RESEND_API_KEY || 're_placeholder')

/**
 * The sender address.
 *
 * Resend only accepts a `from` on a domain you have verified with it, which
 * rules out free mailbox providers — you cannot add DNS records to gmail.com.
 * The default is Resend's sandbox sender, which works with no domain but only
 * delivers to the address that owns the Resend account, so it is fine for
 * testing and not for real students.
 *
 * In production set EMAIL_FROM to an address on your own verified domain.
 */
const FROM = env.EMAIL_FROM || 'Propella <onboarding@resend.dev>'

/**
 * Where replies go. A normal mailbox is fine here — unlike `from`, the
 * reply-to address is not authenticated, so a Gmail address works.
 */
const REPLY_TO = env.EMAIL_REPLY_TO || undefined

function base(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Propella</title>
  <style>
    body { margin: 0; padding: 0; background: #FBF9F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1A1814; }
    .wrap { max-width: 560px; margin: 40px auto; padding: 0 24px; }
    .logo { font-size: 18px; font-weight: 600; color: #1A1814; letter-spacing: -0.01em; margin-bottom: 32px; display: block; }
    .card { background: #fff; border: 1px solid #E5DFD2; border-radius: 8px; padding: 32px; }
    h1 { font-size: 22px; font-weight: 500; color: #1A1814; margin: 0 0 8px; line-height: 1.3; }
    p { font-size: 15px; color: #4A463E; line-height: 1.6; margin: 0 0 16px; }
    p:last-child { margin-bottom: 0; }
    .btn { display: inline-block; background: #B23A2E; color: #fff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 6px; margin: 8px 0 16px; }
    .divider { border: none; border-top: 1px solid #E5DFD2; margin: 24px 0; }
    .footer { font-size: 12px; color: #7C766B; margin-top: 24px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrap">
    <span class="logo">Propella</span>
    <div class="card">${body}</div>
    <p class="footer">Propella &mdash; Exam preparation for JAMB, WAEC &amp; NECO candidates.<br />You are receiving this because you have an active Propella account.</p>
  </div>
</body>
</html>`
}

function canSend(): boolean {
  if (!env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not configured — email not sent')
    return false
  }
  return true
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  if (!canSend()) return
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: 'Reset your Propella password',
      html: base(`
        <h1>Reset your password</h1>
        <p>We received a request to reset the password for your Propella account. Click the button below to choose a new one. This link expires in one hour.</p>
        <a class="btn" href="${resetUrl}">Reset password</a>
        <hr class="divider" />
        <p>If you did not request a password reset, you can ignore this email. Your password will not change.</p>
      `),
    })
    logger.info({ to }, 'Password reset email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send password reset email')
    throw err
  }
}

export async function sendVerificationCodeEmail(to: string, code: string): Promise<void> {
  if (!canSend()) return
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `${code} is your Propella verification code`,
      html: base(`
        <h1>Confirm your email</h1>
        <p>Enter this code in Propella to finish setting up your account.</p>
        <p style="font-family: ui-monospace, monospace; font-size: 32px; font-weight: 600; letter-spacing: 0.18em; color: #1A1814; margin: 24px 0;">${code}</p>
        <p>The code expires in 15 minutes. If you did not create a Propella account, you can ignore this email.</p>
      `),
    })
  } catch (err) {
    logger.error({ err, to }, 'Failed to send verification email')
  }
}

export async function sendStreakWarningEmail(to: string, streak: number): Promise<void> {
  if (!canSend()) return
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `Your ${streak}-day streak is at risk`,
      html: base(`
        <h1>Study today to keep your streak</h1>
        <p>You have a ${streak}-day streak. Study anything today &mdash; even one topic or a short quiz &mdash; to keep it going.</p>
        <a class="btn" href="${env.FRONTEND_URL}/dashboard">Open Propella</a>
        <hr class="divider" />
        <p>Your streak resets at midnight. A streak freeze will be applied automatically if you have one available on your plan.</p>
      `),
    })
    logger.info({ to, streak }, 'Streak warning email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send streak warning email')
  }
}

export async function sendStudyReminderEmail(
  to: string,
  payload: { title: string; body: string; deeplink?: string },
): Promise<void> {
  if (!canSend()) return
  try {
    const link = payload.deeplink ? `${env.FRONTEND_URL}${payload.deeplink}` : `${env.FRONTEND_URL}/dashboard`
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: payload.title,
      html: base(`
        <h1>${payload.title}</h1>
        <p>${payload.body}</p>
        <a class="btn" href="${link}">Open Propella</a>
      `),
    })
    logger.info({ to, type: 'study_reminder' }, 'Study reminder email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send study reminder email')
  }
}

export async function sendWeeklyDigestEmail(
  to: string,
  data: {
    studyHours: number
    topicsMastered: number
    avgScore: number
    weakTopics: string[]
  },
): Promise<void> {
  if (!canSend()) return
  const weakList =
    data.weakTopics.length > 0
      ? `<p><strong>Topics to focus on next week:</strong> ${data.weakTopics.slice(0, 3).join(', ')}.</p>`
      : '<p>No critical weak spots this week. Keep the pace.</p>'
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: 'Your Propella week in review',
      html: base(`
        <h1>This week in review</h1>
        <p>Here is how your study week looked.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #E5DFD2;font-size:13px;color:#7C766B;font-family:monospace;letter-spacing:0.04em;">STUDY TIME</td>
            <td style="padding:12px 0;border-bottom:1px solid #E5DFD2;font-size:18px;font-weight:500;text-align:right;">${data.studyHours.toFixed(1)} hrs</td>
          </tr>
          <tr>
            <td style="padding:12px 0;border-bottom:1px solid #E5DFD2;font-size:13px;color:#7C766B;font-family:monospace;letter-spacing:0.04em;">TOPICS MASTERED</td>
            <td style="padding:12px 0;border-bottom:1px solid #E5DFD2;font-size:18px;font-weight:500;text-align:right;">${data.topicsMastered}</td>
          </tr>
          <tr>
            <td style="padding:12px 0;font-size:13px;color:#7C766B;font-family:monospace;letter-spacing:0.04em;">AVERAGE QUIZ SCORE</td>
            <td style="padding:12px 0;font-size:18px;font-weight:500;text-align:right;">${data.avgScore}%</td>
          </tr>
        </table>
        <hr class="divider" />
        ${weakList}
        <a class="btn" href="${env.FRONTEND_URL}/roadmap">View your roadmap</a>
      `),
    })
    logger.info({ to }, 'Weekly digest email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send weekly digest email')
  }
}
