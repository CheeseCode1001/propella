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

function base(body: string, previewText?: string): string {
  const previewHtml = previewText
    ? `<div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Propella</title>
  <style>
    body { margin: 0; padding: 0; background: #FBF9F4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1814; -webkit-font-smoothing: antialiased; }
    .wrap { max-width: 580px; margin: 36px auto; padding: 0 20px; }
    .brand-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    .logo { font-size: 20px; font-weight: 700; color: #1A1814; letter-spacing: -0.02em; text-decoration: none; }
    .logo-badge { display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; background: #F4EFEB; color: #B23A2E; padding: 4px 8px; border-radius: 4px; }
    .card { background: #ffffff; border: 1px solid #E8E2D5; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(26,24,20,0.04); overflow: hidden; }
    .banner-img { width: 100%; max-height: 220px; object-fit: cover; border-radius: 8px; margin-bottom: 24px; display: block; }
    h1 { font-size: 22px; font-weight: 600; color: #1A1814; margin: 0 0 12px; line-height: 1.35; letter-spacing: -0.01em; }
    p { font-size: 15px; color: #4A463E; line-height: 1.6; margin: 0 0 16px; }
    p:last-child { margin-bottom: 0; }
    .stat-table { width: 100%; border-collapse: separate; border-spacing: 8px; margin: 18px 0; }
    .stat-cell { background: #FAF7F2; border: 1px solid #EBE4D8; border-radius: 8px; padding: 14px 16px; text-align: center; }
    .stat-val { font-size: 20px; font-weight: 700; color: #1A1814; margin-bottom: 2px; }
    .stat-lbl { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #7C766B; }
    .btn, a.btn, a.btn:visited, a.btn:hover, a.btn:active { display: inline-block; background-color: #B23A2E; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 13px 26px; border-radius: 8px; margin: 16px 0; -webkit-text-size-adjust: none; box-shadow: 0 2px 4px rgba(178,58,46,0.2); }
    .btn span { color: #ffffff !important; text-decoration: none; font-weight: 600; }
    .checklist { background: #FAF7F2; border: 1px solid #EBE4D8; border-radius: 8px; padding: 16px 20px; margin: 16px 0; }
    .check-item { font-size: 14px; color: #3A362E; line-height: 1.6; padding: 6px 0; border-bottom: 1px dashed #E5DFD2; }
    .check-item:last-child { border-bottom: none; }
    .divider { border: none; border-top: 1px solid #EFEAE0; margin: 24px 0; }
    .footer { font-size: 12px; color: #8C867B; margin-top: 24px; line-height: 1.6; text-align: center; }
    .footer a { color: #6E685E; text-decoration: underline; }
  </style>
</head>
<body>
  ${previewHtml}
  <div class="wrap">
    <div class="brand-row" style="margin-bottom: 18px;">
      <span class="logo">Propella</span>
      <span class="logo-badge">Study Smarter</span>
    </div>
    <div class="card">${body}</div>
    <p class="footer">
      Propella &mdash; The modern study platform for JAMB, WAEC, NECO &amp; Undergraduate academic excellence.<br />
      You are receiving this because you have an active Propella account.<br />
      <a href="${env.FRONTEND_URL}/settings">Manage notification preferences</a>
    </p>
  </div>
</body>
</html>`
}

function renderButton(label: string, href: string): string {
  return `<table border="0" cellpadding="0" cellspacing="0" style="margin: 16px 0;">
    <tr>
      <td align="center" bgcolor="#B23A2E" style="border-radius: 8px;">
        <a class="btn" href="${href}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #B23A2E; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 600; padding: 13px 26px; border-radius: 8px; -webkit-text-size-adjust: none;">
          <span style="color: #ffffff !important; text-decoration: none; font-weight: 600;">${label}</span>
        </a>
      </td>
    </tr>
  </table>`
}

function canSend(): boolean {
  if (!env.RESEND_API_KEY) {
    logger.warn('RESEND_API_KEY not configured — email not sent')
    return false
  }
  return true
}

