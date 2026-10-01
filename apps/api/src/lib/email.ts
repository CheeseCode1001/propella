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
    .btn, a.btn, a.btn:visited, a.btn:hover, a.btn:active { display: inline-block; background-color: #B23A2E; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; margin: 8px 0 16px; -webkit-text-size-adjust: none; }
    .btn span { color: #ffffff !important; text-decoration: none; }
    .divider { border: none; border-top: 1px solid #E5DFD2; margin: 24px 0; }
    .footer { font-size: 12px; color: #7C766B; margin-top: 24px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="wrap">
    <span class="logo">Propella</span>
    <div class="card">${body}</div>
    <p class="footer">Propella &mdash; Exam preparation for JAMB, WAEC, NECO &amp; Undergraduate study.<br />You are receiving this because you have an active Propella account.</p>
  </div>
</body>
</html>`
}

function renderButton(label: string, href: string): string {
  return `<a class="btn" href="${href}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #B23A2E; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; margin: 8px 0 16px; -webkit-text-size-adjust: none;"><span style="color: #ffffff !important; text-decoration: none; font-weight: 600;">${label}</span></a>`
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
        ${renderButton('Reset password', resetUrl)}
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
        ${renderButton('Open Propella', `${env.FRONTEND_URL}/dashboard`)}
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
        ${renderButton('Open Propella', link)}
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
        ${renderButton('View your roadmap', `${env.FRONTEND_URL}/roadmap`)}
      `),
    })
    logger.info({ to }, 'Weekly digest email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send weekly digest email')
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!canSend()) return
  const firstName = name.split(' ')[0] || 'Scholar'
  // Curated banner of African students studying together (reliable Unsplash direct photo)
  const bannerUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `Welcome to Propella, ${firstName}!`,
      html: base(`
        <img src="${bannerUrl}" alt="Students studying together" style="width:100%;max-height:220px;object-fit:cover;border-radius:6px;margin-bottom:24px;display:block;" />
        <h1>Welcome to Propella, ${firstName}! 🎓</h1>
        <p>You've taken the first step towards academic excellence. Whether you're mastering high school exams (JAMB, WAEC, NECO) or managing your university courses, Propella provides the structure, past question mastery, and AI guidance you need.</p>
        <p>Here is what you can do right now:</p>
        <ul style="color:#4A463E;font-size:14px;line-height:1.8;margin:0 0 20px 20px;padding:0;">
          <li>Explore your personalized study plan or university courses</li>
          <li>Practice with real past questions and interactive quizzes</li>
          <li>Ask our AI tutor questions directly from your materials</li>
          <li>Build daily streaks and track your progress</li>
        </ul>
        ${renderButton('Start Studying Now', `${env.FRONTEND_URL}/dashboard`)}
        <hr class="divider" />
        <p style="font-size:13px;color:#7C766B;">Need help or have questions? Simply reply to this email &mdash; we're here to help you succeed.</p>
      `),
    })
    logger.info({ to }, 'Welcome email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send welcome email')
  }
}

export async function sendBroadcastEmail(
  to: string,
  params: { title: string; body: string; imageUrl?: string | null | undefined; deeplink?: string | null | undefined },
): Promise<void> {
  if (!canSend()) return
  const link = params.deeplink ? `${env.FRONTEND_URL}${params.deeplink}` : `${env.FRONTEND_URL}/dashboard`
  const imageHtml = params.imageUrl
    ? `<img src="${params.imageUrl}" alt="" style="width:100%;max-height:240px;object-fit:cover;border-radius:6px;margin-bottom:20px;display:block;" />`
    : ''
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: params.title,
      html: base(`
        ${imageHtml}
        <h1>${params.title}</h1>
        <p style="white-space:pre-wrap;">${params.body}</p>
        ${renderButton('Open Propella', link)}
      `),
    })
  } catch (err) {
    logger.error({ err, to }, 'Failed to send broadcast email')
  }
}

export async function sendWithdrawalApprovedEmail(
  to: string,
  params: { name: string; amount: number; bankName: string; accountNumber: string },
): Promise<void> {
  if (!canSend()) return
  const firstName = params.name.split(' ')[0] || 'Scholar'
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: 'Your Propella Withdrawal Request Has Been Approved! 🎉',
      html: base(`
        <h1>Withdrawal Approved! 💰</h1>
        <p>Hello ${firstName},</p>
        <p>Great news! Your referral earnings withdrawal request of <strong>₦${params.amount.toLocaleString()}</strong> has been approved by the admin.</p>
        <div style="background:#F4F1EA;border-radius:6px;padding:16px;margin:20px 0;">
          <p style="margin:0 0 8px;font-size:14px;color:#1A1814;"><strong>Withdrawal Details:</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#4A463E;">Amount: <strong>₦${params.amount.toLocaleString()}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#4A463E;">Bank: <strong>${params.bankName}</strong></p>
          <p style="margin:0;font-size:13px;color:#4A463E;">Account Number: <strong>${params.accountNumber}</strong></p>
        </div>
        <p style="font-weight:500;color:#1A1814;">Your payment is being disbursed and you will receive your money under 24 hours.</p>
        <p>Thank you for introducing other students to Propella. Keep sharing your referral link to earn even more rewards!</p>
        ${renderButton('View Referral Wallet', `${env.FRONTEND_URL}/settings?tab=referrals`)}
      `),
    })
    logger.info({ to, amount: params.amount }, 'Withdrawal approved email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send withdrawal approved email')
  }
}