// ─────────────────────────────── Core Auth & Account Emails ───────────────────────────────

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
        <p style="font-size:13px;color:#7C766B;">If you did not request a password reset, you can ignore this email. Your password will not change.</p>
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
        <div style="background:#FAF7F2;border:1px solid #EBE4D8;border-radius:8px;padding:16px;text-align:center;margin:24px 0;">
          <span style="font-family: ui-monospace, monospace; font-size: 34px; font-weight: 700; letter-spacing: 0.22em; color: #1A1814;">${code}</span>
        </div>
        <p style="font-size:13px;color:#7C766B;">The code expires in 15 minutes. If you did not create a Propella account, you can safely ignore this email.</p>
      `),
    })
  } catch (err) {
    logger.error({ err, to }, 'Failed to send verification email')
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  if (!canSend()) return
  const firstName = name.split(' ')[0] || 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80'
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `Welcome to Propella, ${firstName}! 🎓`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Students studying together" />
        <h1>Welcome to Propella, ${firstName}! 🎓</h1>
        <p>You've taken a big step towards academic excellence. Whether you're mastering high school exams (JAMB, WAEC, NECO) or conquering your university degree, Propella equips you with real past questions, personalized study plans, and 24/7 AI tutoring.</p>
        <div class="checklist">
          <div class="check-item">✨ <strong>Personalized Roadmap:</strong> Topic-by-topic guidance mapped to your exam syllabus</div>
          <div class="check-item">📝 <strong>Interactive Practice:</strong> Real past questions with comprehensive explanations</div>
          <div class="check-item">🤖 <strong>AI Study Assistant:</strong> Instant doubt clearance whenever you're stuck</div>
          <div class="check-item">🔥 <strong>Daily Streaks &amp; XP:</strong> Stay consistent and climb the community leaderboard</div>
        </div>
        ${renderButton('Start Studying Now', `${env.FRONTEND_URL}/dashboard`)}
        <hr class="divider" />
        <p style="font-size:13px;color:#7C766B;">Need help or have questions? Simply reply to this email &mdash; our team is rooting for your success!</p>
      `),
    })
    logger.info({ to }, 'Welcome email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send welcome email')
  }
}

// ─────────────────────────────── Engagement & Retention Emails ───────────────────────────────

/**
 * 1. Inactivity Reminder (Not seen for 3+ days)
 * Friendly, encouraging reminder welcoming them back with actionable study steps.
 */
export async function sendInactivityReminderEmail(
  to: string,
  params: { name: string; daysInactive: number; targetExam?: string | undefined; currentStreak?: number | undefined },
): Promise<void> {
  if (!canSend()) return
  const firstName = params.name.split(' ')[0] || 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80'
  const examText = params.targetExam ? `for your ${params.targetExam.toUpperCase()} exams` : 'towards your academic goals'
  const streakText = (params.currentStreak ?? 0) > 0
    ? `You worked hard to build a ${params.currentStreak}-day streak — jump back in before it fades!`
    : 'Building a consistent daily habit is the single highest predictor of exam success.'

  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `We miss you, ${firstName}! 📚 Your study goals are waiting`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Students welcoming you back" />
        <h1>We miss you on Propella, ${firstName}! 👋</h1>
        <p>It's been a few days since your last study session. Consistency is everything when preparing ${examText}.</p>
        <p>${streakText}</p>
        <div style="background:#FAF7F2;border:1px solid #EBE4D8;border-radius:8px;padding:16px 20px;margin:20px 0;">
          <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1A1814;">Quick ways to jump back in today (under 10 mins):</p>
          <p style="margin:0 0 6px;font-size:13px;color:#4A463E;">&bull; Complete 1 short topic quiz</p>
          <p style="margin:0 0 6px;font-size:13px;color:#4A463E;">&bull; Solve 5 quick past questions</p>
          <p style="margin:0;font-size:13px;color:#4A463E;">&bull; Review a key concept summary with your AI tutor</p>
        </div>
        ${renderButton('Jump Back Into Study', `${env.FRONTEND_URL}/dashboard`)}
        <hr class="divider" />
        <p style="font-size:13px;color:#7C766B;font-style:italic;">&ldquo;Small daily efforts, repeated day in and day out, turn into extraordinary academic results.&rdquo;</p>
      `),
    })
    logger.info({ to, daysInactive: params.daysInactive }, 'Inactivity reminder email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send inactivity reminder email')
  }
}

/**
 * 2. Study Marathon Completed
 * Celebrates student finishing a marathon pomodoro session with stats and praise.
 */
export async function sendMarathonCompletedEmail(
  to: string,
  params: {
    name: string
    pomodorosCompleted: number
    durationMinutes: number
    xpAwarded: number
    topicsCovered?: string[] | undefined
  },
): Promise<void> {
  if (!canSend()) return
  const firstName = params.name.split(' ')[0] || 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80'
  const topicsHtml = params.topicsCovered && params.topicsCovered.length > 0
    ? `<p style="font-size:13px;color:#4A463E;margin-top:12px;"><strong>Topics covered:</strong> ${params.topicsCovered.slice(0, 4).join(', ')}</p>`
    : ''

  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `Incredible Focus, ${firstName}! You just crushed a Study Marathon! 🏃💨`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Celebration of achievement" />
        <h1>You crushed your Study Marathon! 🏃💨</h1>
        <p>Incredible dedication, ${firstName}! You powered through a deep study marathon and stayed locked in from start to finish. Few students show this caliber of discipline.</p>
        <table class="stat-table">
          <tr>
            <td class="stat-cell" style="width:33%;">
              <div class="stat-val">${params.durationMinutes}m</div>
              <div class="stat-lbl">Focus Time</div>
            </td>
            <td class="stat-cell" style="width:33%;">
              <div class="stat-val">${params.pomodorosCompleted}</div>
              <div class="stat-lbl">Pomodoros</div>
            </td>
            <td class="stat-cell" style="width:33%;">
              <div class="stat-val">+${params.xpAwarded}</div>
              <div class="stat-lbl">XP Earned</div>
            </td>
          </tr>
        </table>
        ${topicsHtml}
        <p>Take a well-deserved breather, hydrate, and celebrate your progress today!</p>
        ${renderButton('View Marathon History', `${env.FRONTEND_URL}/marathon`)}
      `),
    })
    logger.info({ to, pomodoros: params.pomodorosCompleted }, 'Marathon completed email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send marathon completed email')
  }
}

/**
 * 3. Milestone or Badge Achieved
 * Celebrates student earning an achievement badge or hitting a major milestone.
 */
export async function sendMilestoneBadgeEmail(
  to: string,
  params: {
    name: string
    badgeName: string
    badgeDescription: string
    badgeCategory: string
    earnedValue?: number | undefined
    totalXP?: number | undefined
  },
): Promise<void> {
  if (!canSend()) return
  const firstName = params.name.split(' ')[0] || 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=1200&q=80'

  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `Boom! You unlocked a new milestone: ${params.badgeName}! 🏆`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Milestone unlocked trophy" />
        <h1>New Milestone Unlocked! 🏆</h1>
        <p>Huge congratulations, ${firstName}! Your consistent effort just unlocked an official Propella achievement:</p>
        <div style="background:#FAF7F2;border:2px solid #EBE4D8;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
          <div style="font-size:32px;margin-bottom:8px;">🎖️</div>
          <div style="font-size:18px;font-weight:700;color:#1A1814;margin-bottom:6px;">${params.badgeName}</div>
          <div style="font-size:14px;color:#5A544A;">${params.badgeDescription}</div>
          ${params.totalXP ? `<div style="display:inline-block;background:#EFE8DB;color:#B23A2E;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;margin-top:10px;">Total XP: ${params.totalXP.toLocaleString()} XP</div>` : ''}
        </div>
        <p>This badge is now proudly showcased on your student profile. Keep raising the bar!</p>
        ${renderButton('View Badge Showcase', `${env.FRONTEND_URL}/progress?tab=badges`)}
      `),
    })
    logger.info({ to, badge: params.badgeName }, 'Milestone badge email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send milestone badge email')
  }
}

/**
 * 4. Leaderboard Top 5 Notification
 * Celebrates student ranking amongst the Top 5 scholars.
 */
export async function sendLeaderboardTop5Email(
  to: string,
  params: { name: string; rank: number; xp: number },
): Promise<void> {
  if (!canSend()) return
  const firstName = params.name.split(' ')[0] || 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=1200&q=80'
  const medals = ['🥇', '🥈', '🥉', '⭐', '🌟']
  const medal = medals[params.rank - 1] ?? '🌟'

  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `🌟 Wow, ${firstName}! You're in the TOP 5 on the Leaderboard! (#${params.rank})`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Students celebrating victory" />
        <h1>You're in the Top 5 Scholars! ${medal}</h1>
        <p>Phenomenal work, ${firstName}! Your studying has catapulted you into the coveted <strong>Top 5</strong> on the Propella leaderboard.</p>
        <div style="background:#FAF7F2;border:2px solid #EBE4D8;border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
          <div style="font-size:36px;margin-bottom:6px;">${medal}</div>
          <div style="font-size:24px;font-weight:800;color:#B23A2E;letter-spacing:-0.02em;">Rank #${params.rank} Overall</div>
          <div style="font-size:14px;color:#7C766B;margin-top:4px;">${params.xp.toLocaleString()} XP earned this period</div>
        </div>
        <p>You're setting the pace for thousands of fellow scholars across the nation. Can you defend your spot on the podium?</p>
        ${renderButton('View The Leaderboard', `${env.FRONTEND_URL}/leaderboard`)}
      `),
    })
    logger.info({ to, rank: params.rank }, 'Leaderboard top 5 email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send leaderboard top 5 email')
  }
}

/**
 * 5. Quiz Completed
 * Summarizes quiz results, score, XP earned, and encouragement to review answers.
 */
export async function sendQuizCompletedEmail(
  to: string,
  params: {
    name: string
    quizTitle: string
    score: number
    totalQuestions: number
    correctCount: number
    xpAwarded: number
    quizId: string
    attemptId: string
  },
): Promise<void> {
  if (!canSend()) return
  const firstName = params.name.split(' ')[0] || 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80'

  const scoreMessage =
    params.score >= 80
      ? 'Outstanding mastery! You clearly know this material inside and out.'
      : params.score >= 50
        ? 'Great progress! Reviewing the questions you missed will turn those into permanent strengths.'
        : 'Every quiz exposes opportunities to learn. Review the explanations to level up for next time!'

  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `Quiz Complete: ${params.score}% on ${params.quizTitle}! 📝`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Student completing practice test" />
        <h1>Quiz Complete: ${params.score}% 📝</h1>
        <p>Hello ${firstName}, you just finished a practice quiz on <strong>${params.quizTitle}</strong>.</p>
        <table class="stat-table">
          <tr>
            <td class="stat-cell" style="width:33%;">
              <div class="stat-val" style="color:${params.score >= 70 ? '#1E7E34' : params.score >= 50 ? '#B23A2E' : '#B25900'};">${params.score}%</div>
              <div class="stat-lbl">Final Score</div>
            </td>
            <td class="stat-cell" style="width:33%;">
              <div class="stat-val">${params.correctCount} / ${params.totalQuestions}</div>
              <div class="stat-lbl">Correct</div>
            </td>
            <td class="stat-cell" style="width:33%;">
              <div class="stat-val">+${params.xpAwarded}</div>
              <div class="stat-lbl">XP Earned</div>
            </td>
          </tr>
        </table>
        <p>${scoreMessage}</p>
        ${renderButton('Review Answers & Explanations', `${env.FRONTEND_URL}/quizzes/${params.quizId}/results/${params.attemptId}`)}
      `),
    })
    logger.info({ to, score: params.score, quizId: params.quizId }, 'Quiz completed email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send quiz completed email')
  }
}

/**
 * 6. Mock Exam Completed
 * High-stakes exam simulation summary with full breakdown.
 */
export async function sendMockCompletedEmail(
  to: string,
  params: {
    name: string
    examType: string
    score: number
    totalQuestions: number
    correctCount: number
    xpAwarded: number
    attemptId: string
  },
): Promise<void> {
  if (!canSend()) return
  const firstName = params.name.split(' ')[0] || 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80'

  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `Your ${params.examType.toUpperCase()} Mock Exam Results: ${params.score}%! 🎯`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Exam preparation hall" />
        <h1>Your Mock Exam Results Are In! 🎯</h1>
        <p>Well done, ${firstName}! Completing a timed, full-length <strong>${params.examType.toUpperCase()}</strong> mock exam under pressure is the ultimate way to guarantee readiness on exam day.</p>
        <table class="stat-table">
          <tr>
            <td class="stat-cell" style="width:33%;">
              <div class="stat-val" style="color:${params.score >= 70 ? '#1E7E34' : '#B23A2E'};">${params.score}%</div>
              <div class="stat-lbl">Overall Score</div>
            </td>
            <td class="stat-cell" style="width:33%;">
              <div class="stat-val">${params.correctCount} / ${params.totalQuestions}</div>
              <div class="stat-lbl">Questions Right</div>
            </td>
            <td class="stat-cell" style="width:33%;">
              <div class="stat-val">+${params.xpAwarded}</div>
              <div class="stat-lbl">XP Bonus</div>
            </td>
          </tr>
        </table>
        <p>Review your subject-by-subject breakdown to pinpoint exactly where you gained marks and where you can pick up quick points before the real paper.</p>
        ${renderButton('View Mock Breakdown', `${env.FRONTEND_URL}/mocks`)}
      `),
    })
    logger.info({ to, score: params.score }, 'Mock exam completed email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send mock completed email')
  }
}

/**
 * 7. Pending / Overdue To-Dos Reminder
 * Gently prompts the student with their pending checklist items to build momentum.
 */
export async function sendPendingTodosEmail(
  to: string,
  params: {
    name: string
    tasks: Array<{ title: string; dueDate?: string | null | undefined }>
  },
): Promise<void> {
  if (!canSend() || params.tasks.length === 0) return
  const firstName = params.name.split(' ')[0] || 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80'

  const itemsHtml = params.tasks
    .slice(0, 5)
    .map(
      (t) =>
        `<div class="check-item">&#9744; <strong>${t.title}</strong>${
          t.dueDate ? ` <span style="font-size:12px;color:#9E4B00;">(Due: ${new Date(t.dueDate).toLocaleDateString()})</span>` : ''
        }</div>`,
    )
    .join('')

  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `You have ${params.tasks.length} study tasks waiting on your planner, ${firstName}! 📋`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Study planner notebook" />
        <h1>Your Study Tasks Are Waiting 📋</h1>
        <p>Hi ${firstName}, you created tasks on your Propella Study Planner that are ready to be checked off.</p>
        <div class="checklist">
          ${itemsHtml}
          ${params.tasks.length > 5 ? `<div style="font-size:12px;color:#7C766B;padding-top:8px;">+ ${params.tasks.length - 5} more tasks on your board</div>` : ''}
        </div>
        <p>Momentum begins with just one checkmark. Knock out even one quick task right now to get ahead of your schedule.</p>
        ${renderButton('Open Study Planner', `${env.FRONTEND_URL}/planner`)}
      `),
    })
    logger.info({ to, taskCount: params.tasks.length }, 'Pending tasks email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send pending tasks email')
  }
}

/**
 * 8. Streak Milestone Celebrated
 * Honors hitting 3, 7, 14, 30, 60, or 100 day study streaks.
 */
export async function sendStreakMilestoneEmail(
  to: string,
  params: { name: string; streakDays: number },
): Promise<void> {
  if (!canSend()) return
  const firstName = params.name.split(' ')[0] || 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80'

  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `🔥 Unstoppable! You just hit a ${params.streakDays}-day study streak, ${firstName}!`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Students in high energy classroom" />
        <h1>${params.streakDays} Days in a Row! 🔥</h1>
        <p>Incredible habit-building, ${firstName}! You have logged in and studied for <strong>${params.streakDays} consecutive days</strong>.</p>
        <div style="background:#FAF7F2;border:2px solid #EBE4D8;border-radius:10px;padding:24px;text-align:center;margin:20px 0;">
          <div style="font-size:40px;margin-bottom:4px;">🔥</div>
          <div style="font-size:28px;font-weight:800;color:#B23A2E;">${params.streakDays} Day Streak</div>
          <div style="font-size:13px;color:#7C766B;margin-top:4px;">Consistency is your superpower</div>
        </div>
        <p>You're building the exact discipline that separates top scholars from the rest. Keep the flame burning!</p>
        ${renderButton('Keep Your Streak Burning', `${env.FRONTEND_URL}/dashboard`)}
      `),
    })
    logger.info({ to, streakDays: params.streakDays }, 'Streak milestone email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send streak milestone email')
  }
}

export async function sendStreakWarningEmail(
  to: string,
  params: { streak: number; name?: string | undefined },
): Promise<void> {
  if (!canSend()) return
  const firstName = params.name ? params.name.split(' ')[0] : 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'

  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `🔥 Your ${params.streak}-day study streak is at risk, ${firstName}!`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Study streak warning" />
        <h1>Protect Your ${params.streak}-Day Streak! 🔥</h1>
        <p>Hi ${firstName}, you have built an impressive <strong>${params.streak}-day study streak</strong>. Don't let your hard work reset to zero!</p>
        <div style="background:#FAF7F2;border:2px solid #EBE4D8;border-radius:10px;padding:20px;text-align:center;margin:20px 0;">
          <div style="font-size:36px;margin-bottom:4px;">⏳</div>
          <div style="font-size:22px;font-weight:700;color:#B23A2E;">Study Before Midnight</div>
          <div style="font-size:13px;color:#7C766B;margin-top:4px;">Even a 5-minute quiz or 1 topic review keeps it alive.</div>
        </div>
        <p>A streak freeze will automatically protect you if one is available on your plan, but studying today guarantees your progress.</p>
        ${renderButton('Save My Streak Now', `${env.FRONTEND_URL}/dashboard`)}
      `),
    })
    logger.info({ to, streak: params.streak }, 'Streak warning email sent')
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
    name?: string | undefined
    studyHours: number
    currentStreak?: number | undefined
    topicsMastered: number
    avgScore: number
    weakTopics: string[]
  },
): Promise<void> {
  if (!canSend()) return
  const firstName = data.name ? data.name.split(' ')[0] : 'Scholar'
  const bannerUrl = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'

  const weakList =
    data.weakTopics.length > 0
      ? `<div style="background:#FAF7F2;border:1px solid #EBE4D8;border-radius:8px;padding:14px 18px;margin:16px 0;"><p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#1A1814;">Recommended focus for the coming week:</p><p style="margin:0;font-size:13px;color:#5A544A;">${data.weakTopics.slice(0, 3).join(', ')}</p></div>`
      : '<p style="font-size:14px;color:#1E7E34;"><strong>No critical weak spots detected this week.</strong> You are cruising!</p>'

  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to,
      subject: `Your Propella Study Week in Review, ${firstName} 📊`,
      html: base(`
        <img class="banner-img" src="${bannerUrl}" alt="Students reviewing progress" />
        <h1>Your Week in Review 📊</h1>
        <p>Great effort this week, ${firstName}! Here is a snapshot of your study activity and streak progress over the past 7 days:</p>
        <table class="stat-table">
          <tr>
            <td class="stat-cell" style="width:25%;">
              <div class="stat-val">${data.studyHours.toFixed(1)}h</div>
              <div class="stat-lbl">Study Time</div>
            </td>
            <td class="stat-cell" style="width:25%;">
              <div class="stat-val" style="color:#B23A2E;">${data.currentStreak ?? 0}🔥</div>
              <div class="stat-lbl">Streak</div>
            </td>
            <td class="stat-cell" style="width:25%;">
              <div class="stat-val">${data.topicsMastered}</div>
              <div class="stat-lbl">Mastered</div>
            </td>
            <td class="stat-cell" style="width:25%;">
              <div class="stat-val">${data.avgScore}%</div>
              <div class="stat-lbl">Avg Score</div>
            </td>
          </tr>
        </table>
        ${weakList}
        <p>Consistency is built week by week. Let's start the new week strong tomorrow!</p>
        ${renderButton('View Full Study Roadmap', `${env.FRONTEND_URL}/roadmap`)}
      `),
    })
    logger.info({ to }, 'Weekly digest email sent')
  } catch (err) {
    logger.error({ err, to }, 'Failed to send weekly digest email')
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
        <div style="background:#FAF7F2;border-radius:8px;border:1px solid #EBE4D8;padding:16px;margin:20px 0;">
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

export async function sendSubscriptionReceiptEmail(params: {
  to: string
  name: string
  planName: string
  amount: number
  reference: string
  expiresAt: Date
}): Promise<void> {
  if (!canSend()) return
  const firstName = params.name.split(' ')[0] || 'Scholar'
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to: params.to,
      subject: `Receipt: Your Propella Scholar Subscription (${params.planName}) 🎉`,
      html: base(`
        <h1>Thank you for your subscription! 🎉</h1>
        <p>Hello ${firstName},</p>
        <p>Your payment for <strong>${params.planName}</strong> has been successfully confirmed. You now have full Scholar access!</p>
        <div style="background:#FAF7F2;border-radius:8px;border:1px solid #EBE4D8;padding:16px;margin:20px 0;">
          <p style="margin:0 0 8px;font-size:14px;color:#1A1814;"><strong>Subscription Details:</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#4A463E;">Plan: <strong>${params.planName}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#4A463E;">Amount Paid: <strong>₦${params.amount.toLocaleString()}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#4A463E;">Valid Until: <strong>${params.expiresAt.toLocaleDateString()}</strong></p>
          <p style="margin:0;font-size:13px;color:#4A463E;">Reference: <code>${params.reference}</code></p>
        </div>
        <p>You can now enjoy:</p>
        <div class="checklist">
          <div class="check-item">&#10003; 6,994+ CBT past questions with step-by-step solutions</div>
          <div class="check-item">&#10003; Timed JAMB, WAEC &amp; NECO mock simulators</div>
          <div class="check-item">&#10003; Unlimited AI tutor messages &amp; document parsing</div>
          <div class="check-item">&#10003; 50-minute Pomodoro sessions in Marathon mode</div>
        </div>
        ${renderButton('Go to Dashboard', `${env.FRONTEND_URL}/dashboard`)}
      `),
    })
    logger.info({ to: params.to, reference: params.reference }, 'Subscription receipt email sent')
  } catch (err) {
    logger.error({ err, to: params.to }, 'Failed to send subscription receipt email')
  }
}

export async function sendGiftSubscriptionEmail(params: {
  to: string
  recipientName?: string | undefined
  senderName: string
  planName: string
  message?: string | undefined
  expiresAt: Date
}): Promise<void> {
  if (!canSend()) return
  const firstName = params.recipientName ? params.recipientName.split(' ')[0] : 'Scholar'
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to: params.to,
      subject: `🎁 ${params.senderName} has gifted you a Propella Scholar Subscription!`,
      html: base(`
        <h1>You Received a Gift Subscription! 🎁</h1>
        <p>Hello ${firstName},</p>
        <p>Exciting news! <strong>${params.senderName}</strong> has sponsored a <strong>${params.planName}</strong> for your studies on Propella.</p>
        ${
          params.message
            ? `<div style="background:#FAF7F2;border-left:3px solid #B23A2E;border-radius:4px;padding:14px;margin:20px 0;font-style:italic;color:#4A463E;">"${params.message}" &mdash; ${params.senderName}</div>`
            : ''
        }
        <div style="background:#FAF7F2;border-radius:8px;border:1px solid #EBE4D8;padding:16px;margin:20px 0;">
          <p style="margin:0 0 8px;font-size:14px;color:#1A1814;"><strong>Gift Package Details:</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#4A463E;">Package: <strong>${params.planName}</strong></p>
          <p style="margin:0;font-size:13px;color:#4A463E;">Active Until: <strong>${params.expiresAt.toLocaleDateString()}</strong></p>
        </div>
        <p>Log in or sign up with this email address (<strong>${params.to}</strong>) to immediately access all your premium features.</p>
        ${renderButton('Open Propella Study', `${env.FRONTEND_URL}/login`)}
      `),
    })
    logger.info({ to: params.to, senderName: params.senderName }, 'Gift subscription email sent')
  } catch (err) {
    logger.error({ err, to: params.to }, 'Failed to send gift subscription email')
  }
}

export async function sendSharedPlanInviteEmail(params: {
  to: string
  partnerName?: string | undefined
  senderName: string
  expiresAt: Date
}): Promise<void> {
  if (!canSend()) return
  const firstName = params.partnerName ? params.partnerName.split(' ')[0] : 'Scholar'
  try {
    await resend.emails.send({
      from: FROM,
      ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
      to: params.to,
      subject: `👥 ${params.senderName} shared their Propella Scholar Plan with you!`,
      html: base(`
        <h1>You're on the Shared Scholar Plan! 👥</h1>
        <p>Hello ${firstName},</p>
        <p>Awesome news! <strong>${params.senderName}</strong> purchased a Shared Plan on Propella and added you as their study partner.</p>
        <div style="background:#FAF7F2;border-radius:8px;border:1px solid #EBE4D8;padding:16px;margin:20px 0;">
          <p style="margin:0 0 8px;font-size:14px;color:#1A1814;"><strong>Shared Plan Access:</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#4A463E;">Shared by: <strong>${params.senderName}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#4A463E;">Full Scholar Access Valid Until: <strong>${params.expiresAt.toLocaleDateString()}</strong></p>
        </div>
        <p>Your account now has full Scholar access with all past questions, AI explanations, and mock exams enabled!</p>
        ${renderButton('Start Studying Now', `${env.FRONTEND_URL}/dashboard`)}
      `),
    })
    logger.info({ to: params.to, senderName: params.senderName }, 'Shared plan invite email sent')
  } catch (err) {
    logger.error({ err, to: params.to }, 'Failed to send shared plan invite email')
  }
}
