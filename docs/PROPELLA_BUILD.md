# PROPELLA — MASTER BUILD SPECIFICATION

> ### ⚠️ Stack superseded — read this first
>
> The persistence and AI layers described below have been replaced. This file is
> kept as the original design record; it is **not** the current architecture.
>
> | Area | This document says | Current |
> |---|---|---|
> | Database | MongoDB 7 + Mongoose 8 | **PostgreSQL** (Supabase / Neon) + **Prisma 7** |
> | Schema | `apps/api/src/models/*.ts` Mongoose schemas | `apps/api/prisma/schema.prisma`; jsonb shapes in `apps/api/src/models/types.ts` |
> | AI | Anthropic Claude (`claude-sonnet-4-5`, `claude-haiku-4-5`) | **Google Gemini** (`gemini-2.5-pro` quizzes, `gemini-2.5-flash` chat) |
> | AI env var | `ANTHROPIC_API_KEY` | `GEMINI_API_KEY` |
> | DB env var | `DATABASE_URL` (mongodb+srv://) | `DATABASE_URL` + `DIRECT_URL` (postgresql://) |
>
> Everything else — routes, XP rules, SM-2, design system, copy — still applies.
> See the [README](../README.md) for current setup.

---

> **For Claude Code:** This is your single source of truth for the entire Propella build. You will reference this file on EVERY task. When in doubt, re-read this. When tempted to make a design decision, this file already made it for you. Do not improvise on aesthetics, copy, or architecture — the decisions here are deliberate.
>
> Read sections 0–5 (Foundation, Stack, Architecture, Data Model, Design System) before writing a single line of code. They are non-negotiable.

---

## 0. WHAT WE ARE BUILDING

**Propella** is an AI-powered exam-preparation companion for Nigerian students sitting JAMB, WAEC, and NECO. The core insight: **students don't fail because they don't study — they fail because they don't study with enough structured repetition.** Propella builds a personalized, time-stamped study path that forces the right amount of repetition automatically, generates quizzes and mocks from the real syllabus, and uses gamification to keep students returning daily.

We are not building "Duolingo for exams." We are building a **disciplined study instrument** that happens to be motivating. The aesthetic and copy must reflect that — calm, confident, premium, slightly academic. Think Headway, Readwise, Notion. Not Duolingo, not Khan Academy, not Coursera marketing pages.

### Audience
- Nigerian secondary school students (ages 14–19)
- Exam retakers (often 18–24)
- They have constrained data, mid-tier Android phones predominantly, intermittent internet
- They are price-sensitive: ₦2,500/month is the upper bound of "casual purchase"
- They are aspirational: they want a product that feels expensive, not cheap

### What Propella does NOT do
- Does not pretend to replace teachers
- Does not use fear-of-failure marketing ("1.8M students fail JAMB!" — never)
- Does not have a mascot or character
- Does not use emojis anywhere in product UI
- Does not market in pidgin or local languages (English only for MVP, copy is global-English with Nigerian context implicit)

### Three exam paths (MVP)
1. **JAMB (UTME)** — 4 subjects: English + 3 chosen
2. **WAEC (SSCE)** — 8–9 subjects
3. **NECO (SSCE)** — same as WAEC flow, content nearly identical, label switch only

NECO uses the WAEC flow internally. We expose three options at onboarding, but JAMB has its own engine while WAEC and NECO share one. This is intentional and correct.

---

## 1. STACK (NON-NEGOTIABLE)

User has locked these. Do not propose alternatives.

### Frontend
- **Next.js 15** (App Router, React 19, TypeScript strict mode)
- **Tailwind CSS v4** (latest, using the new CSS-first config in `app/globals.css` via `@theme`)
- **shadcn/ui** as the component primitive layer — but heavily restyled per our design system, not stock
- **Lucide React** for icons (only icon library — no emojis, no other icon packs, no SVG illustrations beyond the wordmark)
- **TanStack Query v5** for server state
- **Zustand** for client state (auth, UI state, current study session)
- **React Hook Form + Zod** for forms and validation
- **Framer Motion** for motion (used sparingly and intentionally — see motion rules)
- **next-themes** for dark mode
- **date-fns** for dates (not dayjs, not moment)
- **Recharts** for charts (already integrates well with our design tokens)

### Backend
- **Express 4** in TypeScript
- **MongoDB 7+** via **Mongoose 8**
- **JWT auth** with refresh tokens stored in httpOnly cookies
- **bcrypt** for password hashing
- **Zod** shared between frontend and backend for validation schemas (publish via `packages/shared`)
- **Resend** for transactional email (cheap, simple, works in Nigeria)
- **node-cron** for the reminder/notification scheduler
- **pino** for structured logging
- **helmet, cors, express-rate-limit, express-mongo-sanitize** as security middleware

### AI
- **Anthropic Claude API** for: syllabus personalization, quiz generation, AI assistant chat, mock exam generation, weakness diagnosis
- We use `claude-sonnet-4-5` for quiz/syllabus generation (quality matters), `claude-haiku-4-5` for chat (speed and cost)
- AI calls go through the Express backend NEVER directly from the frontend — never expose the API key

### Deployment target
- Frontend: Vercel
- Backend: Railway or Render
- MongoDB: MongoDB Atlas (free tier for dev, M10 for production)

### Why this stack works despite the constraints
The user specified Express + MongoDB. I will not fight that. Instead:
- Mongoose schemas are written **defensively** — explicit types, indexes, validation. No loose `{ type: Object }` fields.
- We accept that some queries that would be one SQL join become two Mongo queries. The data access layer is built around this from day one.
- We **embed** small lookup data (syllabus topics inside subjects) and **reference** ledger data (XP events, quiz attempts). See section 4.

---

## 2. MONOREPO STRUCTURE

Use a pnpm workspace.

```
propella/
├── apps/
│   ├── web/                    # Next.js 15 app
│   └── api/                    # Express + Mongoose
├── packages/
│   ├── shared/                 # Zod schemas, TS types, constants shared between web and api
│   └── config/                 # eslint, tsconfig, prettier base configs
├── pnpm-workspace.yaml
├── package.json
├── PROPELLA_BUILD.md           # This file — symlink or copy at root
└── README.md
```

### apps/web structure (App Router)

```
apps/web/
├── app/
│   ├── (marketing)/            # Public pages
│   │   ├── page.tsx            # Landing
│   │   ├── pricing/page.tsx
│   │   ├── about/page.tsx
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── layout.tsx
│   ├── (onboarding)/
│   │   ├── onboarding/page.tsx        # The wizard, multi-step
│   │   └── layout.tsx
│   ├── (app)/                  # Authenticated app
│   │   ├── dashboard/page.tsx
│   │   ├── roadmap/page.tsx
│   │   ├── roadmap/[topicId]/page.tsx
│   │   ├── planner/page.tsx
│   │   ├── study/[sessionId]/page.tsx     # Active study session
│   │   ├── marathon/page.tsx              # Marathon mode landing
│   │   ├── marathon/[runId]/page.tsx      # Active marathon
│   │   ├── quizzes/page.tsx
│   │   ├── quizzes/[quizId]/page.tsx
│   │   ├── quizzes/[quizId]/results/page.tsx
│   │   ├── mocks/page.tsx
│   │   ├── mocks/[mockId]/page.tsx
│   │   ├── assistant/page.tsx
│   │   ├── progress/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   ├── settings/page.tsx
│   │   └── layout.tsx                     # App shell: sidebar + topbar
│   ├── api/                    # Next-side proxies only (not real backend)
│   ├── globals.css
│   ├── layout.tsx              # Root layout, fonts, theme provider
│   └── not-found.tsx
├── components/
│   ├── ui/                     # shadcn primitives (button, card, input, etc.)
│   ├── shell/                  # AppShell, Sidebar, TopBar, MobileNav
│   ├── marketing/              # Landing-only components
│   ├── onboarding/             # Wizard steps
│   ├── dashboard/              # Dashboard cards
│   ├── roadmap/                # Roadmap timeline, TopicNode, MilestoneCard
│   ├── planner/                # Calendar, TaskCard, SessionCard
│   ├── study/                  # StudyTimer, FocusOverlay, NoteEditor
│   ├── marathon/               # MarathonHUD, PomodoroRing
│   ├── quiz/                   # QuestionCard, OptionButton, QuizResults
│   ├── assistant/              # ChatThread, MessageBubble, Composer
│   ├── gamification/           # XPCounter, StreakFlame (no emoji — use Lucide Flame), RankBadge
│   ├── progress/               # Charts, AnalyticsCard
│   └── common/                 # Logo, EmptyState, ErrorState, LoadingState
├── lib/
│   ├── api-client.ts           # Fetch wrapper for backend
│   ├── auth.ts
│   ├── query-client.ts         # TanStack Query setup
│   ├── stores/                 # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── session-store.ts
│   │   └── ui-store.ts
│   ├── hooks/
│   │   ├── use-current-user.ts
│   │   ├── use-roadmap.ts
│   │   ├── use-streak.ts
│   │   ├── use-xp.ts
│   │   └── ...
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── format-date.ts
│   │   ├── format-naira.ts
│   │   └── calculate-rank.ts
│   └── constants.ts
├── public/
│   └── fonts/                  # Self-hosted font files
├── tailwind.config.ts          # Minimal — most lives in @theme
├── next.config.ts
└── package.json
```

### apps/api structure (feature-based, not layer-based)

```
apps/api/
├── src/
│   ├── server.ts               # Entry point
│   ├── app.ts                  # Express app config
│   ├── config/
│   │   ├── env.ts              # Zod-validated env vars
│   │   ├── db.ts               # Mongoose connection
│   │   └── logger.ts
│   ├── middleware/
│   │   ├── auth.ts             # JWT verify
│   │   ├── error-handler.ts
│   │   ├── rate-limit.ts
│   │   └── validate.ts         # Zod request validation
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts
│   │   ├── users/
│   │   ├── subjects/           # Static syllabus reads
│   │   ├── onboarding/
│   │   ├── roadmap/
│   │   ├── planner/
│   │   ├── sessions/           # Study sessions
│   │   ├── quizzes/
│   │   ├── mocks/
│   │   ├── assistant/          # AI chat
│   │   ├── gamification/       # XP, streaks, badges, ranks
│   │   ├── marathon/
│   │   ├── reminders/
│   │   └── progress/
│   ├── models/                 # Mongoose schemas
│   │   ├── User.ts
│   │   ├── ExamProfile.ts
│   │   ├── Subject.ts
│   │   ├── Topic.ts
│   │   ├── Roadmap.ts
│   │   ├── StudySession.ts
│   │   ├── Quiz.ts
│   │   ├── QuizAttempt.ts
│   │   ├── MockExam.ts
│   │   ├── ChatThread.ts
│   │   ├── XPEvent.ts
│   │   ├── Streak.ts
│   │   ├── Badge.ts
│   │   ├── MarathonRun.ts
│   │   └── Reminder.ts
│   ├── lib/
│   │   ├── anthropic.ts        # Claude client wrapper
│   │   ├── prompts/            # All AI prompts as separate files
│   │   │   ├── syllabus-personalization.ts
│   │   │   ├── quiz-generation.ts
│   │   │   ├── mock-generation.ts
│   │   │   └── assistant-system.ts
│   │   ├── scheduler.ts        # node-cron jobs
│   │   ├── spaced-repetition.ts # SM-2 implementation
│   │   └── adaptive-engine.ts  # Roadmap recomputation
│   ├── seeds/
│   │   ├── jamb-syllabus.ts    # Real JAMB syllabus seed
│   │   ├── waec-syllabus.ts
│   │   ├── neco-syllabus.ts
│   │   └── badges.ts
│   └── types/
└── package.json
```

---

## 3. DESIGN SYSTEM

This is the most important section. Read it twice.

### Aesthetic direction: "Editorial-Academic"

We are designing the kind of product a serious student opens at 6am. Print-influenced, calm, confident. The references are **Readwise Reader**, **Notion's marketing site**, **Linear's app UI**, **Stripe Press**, **Headway** (for the gamification touches but stripped of cartoon energy).

The product looks like a well-designed academic notebook crossed with a private research dashboard.

### What we explicitly avoid (NON-NEGOTIABLE)

- ❌ Purple-to-blue or pink-to-purple gradients
- ❌ Glassmorphism on cards, modals, or backgrounds (one tiny exception: see section 3.7)
- ❌ Generic indigo/violet primary — we use a single warm earthen tone instead
- ❌ Three-column feature grids with circular lucide-icon avatars (the AI-SaaS landing page cliché)
- ❌ Stock Unsplash photography of "diverse students smiling at laptops"
- ❌ Emojis — ANYWHERE in the product. The brief is explicit. Lucide icons only. If you feel an urge to put a 🔥 or ✨ or 🎯 anywhere, stop.
- ❌ The word "Welcome" as a heading. Ever.
- ❌ Phrases like "Get started in seconds", "Built for [X]", "Powered by AI", "Unleash your potential", "Supercharge your learning"
- ❌ Centered hero text with a "Get Started →" CTA and three feature cards below it
- ❌ Inter as a display font (Inter is fine as body in a pinch, but never headlines)
- ❌ `border-radius: 12px` on every card (we use a deliberate radius system, mostly smaller)
- ❌ Shadows that look like "soft drop shadow at 25% opacity blur 24" — we use sharper, smaller shadows, or none
- ❌ Loading spinners — use skeleton states or the progress shimmer described below

### What we do (NON-NEGOTIABLE)

- ✅ A serif display font paired with a refined sans body
- ✅ A warm, near-monochrome canvas with ONE bold accent used sparingly
- ✅ Generous whitespace, with controlled density only in functional areas (planner grid, quiz)
- ✅ Type-driven hierarchy — size and weight do the work, not color and color
- ✅ Numbers (XP, streaks, percentages) get the display serif treatment — they are the heroes
- ✅ Sharp, intentional shadows where used; mostly no shadow, just hairline borders
- ✅ Asymmetric layouts on marketing — left-aligned hero, no dead-centered everything
- ✅ Subtle motion — a fade-up on first paint, a number counter on first view, that's it. No constant micro-interactions.

### 3.1 Brand

**Logo:** Wordmark only — no symbol, no mark. The word "Propella" set in our display serif at a weight of 500, with a custom kerning adjustment that pulls the `ll` slightly together. Treat the wordmark as the brand asset. Render it in a dedicated `<Logo />` component.

The "P" can be the favicon, set in the display serif at 800 weight on the accent color background.

### 3.2 Color tokens

Define these in `apps/web/app/globals.css` using Tailwind v4's `@theme` directive. **These exact values, no improvisation.**

```css
@theme {
  /* === Surfaces (light theme) === */
  --color-paper:        #FBF9F4;   /* App background — warm off-white, the "page" */
  --color-paper-2:      #F4F1EA;   /* Sunken surface (sidebar, input bg) */
  --color-paper-3:      #ECE7DD;   /* Subtle elevation, hover states */
  --color-card:         #FFFFFF;   /* Cards sit slightly above paper */
  --color-ink:          #1A1814;   /* Primary text — nearly-black with brown undertone */
  --color-ink-2:        #4A463E;   /* Secondary text */
  --color-ink-3:        #7C766B;   /* Tertiary text, captions */
  --color-rule:         #E5DFD2;   /* Hairline borders */
  --color-rule-2:       #D9D2C2;   /* Stronger borders */

  /* === Accent — "Ink Red" === */
  /* A deep, slightly desaturated crimson. Used for primary CTAs, active states,
     XP counter, streak number, key highlights. Used SPARINGLY.
     Reads as serious, academic, "marked-in-red-pen". Not festive. */
  --color-accent:       #B23A2E;
  --color-accent-2:     #8E2B22;   /* Hover/pressed */
  --color-accent-tint:  #F7E8E5;   /* Backgrounds for accent-tinted areas */

  /* === Functional === */
  --color-success:      #2F6B3F;   /* Forest green, never used as a brand color */
  --color-warning:      #B87A1F;   /* Amber-brown */
  --color-danger:       #A82F2F;   /* Slightly different from accent to stay distinguishable */

  /* === Subject hues === */
  /* Used ONLY as small left-border bars or 8px circular markers next to subject names.
     Never as a card background. Never as a fill. Muted, paper-friendly. */
  --color-subj-english:     #3F5B7F;
  --color-subj-math:        #6B4E8F;
  --color-subj-physics:     #2F6B6B;
  --color-subj-chemistry:   #8E5A2B;
  --color-subj-biology:     #4F7A3F;
  --color-subj-economics:   #8E7F2B;
  --color-subj-government:  #8E3F5A;
  --color-subj-literature:  #5A3F8E;
  --color-subj-default:     #7C766B;

  /* === Type === */
  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-sans:    "Geist", ui-sans-serif, system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", ui-monospace, monospace;

  /* === Radii === */
  /* Deliberately small — print-influenced. No 16px rounded-everything. */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;  /* used only on modals and the largest containers */
  --radius-full: 9999px;

  /* === Shadows === */
  /* Most cards have NO shadow. Use borders. These are for elevation moments only. */
  --shadow-sm: 0 1px 0 0 rgba(26,24,20,0.04), 0 1px 3px rgba(26,24,20,0.06);
  --shadow-md: 0 2px 4px rgba(26,24,20,0.06), 0 4px 12px rgba(26,24,20,0.08);
  --shadow-lg: 0 8px 24px rgba(26,24,20,0.12), 0 2px 6px rgba(26,24,20,0.08);
  --shadow-inset: inset 0 1px 0 0 rgba(255,255,255,0.6);
}

/* Dark theme — warm dark, not slate-black */
[data-theme="dark"] {
  --color-paper:        #14130F;
  --color-paper-2:      #1C1A15;
  --color-paper-3:      #25221C;
  --color-card:         #1A1813;
  --color-ink:          #F4F0E6;
  --color-ink-2:        #BAB3A2;
  --color-ink-3:        #7C766B;
  --color-rule:         #2D2A23;
  --color-rule-2:       #3A362D;

  --color-accent:       #D8584A;   /* Lifted slightly for contrast on dark */
  --color-accent-2:     #BC4438;
  --color-accent-tint:  #2A1A17;
}
```

### 3.3 Typography

**Fonts (self-host all of them in `/public/fonts`):**

- **Fraunces** (Google Fonts, variable) — display. We use weights 400, 500, 600, 700, with OPSZ axis tuned for size.
- **Geist** (Vercel, free) — sans body. Weights 400, 500, 600.
- **JetBrains Mono** — monospace, for small caps labels and numerical IDs.

**Scale (mobile-first, scale up on lg breakpoint):**

```
display-2xl:  clamp(2.5rem, 6vw, 4.5rem)    Fraunces 500, line-height 0.95, tracking -0.02em
display-xl:   clamp(2rem, 4.5vw, 3.5rem)    Fraunces 500, line-height 1.0, tracking -0.02em
display-lg:   clamp(1.75rem, 3vw, 2.5rem)   Fraunces 500, line-height 1.05, tracking -0.015em
display-md:   1.75rem (28px)                Fraunces 500, line-height 1.15
heading-lg:   1.375rem (22px)               Geist 600, line-height 1.3, tracking -0.01em
heading-md:   1.125rem (18px)               Geist 600, line-height 1.4
heading-sm:   1rem (16px)                   Geist 600, line-height 1.4
body-lg:      1.0625rem (17px)              Geist 400, line-height 1.6
body:         0.9375rem (15px)              Geist 400, line-height 1.55
body-sm:      0.875rem (14px)               Geist 400, line-height 1.5
caption:      0.8125rem (13px)              Geist 500, line-height 1.4
overline:     0.6875rem (11px)              JetBrains Mono 500, tracking 0.08em, uppercase
numeric-xl:   3.5rem (56px)                 Fraunces 600, tabular-nums, line-height 1
numeric-lg:   2rem (32px)                   Fraunces 600, tabular-nums, line-height 1
numeric-md:   1.5rem (24px)                 Fraunces 600, tabular-nums, line-height 1
```

**Rules:**
- Display serif (Fraunces) is used for: page headlines, large numbers (XP, streak count, percentage scores), section H1s on marketing.
- Geist is used for everything else.
- JetBrains Mono is used for: form labels (overline style), table headers in tables, timestamp display, exam codes (e.g. `UTME-2026`).
- Body text never goes below 14px in product UI. Captions to 13px maximum reduction.
- Use `font-feature-settings: "ss01", "tnum"` on Fraunces for numerics; the alternate digits look better and are tabular.

### 3.4 Spacing & layout

Standard 4px base. Use Tailwind's spacing scale but constrain yourself to: `1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64`.

**Container widths:**
- Marketing pages: max-w-[1200px], mx-auto, px-6 lg:px-8
- App pages: max-w-[1400px], with sidebar (260px) + main content
- Reading/study content: max-w-[680px] inside main — narrow for readability
- Forms (onboarding, settings): max-w-[480px]

**Grid:**
- Marketing hero: 12-column, asymmetric — content takes columns 1–7, visual element takes 8–12 (or none — sometimes the hero is just type)
- Dashboard: a 12-column grid where cards span specific column counts; see dashboard layout spec

### 3.5 Components — the shadcn baseline

We install shadcn but restyle aggressively. Specific rules:

**Button**
- `default` (primary): bg `--color-ink`, text `--color-paper`, radius `--radius-sm`, font Geist 500 14px, px-4 py-2.5. Hover: brightness +5%. Active: scale 0.98.
- `accent` (used for "Start Study", "Begin Mock"): bg `--color-accent`, text white, same shape as primary.
- `secondary`: bg `--color-paper-2`, border `--color-rule-2`, text `--color-ink`, same shape.
- `ghost`: no bg, text `--color-ink-2`, hover bg `--color-paper-3`.
- `link`: text `--color-accent`, underline on hover with `text-decoration-thickness: 1px; text-underline-offset: 3px;`
- Size variants: `sm` (px-3 py-1.5 text-[13px]), default, `lg` (px-5 py-3 text-[15px]).
- **No icon-only buttons unless inside a toolbar.** Icons go to the LEFT of text with `gap-2`.

**Card**
- bg `--color-card`, border `1px solid --color-rule`, radius `--radius-md`, padding `p-6`. NO shadow by default.
- Variant `elevated` adds `--shadow-sm`.
- Variant `flush` removes the border, sits directly on paper.

**Input / Select / Textarea**
- bg `--color-paper-2`, border `1px solid --color-rule-2`, radius `--radius-sm`, padding `px-3.5 py-2.5`, text Geist 400 15px.
- Focus: border `--color-ink`, ring `0 0 0 3px --color-paper-3`. No accent-color focus ring.
- Label sits above with the `overline` style, mb-2.
- Error: border `--color-danger`, error text below in 13px `--color-danger`.

**Avatar**
- Initial-based by default — first letter of name on `--color-paper-3`, text `--color-ink`. Geist 600.
- Optional uploaded image. No default illustrated avatars.

**Badge / Pill**
- Small caps pill: JetBrains Mono 11px tracking-wide, px-2 py-0.5, radius-full.
- Variants: `default` (paper-3 bg, ink-2 text), `accent` (accent-tint bg, accent text), `success`, `warning`, `danger`.

**Skeleton (for loading)**
- bg `--color-paper-3`, pulse animation that goes from 100% to 60% opacity over 1.4s.
- NEVER use a spinner. Always skeletons that match the shape of the content.

**Toast**
- Bottom-right, slide up + fade, max-w-[360px]. Uses Card styling with a left border accent in the variant color (success = green left border, etc.).

### 3.6 Motion rules

We are NOT a "delightful micro-interaction" product. Motion exists to convey state transitions, not to decorate.

- **Page transitions:** subtle fade + 8px translate-up, 220ms ease-out. Use Framer Motion's `LayoutGroup` on the app shell.
- **First paint on hero pages:** stagger children with 60ms delay, fade-up 16px, 400ms ease-out.
- **Number counters (XP, streak):** count from previous value to new value over 800ms, ease-out. Implement a `<NumberCounter>` component using `motion`'s `useMotionValue` + `useTransform`.
- **Streak fire / rank badge upgrade:** a one-time celebration when triggered — a subtle scale-up to 1.06 then 1.0 over 600ms. No confetti. No screen-wide effects.
- **Hover states:** 150ms ease. Color shifts only, no transforms on cards.
- **Reduced motion:** respect `prefers-reduced-motion` and disable all non-essential transitions.

### 3.7 The single approved use of subtle glass

On the marketing hero ONLY, a thin sticky nav that, when the user scrolls past 80px, gets a `backdrop-filter: blur(12px) saturate(120%)` with `background: rgba(251,249,244,0.78)` and a hairline bottom border. That's it. Nowhere else in the product.

### 3.8 Iconography

**Lucide React, always.** Stroke width `1.5` (the lighter weight reads more editorial than the default 2). Size defaults: 16px in body text, 18px in buttons, 20px in nav, 24px in feature/illustrative contexts.

Approved icons for the brand vocabulary (reuse these — don't constantly introduce new ones):
- `BookOpen` — Subject, study material
- `Compass` — Roadmap
- `Calendar` — Planner
- `ClipboardCheck` — Quiz
- `FileText` — Mock exam
- `Sparkles` — AI assistant (the one tasteful use of this icon)
- `Flame` — Streak
- `Trophy` — Rank, achievement
- `Target` — Goal, focus
- `Timer` — Marathon, focus session
- `TrendingUp` — Progress, analytics
- `Bell` — Reminders
- `Settings`, `User`, `LogOut`, `Search`, `ChevronRight`, etc.

**Never use:** `Rocket` (cliché), `Lightning` (cliché), `Star` (cliché), `Heart` (irrelevant), `Zap` (overused).

### 3.9 Dark mode

Required from day one, not bolted on. Use `next-themes` with the `data-theme` attribute. Default to system preference, allow user override in settings. Every component must be tested in both themes during the build — there is no "we'll fix dark mode later."

### 3.10 Responsive behavior

Mobile-first. Breakpoints (Tailwind defaults):
- `sm`: 640px
- `md`: 768px (sidebar appears here)
- `lg`: 1024px (multi-column dashboard)
- `xl`: 1280px

On mobile:
- Sidebar becomes a bottom tab bar with 5 items: Home (dashboard), Roadmap, Study (CTA — bigger, raised, this is the primary action), Quizzes, Profile.
- Top bar collapses to logo + streak counter + notification bell.
- Marathon mode is full-screen, no chrome.

---

## 4. DATA MODEL (MongoDB)

### Design philosophy
- Embed when the data is read together and updated together
- Reference when the data has independent lifecycle or grows unbounded
- Every document has `createdAt`, `updatedAt` (Mongoose timestamps)
- Use ObjectId for all references, never string IDs
- Every collection has the right indexes from day one — see each schema

### 4.1 User
```ts
{
  _id: ObjectId,
  email: string (unique, indexed, lowercase),
  passwordHash: string,
  name: string,
  avatarUrl?: string,
  // Onboarding state
  onboardingCompleted: boolean (default false),
  onboardingStep: number (default 0),
  // Subscription
  plan: "free" | "scholar" (default "free"),
  planExpiresAt?: Date,
  // Notification prefs
  notifications: {
    email: boolean,
    push: boolean,
    studyReminders: boolean,
    streakReminders: boolean,
    weeklyDigest: boolean
  },
  // Preferences
  theme: "system" | "light" | "dark",
  timezone: string (default "Africa/Lagos"),
  createdAt, updatedAt
}
```
Indexes: `email` (unique), `createdAt`.

### 4.2 ExamProfile (one-to-one with User, separate for cleanliness)
```ts
{
  _id, userId: ObjectId (unique, indexed),
  examType: "jamb" | "waec" | "neco",
  examDate: Date,
  // JAMB-specific
  intendedCourse?: string,         // e.g. "Medicine and Surgery"
  institutionType?: "university" | "polytechnic" | "college",
  // Subjects (embedded — small, always read together)
  subjects: [
    {
      subjectId: ObjectId,         // ref Subject
      slug: string,                // denormalized for fast read
      name: string,                // denormalized
      isWeak: boolean,
      isStrong: boolean,
      currentMastery: number (0-100),  // updated by adaptive engine
      lastStudiedAt?: Date
    }
  ],
  dailyStudyMinutes: number,
  preferredStudyWindow: { start: string, end: string }, // "HH:mm"
  learningStyle?: "visual" | "reading" | "practice" | "mixed",
  createdAt, updatedAt
}
```

### 4.3 Subject (master data — seeded, not user-created)
```ts
{
  _id, slug: string (unique),       // "mathematics"
  name: string,                     // "Mathematics"
  examTypes: ["jamb"|"waec"|"neco"][],
  description: string,
  hue: string,                      // hex, maps to --color-subj-*
  // Topics embedded — small fixed list per subject
  topics: [
    {
      _id: ObjectId,                // sub-document id, but addressable
      slug: string,                 // "quadratic-equations"
      name: string,
      order: number,                // sequence in syllabus
      description: string,
      estimatedMinutes: number,     // baseline study time
      prerequisiteSlugs: string[],  // adaptive engine respects these
      examWeight: number (0-1),     // how often this topic appears historically
      examTypes: ("jamb"|"waec"|"neco")[]
    }
  ],
  createdAt, updatedAt
}
```
Seed this fully on first deploy. JAMB syllabus is published — implement loaders in `apps/api/src/seeds/jamb-syllabus.ts`. We provide the seed data structure; the topic list comes from the official JAMB syllabus document. Start with: Mathematics, English, Physics, Chemistry, Biology, Government, Economics, Literature in English, Geography, Commerce, Agricultural Science.

### 4.4 Roadmap (one per user, regenerated when exam profile changes significantly)
```ts
{
  _id, userId: ObjectId (unique, indexed),
  generatedAt: Date,
  examDate: Date,
  totalWeeks: number,
  examReadiness: number (0-100),  // computed
  // Topic plan — references Subject.topics
  nodes: [
    {
      subjectSlug: string,
      topicSlug: string,
      // Scheduling
      plannedStartDate: Date,
      plannedEndDate: Date,
      // State
      status: "locked" | "ready" | "in-progress" | "completed" | "needs-revision",
      mastery: number (0-100),
      revisionsCompleted: number,
      revisionsScheduled: number,
      lastStudiedAt?: Date,
      nextRevisionAt?: Date,       // SM-2 driven
      sm2: {
        easeFactor: number,
        interval: number,
        repetitions: number
      },
      // Milestone flags
      isMilestone: boolean,        // every 5th topic, or end-of-subject
      milestoneLabel?: string
    }
  ],
  // Weekly targets
  weeklyTargets: [
    {
      weekStartDate: Date,
      topicsToComplete: number,
      minutesGoal: number,
      quizzesTargeted: number
    }
  ],
  createdAt, updatedAt
}
```
Indexes: `userId` unique, `nodes.plannedStartDate`.

### 4.5 StudySession
```ts
{
  _id, userId: ObjectId (indexed),
  topicRef: {
    subjectSlug: string,
    topicSlug: string
  },
  startedAt: Date,
  endedAt?: Date,
  durationSec: number,
  isMarathon: boolean,
  pomodoros?: number,
  status: "in-progress" | "completed" | "abandoned",
  notesMarkdown?: string,         // student's notes from the session
  xpAwarded: number,
  createdAt, updatedAt
}
```
Indexes: `userId + startedAt`, TTL not used.

### 4.6 Quiz
```ts
{
  _id, userId: ObjectId (indexed),
  type: "topic" | "subject" | "mixed" | "weakness",
  topicRef?: { subjectSlug, topicSlug },
  subjectSlug?: string,
  difficulty: "easy" | "medium" | "hard" | "adaptive",
  questionCount: number,
  timeLimit?: number,             // seconds, optional
  // Questions embedded (immutable once generated)
  questions: [
    {
      id: string,                 // local nanoid
      stem: string,
      options: [{ id: "A"|"B"|"C"|"D", text: string }],
      correctOptionId: string,
      explanation: string,        // generated alongside the question
      topicSlug: string,          // for analytics
      difficulty: "easy"|"medium"|"hard"
    }
  ],
  generatedByModel: string,
  createdAt
}
```
Indexes: `userId + createdAt`.

### 4.7 QuizAttempt
```ts
{
  _id, quizId: ObjectId (indexed), userId: ObjectId (indexed),
  startedAt, completedAt?,
  durationSec: number,
  answers: [
    { questionId: string, selectedOptionId: string, isCorrect: boolean, timeSpentSec: number }
  ],
  score: number,                  // 0-100
  byTopic: [
    { topicSlug: string, correct: number, total: number, masteryDelta: number }
  ],
  xpAwarded: number,
  createdAt
}
```

### 4.8 MockExam — like Quiz but bigger and timed
Same shape as Quiz with `type: "mock"`, `examType`, full-paper structure (e.g., 40 questions per subject × 4 subjects for JAMB), strict time limit.

### 4.9 ChatThread (AI Assistant)
```ts
{
  _id, userId: ObjectId (indexed),
  title: string,                  // AI-generated from first message
  messages: [
    {
      id: string,
      role: "user" | "assistant",
      content: string,            // markdown
      createdAt: Date,
      tokens?: number,
      attachedTopic?: { subjectSlug, topicSlug }
    }
  ],
  archivedAt?: Date,
  createdAt, updatedAt
}
```

### 4.10 XPEvent (ledger — append-only)
```ts
{
  _id, userId: ObjectId (indexed),
  source: "study_session" | "quiz" | "mock" | "marathon" | "streak_milestone" | "topic_completed" | "milestone_unlocked" | "daily_challenge",
  sourceId?: ObjectId,            // ref to the originating doc
  amount: number,
  reason: string,                 // human-readable
  multiplier?: number,            // e.g., 2x for marathon
  createdAt: Date (indexed)
}
```
The user's total XP is computed by aggregation on this collection. Do not store a denormalized total — it will drift. (Optional optimization: maintain a `User.cachedXP` updated atomically with each event, but treat the ledger as truth.)

### 4.11 Streak
```ts
{
  _id, userId: ObjectId (unique),
  currentStreak: number,
  longestStreak: number,
  lastActiveDate: Date,           // date only, no time, in user's timezone
  freezesAvailable: number,       // earned by paid plan or daily challenge
  freezesUsed: [Date],
  createdAt, updatedAt
}
```

### 4.12 Badge & UserBadge
Badges are seeded master data. UserBadge records earned ones.
```ts
// Badge (seed)
{ _id, slug, name, description, criteria, icon: "lucide-name", tier: "bronze"|"silver"|"gold" }

// UserBadge
{ _id, userId, badgeSlug, earnedAt }
```

### 4.13 MarathonRun
```ts
{
  _id, userId,
  startedAt, endedAt?,
  plannedDurationMin: number,
  actualDurationSec: number,
  pomodoroLength: number,         // default 25
  pomodorosCompleted: number,
  topicsCovered: [{ subjectSlug, topicSlug, durationSec }],
  xpAwarded: number,
  status: "running"|"paused"|"completed"|"abandoned",
  pauses: [{ at: Date, durationSec: number }],
  createdAt, updatedAt
}
```

### 4.14 Reminder
```ts
{
  _id, userId (indexed),
  type: "study_session"|"revision"|"mock"|"streak_warning"|"weekly_review",
  scheduledFor: Date (indexed),
  channel: "push"|"email",
  payload: { title: string, body: string, deeplink?: string },
  sentAt?: Date,
  status: "scheduled"|"sent"|"failed"|"cancelled",
  createdAt
}
```
Indexes: `scheduledFor + status` (for the cron query).

---

## 5. CORE ENGINES

### 5.1 Adaptive Roadmap Engine (`apps/api/src/lib/adaptive-engine.ts`)

**Purpose:** Generate the initial roadmap, then recompute node priorities after every quiz attempt and study session.

**Initial generation (on onboarding completion):**
1. Pull all topics for the user's exam type filtered by their selected subjects.
2. Sort topics within each subject by `order` (the syllabus order).
3. Compute total available study time: `(weeks until exam) × 7 × dailyStudyMinutes`.
4. Allocate time across topics weighted by `examWeight` and the user's marked weak/strong status (weak subjects get a 1.3× time multiplier, strong subjects 0.8×).
5. Assign `plannedStartDate` and `plannedEndDate` to each node sequentially, respecting prerequisites.
6. Mark the first node of each subject as `ready`, everything else as `locked` until prerequisite met.
7. Schedule first revision (`nextRevisionAt`) for 1 day after planned completion.
8. Tag every 5th completed topic in a subject as a milestone, plus end-of-subject as a milestone.

**Recomputation triggers:**
- Quiz attempt completed → update `mastery` for involved topics, recompute SM-2 intervals.
- Study session completed → update `lastStudiedAt`, advance `status` if mastery threshold reached.
- Day passed without expected session → mark missed, push subsequent nodes by ~1 day.
- User changes exam date → full regeneration.

**Mastery formula:**
```
mastery_new = mastery_old * 0.7 + quiz_correctness * 30
clamped to [0, 100]
```
A topic reaches `completed` status when mastery ≥ 80 AND at least 1 revision is done.

**SM-2 spaced repetition (implemented in `spaced-repetition.ts`):**
Standard SuperMemo-2 algorithm using performance grades 0–5 mapped from quiz percentage. Adjust easeFactor, interval, repetitions per node.

### 5.2 Quiz Generator (`apps/api/src/features/quizzes`)

Quizzes are generated via Claude API. Use this prompt structure (full prompt lives in `apps/api/src/lib/prompts/quiz-generation.ts`):

```
SYSTEM: You generate exam-prep quiz questions for Nigerian {EXAM_TYPE} candidates.
Adhere strictly to the {EXAM_TYPE} syllabus. Questions must reflect the style,
difficulty, and structure of past papers. Each question has exactly 4 options
(A, B, C, D) and exactly one correct answer. Explanations must teach, not
just state the answer — reference the relevant principle.

USER: Generate {N} questions on the topic "{TOPIC_NAME}" within {SUBJECT_NAME}
at {DIFFICULTY} difficulty. Avoid these previously-seen question stems:
{RECENT_STEMS_HASHED}. Return JSON matching this schema: {SCHEMA}.
```

Cache generated questions per `{subjectSlug, topicSlug, difficulty}` key for 24 hours to reduce cost. Add user's recently-seen question fingerprints to the prompt to avoid repetition.

### 5.3 AI Assistant (`apps/api/src/features/assistant`)

System prompt sets the persona: "You are Propella, a focused study companion for Nigerian secondary school students preparing for JAMB, WAEC, and NECO. Answer clearly and concisely. Use Nigerian curriculum examples where helpful. When a student asks about a topic in their syllabus, structure answers as: a 1–2 sentence definition, the core principle, a worked example, and 2 practice questions they can try. Never claim to know things you don't. Refuse off-topic requests politely (entertainment, off-curriculum subjects)."

Stream responses from Claude Haiku for speed. Persist full conversation to `ChatThread`.

### 5.4 XP & Gamification (`apps/api/src/features/gamification`)

**XP amounts (constants in `packages/shared`):**
- Complete a study session (≥ 15 min): 10 XP
- Complete a study session (≥ 25 min): 25 XP
- Complete a study session (≥ 45 min): 50 XP
- Complete a quiz: 5 XP per correct answer, max 50 XP per quiz
- Complete a mock exam: 100 XP base + 1 XP per percent score
- Marathon run (per pomodoro completed): 30 XP
- Marathon run with 4+ pomodoros: 150 XP bonus
- Maintain streak (daily, awarded at end of active day): 15 XP × min(streak/10, 5)
- Streak milestone (7, 14, 30, 60, 100 days): 200/500/1000/2500/5000 XP
- Complete a topic (mastery ≥ 80, 1+ revision): 75 XP
- Complete a roadmap milestone: 250 XP

**Ranks (cumulative XP thresholds):**
```
Novice      0
Apprentice  500
Scholar     2,000
Senior      6,000
Honours     15,000
First Class 35,000
Distinction 80,000
```
(I changed the rank names from the brief. "Beginner / Scholar / Exam Master" is generic. These ranks evoke the Nigerian university classification system, which the audience aspires to. This is the kind of detail that makes a product feel native.)

**Streak rules:**
- A "streak day" is any day with ≥ 1 completed study session OR ≥ 1 completed quiz with score ≥ 50%.
- Reset to 0 if a day is missed (UTC date in user's timezone).
- Free plan gets 1 streak freeze per month (auto-applied if a day is missed).
- Paid plan gets 4 freezes per month, plus 1 earnable freeze for completing a daily challenge.

**Daily challenges** (the cron job picks one per user per day from a pool):
- "Complete 1 quiz on your weakest subject"
- "Study for 30 uninterrupted minutes"
- "Revise 3 previously-completed topics"
- "Beat your last score on Topic X"
- Reward: 50 XP + 1 freeze (if not already at max)

### 5.5 Marathon Engine (`apps/api/src/features/marathon`)

Marathon = a long focused study run, configured upfront, with mandatory pomodoro breaks. Runs even with poor connectivity (frontend manages timer; only sync state at pause/break/end).

User configures:
- Total duration (30, 60, 90, 120 min)
- Pomodoro length (25 min default, 50 min available for paid)
- Subjects to rotate through (1+)

UI is full-screen, distraction-minimized. Single visible affordance: pause. A subtle 8px ring tracks pomodoro progress. After each pomodoro, a 5-minute break with a "take a breath" screen — no animations, no celebrations, just a calm message and a count-up timer.

### 5.6 Reminder Scheduler (`apps/api/src/lib/scheduler.ts`)

A `node-cron` job runs every 5 minutes:
1. Query `Reminder` collection for `status: scheduled` AND `scheduledFor <= now`.
2. Send each via the appropriate channel (email for now; web-push and FCM are post-MVP).
3. Mark `sent` or `failed`.

A separate daily job at 6 PM in user's timezone:
- Check users with no activity today + active streak. Send a "Don't break your streak" reminder.

A weekly job (Sunday evening) sends the weekly review email: summary of progress, weakest topics, next week's targets.

---

## 6. PAGE-BY-PAGE BUILD SPECIFICATION

For every page below, this section gives you: **layout, components used, copy, and behavior**. Build them in this order.

### 6.1 Marketing — Landing (`app/(marketing)/page.tsx`)

**Layout:** Single column on mobile, an editorial 12-column grid on desktop. NOT centered. Hero is left-aligned.

**Sections (in order, with exact copy):**

#### Sticky Top Nav
- Left: `<Logo />` (wordmark)
- Right: text links — "How it works", "Pricing", "Sign in", and primary button "Start studying"
- Becomes the one-approved-glass nav after scroll > 80px

#### Hero (asymmetric, columns 1–8 on lg)
Eyebrow overline (JetBrains Mono, accent color):
```
PROPELLA — FOR JAMB, WAEC & NECO CANDIDATES
```

Headline (Fraunces 500, display-2xl):
```
The structured way
to prepare for the
exam that matters.
```
*(Three lines, hard-broken on `<br>`. Each line on its own visual row. Tracking tight.)*

Subhead (Geist 400, body-lg, ink-2, max-w-[520px]):
```
Propella builds a personalized study path from the official syllabus, schedules
the revision your brain actually needs, and turns every spare hour into
measurable progress. Built for serious candidates.
```

CTAs:
- Primary "Start studying — it's free" (size lg, accent variant)
- Secondary "See how it works" (size lg, ghost, scrolls to next section)

Beneath CTAs, a small line in ink-3 caption:
```
No card required. 2,400+ topics across the JAMB, WAEC, and NECO syllabi.
```

On columns 9–12, a visual: a single composed card showing a sample roadmap node — a topic title in Fraunces, a small progress bar at 67%, a subject color marker, a `nextRevisionAt` line. Static composition, not interactive. This communicates the product better than any abstract illustration.

#### Section 2 — "The repetition problem" (full-width band, paper-2 bg)

Two-column grid (lg). Left column has a large Fraunces display-xl heading:
```
The problem isn't that you didn't study.
It's that you didn't study it enough times.
```

Right column has body copy in three short paragraphs:
```
Exam papers don't test how hard you tried. They test how many times you've
practiced the concept until it feels obvious.

Most preparation fails because it's linear: you study a topic once, move on,
and never see it again until the night before the paper. By then, half of it
is gone.

Propella forces the right amount of repetition. Every topic comes back at the
exact moment your retention curve says it should. The science is older than
you are. The execution is what's new.
```

#### Section 3 — How it works (three editorial steps, NOT three feature cards)

Layout: vertical timeline on mobile, three-step horizontal row on desktop, each step takes 4 columns. Each step is just: a JetBrains Mono numeral ("01"), a Fraunces heading-md, body copy. No icons, no card backgrounds. Hairline divider between steps.

```
01  Tell us where you're going

We ask for your exam (JAMB, WAEC, or NECO), your subjects, your exam date,
and how many hours you can study daily. That's it. Five minutes of
onboarding, no quiz, no aptitude test.

02  We build the path

Propella generates a topic-by-topic roadmap from the official syllabus,
balanced for your timeline and weighted toward subjects you marked as
weak. You'll see the whole route from today to exam day, with revision
already scheduled.

03  You study, we adapt

Every quiz you take, every session you complete, every topic you skip —
the roadmap updates. Topics you've mastered get less time. Topics you
struggle with come back sooner. The path you started with is not the
path you'll finish on.
```

#### Section 4 — Feature grid (but done editorially, not as cards)

Four features in a 2×2 grid on lg, single column on mobile. Each feature is:
- Small Lucide icon (size 20, stroke 1.5, accent color)
- Fraunces heading-md
- Geist body, 2–3 sentences max
- Hairline border between, no card background

Features (use these copy lines exactly):

**Adaptive roadmap** (`Compass` icon)
```
Your roadmap rebuilds itself after every quiz and every missed session.
The plan you started with is a starting point, not a contract.
```

**AI study companion** (`Sparkles`)
```
Ask anything in your syllabus and get an explanation written for the
Nigerian curriculum, not a generic answer. Concepts, worked examples,
and practice questions in one reply.
```

**Mock exams from real syllabi** (`FileText`)
```
Take full-length mocks structured like the actual paper, generated from
your specific subject combination. Get a marked breakdown, not just a
score.
```

**Marathon mode** (`Timer`)
```
Lock in for a 30, 60, or 120-minute focused run with built-in breaks.
Earn double XP. Use the long stretch you actually have on a Saturday.
```

#### Section 5 — Pricing (compressed, not the main pricing page)

A single line above two cards:
```
Free until you decide it's worth paying for.
```

Two cards side by side (lg), stacked on mobile:

**Free**
```
₦0 / month
- Full roadmap for one exam
- Up to 20 AI assistant messages per day
- 5 quizzes per day, unlimited mocks per month
- 1 streak freeze per month
- All core features

[ Start free ]
```

**Scholar — paid**
```
₦2,500 / month  ·  ₦18,000 / year (40% off)
- Everything in Free
- Unlimited AI assistant
- Unlimited quizzes
- Advanced analytics & weakness breakdown
- 4 streak freezes per month
- Marathon mode with 50-min pomodoros
- Priority access to new features

[ Start free, upgrade anytime ]
```

#### Section 6 — Final CTA band

Centered, but large and editorial. Fraunces display-xl:
```
Three months to exam day.
That's twelve weeks. That's enough.
```

Body below in ink-2:
```
The students who pass aren't smarter. They started earlier and they came
back to every topic until it was theirs. Start now.
```

Single primary CTA: "Build my roadmap"

#### Footer
Minimal. Wordmark, three columns: Product (links), Company (links), Legal (Privacy, Terms). © year line. No social icons unless we have accounts. No newsletter signup — premature.

### 6.2 Auth — Login & Signup

Centered single-card layouts on `--color-paper-2` background. Card max-width 440px, padding p-8.

**Login:**
- Heading (Fraunces heading-lg): "Sign in"
- Subhead (body-sm, ink-2): "Welcome back."
- Form: email, password, "Forgot password?" link right-aligned above password field
- Primary button full-width: "Sign in"
- Below: divider with "or" text, then "Sign in with Google" (OAuth button if implemented; otherwise omit)
- Bottom link: "New to Propella? Create an account →"

**Signup:**
- Heading: "Create your account"
- Subhead: "Five minutes to set up. Then we build your roadmap."
- Form: name, email, password (with strength indicator — a 4-segment bar that fills, no text adjectives like "Strong"), checkbox for terms
- Primary button: "Continue"
- Bottom: "Already have an account? Sign in"

Do NOT prompt for exam type or any other data on signup. That's onboarding.

### 6.3 Onboarding (`app/(onboarding)/onboarding/page.tsx`)

A multi-step wizard, single column, max-width 540px. A progress indicator at the top — NOT a percentage bar, just numbered segments ("Step 2 of 6") in JetBrains Mono overline style, with a thin progress bar underneath.

Each step has:
- A Fraunces heading-lg question
- A body-sm subhead explaining why we ask
- The input/control
- A "Continue" primary button
- A "Back" ghost button

#### Step 1: Choose exam
Question: "Which exam are you preparing for?"
Subhead: "We'll build a roadmap specifically for this exam's syllabus."
Three large radio cards stacked. Each card: exam name in Fraunces heading-md, body line below ("Unified Tertiary Matriculation Examination", etc.), and a `ChevronRight` on hover.
- JAMB (UTME)
- WAEC (SSCE)
- NECO (SSCE)

#### Step 2A: JAMB course path (only if JAMB)
Question: "What course do you intend to study?"
Subhead: "This helps us prioritize the right subject combination."
Searchable select with autocomplete from a list of common Nigerian university courses. Allow "Not decided yet."
Below: "What kind of institution?" — three pill buttons: University / Polytechnic / College of Education.

#### Step 2B: WAEC/NECO learning style (only if WAEC/NECO)
Question: "How do you study best?"
Subhead: "We'll lean your roadmap toward your strengths."
Four cards (single-select): Visual, Reading, Practice-heavy, Mixed.

#### Step 3: Subjects
Question (JAMB): "Choose your four subjects."
Subhead: "English is required. Pick three more."
Question (WAEC/NECO): "Choose all the subjects you'll write."
Subhead: "Most candidates take 8 to 9. You can edit this later."

A grid of subject chips, multi-select. English is pre-selected and disabled (locked) for JAMB. Show selected count vs required count in the corner.

Subject chip: a card with name in Geist 500 15px, a left border in the subject hue, a small `BookOpen` icon, and the topic count ("32 topics") in caption.

JAMB validation: must pick exactly 4 (1 fixed + 3). WAEC/NECO validation: minimum 8, maximum 9.

#### Step 4: Strengths & weaknesses
Question: "Which subjects do you find hardest?"
Subhead: "We'll spend more time on these."
Show each selected subject as a row with three radio options: Weak / Average / Strong. Default to Average. Visual: three small bars next to each subject, filled accordingly.

#### Step 5: Exam date
Question: "When is your exam?"
Subhead: "If the official date isn't set, choose your best estimate."
Native date input, but styled. Below the input, show in body-sm ink-2: "That's {weeks} weeks away — {days} days." Updates live.

If exam is < 4 weeks: show a caution note: "That's a tight runway. The roadmap will compress to fit, but daily commitment will be high."
If exam is > 9 months: "You have time. The roadmap will pace you so you don't burn out."

#### Step 6: Daily commitment
Question: "How much can you study each day?"
Subhead: "Be honest. The plan needs to fit your life."
A slider from 30 min to 6 hours, with a large Fraunces numeric display above showing the current value in hours+minutes. Default 2 hours.

Below: "Preferred study time?" — four pill buttons (multi-select): Early morning (5–8am), Morning (8–12), Afternoon (12–5), Evening (5–10pm).

#### Step 7: Generating
Full-screen state. Centered. Headline Fraunces display-md:
```
Building your roadmap…
```
Subhead body-sm ink-2:
```
Mapping {N} topics across {M} subjects over {weeks} weeks.
```
A subtle progress shimmer (not a spinner), and 4 lines that tick in as steps complete:
- "Reading your syllabus"
- "Calculating revision intervals"
- "Balancing across {N} subjects"
- "Setting up your dashboard"

Each ticks with a `Check` icon when done. When all four are done, auto-navigate to Dashboard with a one-time celebration: a quiet fade-in of the dashboard with the headline already visible.

### 6.4 App shell (`app/(app)/layout.tsx`)

**Desktop:**
- Left sidebar 260px fixed, paper-2 bg, right hairline border
- Sidebar contents (top to bottom):
  - Logo at top, padding 24px
  - Nav links — each is a row with a Lucide icon (size 18) and label (Geist 500 14px). Active state: ink text + accent left border (2px wide). Inactive: ink-2 text.
  - Nav: Dashboard, Roadmap, Planner, Quizzes, Mocks, Marathon, AI Assistant, Progress, Leaderboard
  - Bottom: User card — avatar + name + plan badge. Click opens a menu (Settings, Help, Sign out).
- Top bar: 56px, paper bg, bottom hairline. Contains: page title (Fraunces heading-lg), and right-side: streak counter (Lucide Flame + number in Fraunces, NO emoji), XP indicator, notifications bell, theme toggle.
- Main content area: paper bg, padding p-8.

**Mobile:**
- No sidebar. Bottom tab bar fixed, 64px tall, 5 items. Center item ("Study") is the primary CTA and is visually larger — a 56px round button raised 12px above the bar with accent bg, white `Compass` icon.
- Top bar: 48px, logo left, streak + bell right.

### 6.4.1 Mobile "Tools" hub

**Bottom tab bar order:** Home (`Home` icon → /dashboard), Roadmap (`Compass` → /roadmap), Study CTA (raised 56px accent circle, white `Compass` icon → /study/new), Tools (`LayoutGrid` → opens Tools sheet), Profile (`User` → /settings).

Quizzes is removed from the bar and moves into the Tools sheet. Most quiz starts happen from Roadmap and Dashboard anyway.

**Tools sheet behavior:**
- Tapping Tools opens a full-screen sheet sliding up from bottom, using Framer Motion: `y: '100%' → 0`, 280ms ease-out. Backdrop fades in to `rgba(0,0,0,0.4)`.
- Sheet uses paper background, full height minus 48px top inset.
- Top: a 36×4px rounded handle bar (paper-3 color), centered, 12px from top. Tapping or swiping down dismisses.
- Below handle: "Tools" in Fraunces heading-lg left, close button (`X`, ink-3) right. Hairline bottom border.
- Body: rows of min-height 64px. Each row: 40×40 icon box (paper-2 bg, radius-sm, Lucide icon 20px ink), name (Geist 500 16px ink) + description (body-sm ink-2), `ChevronRight` 18px ink-3. Hairline rule between rows (not on last).
- Row order: `BookOpen` Planner / `ClipboardCheck` Quizzes / `FileText` Mocks / `Timer` Marathon / `Sparkles` AI Assistant / `TrendingUp` Progress / `Trophy` Leaderboard.
- On navigate: dismiss sheet first, await 200ms, then push route. Prevents janky animation overlap.
- Component: `components/shell/tools-sheet.tsx`, mounted at app layout level.

**Tools tab active state:** active (ink color) when pathname is /planner, /quizzes, /quizzes/*, /mocks, /mocks/*, /marathon, /marathon/*, /assistant, /progress, or /leaderboard.

**Swipe to dismiss:** Framer Motion `drag="y"` with `dragConstraints={{ top: 0 }}`. Dismiss if `offset.y > 100 || velocity.y > 500`. Tapping backdrop also dismisses.

**Reduced motion:** falls back to instant open/close (no translate animation).

### 6.4.2 Sign out

Sign-out lives in three surfaces:

**Desktop — sidebar user card menu:**
At the bottom of the desktop sidebar, the user card is a clickable trigger that opens a small popover menu above it (anchored upward). Menu width matches the user card width minus side padding. Menu items in this exact order, each a row with a Lucide icon (16px, ink-2) and label (Geist 500 14px):

- `User` — "Profile" → /settings
- `CreditCard` — "Plan & billing" → /settings?tab=plan
- `Bell` — "Notifications" → /settings?tab=notifications
- `LifeBuoy` — "Help & support" → /help
- Hairline divider (`--color-rule`)
- `LogOut` — "Sign out" → triggers confirmation dialog (text and icon in `--color-danger`; hover bg `--color-accent-tint`)

Menu styling: paper-2 bg, `--color-rule` border, radius-md, shadow-md. Padding py-1. Each row px-3 py-2, hover bg `--color-paper-3`.

**Mobile — settings page bottom:**
The `/settings` page has a sign-out section below all tab content:
- Full-width button, danger styling: `--color-card` bg, 1px solid `--color-danger` border, `--color-danger` text, radius-sm, py-3
- Lucide `LogOut` icon (16px, danger) left of label, gap-2
- 32px gap above this section from the last tab card
- Below button: caption "Signed in as {user.email}" in ink-3 centered, font-size 12px
- Below that: "Propella v1.0.0" in ink-3 centered, font-size 12px

The settings page reads `?tab=` query param on mount to support deep-linking from the sidebar menu.

**Confirmation dialog (both surfaces):**
Tapping Sign out from either surface opens a confirmation dialog:
- Icon: 40×40 accent-tint circle with `LogOut` icon (18px, danger)
- Title (Fraunces 20px 500): "Sign out of Propella?"
- Body (14px ink-2): "You can sign back in anytime. Your streak and progress are saved."
- Two buttons right-aligned: "Cancel" (ghost variant) and "Sign out" (danger styling, inline)
- Dialog: card bg, rule border, radius-md, shadow-md, width min(400px, 100vw-32px), centered in viewport
- Backdrop: rgba(0,0,0,0.45), z-index 200; dialog z-index 201

On confirm:
1. Call `POST /auth/logout` (clears httpOnly refresh cookie server-side; returns 204)
2. `queryClient.clear()` — clears all TanStack Query cache
3. `logout()` — clears Zustand auth store (token, user, isAuthenticated)
4. `router.push('/login')` — redirect to sign-in, NOT to /

**Backend `POST /auth/logout`:**
- Reads refresh token from httpOnly cookie
- Clears the refresh token cookie on the response (same name, same options, maxAge 0)
- Returns 204 No Content — no body
- Idempotent: calling when already signed out returns 204, not 401

Component: `components/auth/sign-out-dialog.tsx`

### 6.5 Dashboard (`app/(app)/dashboard/page.tsx`)

Layout: a 12-column grid on lg, 1 column on mobile. NOT a uniform card wall. Some cards span 8 cols, some span 4. Asymmetric.

**Above the grid:**
A subtle greeting line in body-sm ink-3 (NOT "Welcome back"):
```
Tuesday, May 12.
```
Below, in Fraunces display-md:
```
{N} days to {EXAM}.
```
*(e.g., "47 days to JAMB.")*

If exam is past, replace with "Exam day was {date}. Build a new roadmap →"

If no exam profile (edge case): redirect to onboarding.

**The grid (in order, with exact spans):**

#### 1. Today's focus (cols 1–8)
Card with no shadow, hairline border. Inside:
- Overline: "TODAY"
- Heading: "{N} topics scheduled · {minutes} min planned"
- A list of today's planned topics (max 5 shown). Each row:
  - Subject color bar (4px wide, 24px tall)
  - Topic name in Geist 500 15px
  - Status badge (e.g., "New", "Revision", "Quiz due")
  - Estimated time on the right in caption
  - Primary action button "Start" on the rightmost — only on the FIRST row that's ready
- Below the list: a single secondary button "View full planner →"

If no tasks today: show empty state "No sessions scheduled for today. Take the day, or [start a topic →]".

#### 2. Streak (cols 9–12)
Card. Center-aligned content.
- Large Fraunces numeric-xl: streak number
- Below, in body-sm ink-2: "day streak"
- Below that, a small `Flame` icon (lucide, size 16) plus the longest-streak in caption: "Longest: {N} days"
- Tiny progress dots showing the last 7 days (each day is a 6px dot — filled accent if studied, hollow ink-3 if not). The current day is slightly larger.

#### 3. XP & rank (cols 9–12, below streak)
Card.
- Overline: "RANK"
- Rank name in Fraunces heading-md (e.g., "Scholar")
- Below: a horizontal progress bar showing XP toward next rank, with the numeric values on either end. Bar is thin (4px), accent fill.
- Caption below: "{N} XP to {Next Rank}"

#### 4. Weakest topics (cols 1–6)
Card.
- Heading: "Where you're struggling"
- Subhead body-sm ink-2: "Topics with mastery below 50% — prioritize these next."
- List of top 3 weakest topics (rows with subject color bar, topic name, current mastery as a tiny inline bar + percentage on the right, and a "Practice →" link)
- If none below 50%, show: "Nothing critical right now. You're holding the line."

#### 5. Performance trend (cols 7–12)
Card.
- Heading: "Last 7 days"
- A small Recharts line chart showing daily quiz scores, area-filled with accent at 10% opacity, line in accent at full
- X axis: dates (mono font)
- Y axis: 0–100, hidden gridlines, just the line
- Summary text below: "Average score this week: {N}%" with a delta indicator (up/down arrow + percent change vs prior week)

#### 6. Upcoming revisions (cols 1–6)
Card.
- Heading: "Due for revision"
- A list of 3 topics with `nextRevisionAt` within 48 hours, each row showing subject + topic + the relative time ("In 6 hours", "Tomorrow morning")

#### 7. Mock readiness (cols 7–12)
Card.
- Heading: "Exam readiness"
- Large Fraunces numeric-lg: percentage
- Below it: a thin horizontal bar showing the same value, accent fill
- Caption: "Based on quiz history, mastery levels, and topics covered."
- Secondary button: "Take a mock →"

### 6.6 Roadmap (`app/(app)/roadmap/page.tsx`)

**Layout:** A vertical timeline. Single column, max-w-[820px], centered.

**Header:**
- Fraunces display-md: "Your roadmap"
- Subhead body ink-2: "{N} topics from today to {exam date}. {M} completed, {K} in progress, {L} ahead."

**Sub-nav:** Tab bar at top showing each subject as a pill, plus "All" first. Click filters the timeline to that subject.

**Timeline:**
- Vertical line on the left (1px, color rule), running the full length
- Each node is a row:
  - On the line: a 12px circle. Filled accent if completed, filled paper-3 with accent border if in-progress, hollow ink-3 border if locked, filled accent-tint if ready
  - To the right: a topic card. Subject color bar on its left edge. Inside the card:
    - Topic name in Fraunces heading-md
    - Subject name + topic order in caption: "Mathematics · Topic 7 of 32"
    - A row of meta info: status badge, mastery percentage, planned date range
    - For completed: a checkmark and the date completed
    - For in-progress: a thin mastery bar
    - For ready: a primary button "Start"
    - For locked: a caption "Unlocks after {prerequisite topic}"

**Milestones:**
Every 5th completed topic and end-of-subject node is a milestone. Render milestones differently:
- The node circle is a hollow ring with a small Lucide `Trophy` icon inside (16px)
- The card has a thin top border accent
- An overline "MILESTONE — {label}" above the topic name
- Reaching a milestone shows a one-time celebration on the dashboard (already covered in motion rules)

**Click on a node →** navigates to `/roadmap/[topicId]` topic detail.

### 6.7 Topic Detail (`app/(app)/roadmap/[topicId]/page.tsx`)

A reading-optimized layout. max-w-[680px] centered.

**Header:**
- Breadcrumb in caption: Roadmap / {Subject} / {Topic}
- Subject color bar + subject name overline
- Fraunces display-md: topic name
- Meta row: estimated time, planned date, mastery progress

**Body (tabs):**
- **Overview** — what this topic covers, key concepts list, learning objectives. Generated/seeded.
- **Study** — opens a study session for this topic, launches `/study/[sessionId]`
- **Practice** — opens a topic-quiz
- **Notes** — student's persisted notes (markdown editor), saved to `StudySession.notesMarkdown` rolled up to topic

**Right rail (lg only, otherwise stacks):**
- Revision schedule: next revision date, history of past revisions with scores
- Related topics (prerequisites and what unlocks)

### 6.8 Planner (`app/(app)/planner/page.tsx`)

Default view: this week. A 7-column calendar grid showing days. Each cell is a day with planned sessions stacked inside.

- Toggle at top: "Week" / "Day"
- Each session block: subject color top border, topic name, planned time
- Click a session block → opens a side panel with details and "Start", "Reschedule", "Skip" actions
- Drag-to-reschedule on desktop (use `@dnd-kit/core`)
- Empty cells show "Rest day" in ink-3 caption

### 6.9 Study Session (`app/(app)/study/[sessionId]/page.tsx`)

Full-screen reading layout. App shell is COLLAPSED while in a session (sidebar hidden, top bar minimal).

**Layout:** Two zones.
- Center: study content area, max-w-[680px]. Shows the topic notes/material in a clean reading style — Fraunces for headings within the content, body-lg for paragraphs, generous line-height. Markdown rendered with `react-markdown` and `remark-gfm`.
- Top-right: a small persistent HUD — timer (mono, large), pause button, "Done" button.
- Bottom-fixed: an action bar — "Take notes" (opens a slide-up sheet with a markdown editor), "Ask AI" (opens a side panel with the assistant pre-contexted on this topic), "Practice" (jumps to a quiz on this topic).

**On "Done":**
- Session is marked completed
- Shows a brief summary card (duration, XP earned) — fade in, dismiss after 4 seconds or on tap
- Returns to roadmap or dashboard

### 6.10 Quiz Engine (`app/(app)/quizzes/[quizId]/page.tsx`)

**Layout:** Centered, max-w-[680px].

**Top:**
- Caption: "Question {N} of {Total}"
- Thin progress bar (1px ink, fills as questions are answered)
- Timer in mono top-right (if timed)

**Question:**
- Question stem in Fraunces heading-md, 24px-26px
- Options as full-width buttons stacked. Each option: A/B/C/D letter in mono on the left, option text in body. Hover: slight bg shift. Selected: accent left border + accent-tint bg.

**Bottom action bar:**
- Left: "Previous"
- Right: "Next" or "Submit" (last question)

**Results page (`results`):**
- Headline Fraunces display-md: score percentage
- Subhead: "{correct} out of {total} correct in {time}"
- Breakdown by topic (if mixed quiz)
- Question review list — each question is a row, click to expand. Expanded view shows the question, your answer, correct answer, and the explanation in a clean editorial style.
- Below: "Practice again" (regenerates a fresh quiz on the same topic) and "Back to roadmap"

### 6.11 Marathon (`app/(app)/marathon/page.tsx` and `/marathon/[runId]`)

**Landing (`/marathon`):**
- Heading Fraunces display-md: "Marathon mode"
- Subhead: "Lock in for a long, uninterrupted study run. Earn 2× XP."
- Configure card:
  - Duration: 30 / 60 / 90 / 120 min toggle group
  - Pomodoro: 25 min (Free) or 50 min (Scholar)
  - Subjects: multi-select chips from user's enrolled subjects
- Primary button "Begin marathon" — opens the active run page

**Active (`/marathon/[runId]`):**
- Full-screen. Sidebar and top bar hidden completely.
- Centered:
  - Current topic (Fraunces display-md)
  - A circular ring (SVG, 240px diameter, 4px stroke) showing pomodoro progress. Inside the ring: time remaining in Fraunces numeric-xl.
  - Below the ring: pomodoro counter ("Pomodoro 2 of 4")
  - One button: "Pause" (ghost variant)
- During break: same layout but headline becomes "Take a breath. {N}-minute break." with a count-up timer.
- On complete: a quiet summary screen — Fraunces "Done." plus stats and XP earned.

### 6.12 AI Assistant (`app/(app)/assistant/page.tsx`)

**Layout:** Conversation-first. Two-column on lg (thread list 280px + chat area), single column on mobile.

**Chat area:**
- Top: small overline with thread title (or "New conversation")
- Messages stacked. User messages right-aligned with accent-tint bg, paper card. Assistant messages left-aligned, no bg, just text. Both 16px body-lg with markdown rendering.
- Bottom composer: a textarea with placeholder "Ask anything from your syllabus..." Auto-resizes to max 5 rows. Send button (accent variant) right.
- Suggested prompts above the composer (only when thread is empty) — 4 chip buttons drawn from the user's current weak topics. E.g., "Explain photosynthesis like I'm new to biology", "Walk me through quadratic equations", "What's the difference between covalent and ionic bonds?"

**Thread list:**
- "New conversation" button at top
- List of previous threads, ordered by last activity, showing title and last message preview in 2 lines

### 6.13 Progress (`app/(app)/progress/page.tsx`)

**Layout:** Single column, max-w-[1000px].

**Sections:**
1. **Overview** — four numbers in a row: Total study hours (Fraunces numeric-lg), Topics mastered, Quizzes taken, Average score. Each with a small mono overline label.
2. **Subject mastery** — a horizontal bar chart, one bar per subject, showing current mastery percentage. Bars are subject hue.
3. **Activity heatmap** — a Github-style heatmap of study days over the past 12 weeks. Squares are paper-3 for no activity, varying alpha of accent for activity (light to dark = more time).
4. **Score trend** — line chart over time.
5. **Weakest topics** — full table with topic, subject, mastery, last practiced, button to practice.

### 6.14 Leaderboard (`app/(app)/leaderboard/page.tsx`)

Tabs: This week / This month / All time. Each shows top 100 by XP. The user's own row is sticky at the top if they're not in the top 10.

Each row: rank number (mono), name + avatar, XP (Fraunces numeric-md), rank badge.

Default privacy: users opt-in to the leaderboard during onboarding step 6 (skipped in MVP — default opt-in but allow opt-out in settings). Show only first name + last initial.

### 6.15 Settings

Tabbed: Profile, Exam, Notifications, Plan, Privacy.

Standard form-based pages. Each setting save is autosaved with a toast confirmation.

### 6.16 Help & Support (`app/(app)/help/page.tsx`)

A single static page. No search, no categories. Editorial layout, same constraints as the rest of the app.

**Layout:** Single column, max-w-[680px], centered, px-6 py-12 md:py-16.

**Top section — Contact:**
- Heading (Fraunces display-md): "Help & support"
- Subhead (body-lg ink-2, max-w-[520px]): "Most things in Propella are designed to explain themselves. If something doesn't, we want to hear about it."
- 32px gap, then a contact card (full width, no shadow, 1px solid --color-rule, radius-md, p-6):
  - **Row 1 — Email** (entire row is a `mailto:support@propella.app` link):
    - Left: Lucide `Mail` icon (20px, ink-2) in 40×40 paper-2 square, radius-sm
    - Center: "Email us" Geist 600 15px, below it "support@propella.app" body-sm ink-2
    - Right: Lucide `ArrowUpRight` 16px ink-3
  - Hairline divider (`--color-rule`)
  - **Row 2 — Response time** (not a link):
    - Left: Lucide `Clock` icon (20px, ink-2) in same square treatment
    - Center: "Response time" Geist 600 15px, below it "Within 24 hours, Mon–Sat" body-sm ink-2
    - No right arrow

**FAQ section:**
- 48px gap below contact card
- Heading (Fraunces heading-lg): "Frequently asked"
- 24px gap, then collapsible FAQ items using shadcn Accordion (`type="single"` collapsible, `defaultValue="item-0"`)
- Styling: no card background, hairline dividers between items; trigger row question in Geist 500 16px ink, py-5 px-0, Lucide `Plus` 18px ink-3 on right that rotates 45° when expanded; content body-sm ink-2 leading-relaxed, pb-5 pr-8, max-w-[600px]

**FAQ entries (exact, in order):**
1. How is the roadmap generated? — "Propella reads the official JAMB, WAEC, or NECO syllabus for your selected subjects and lays out every topic between today and your exam date. Subjects you marked as weak get more time. Topics with higher historical exam weight are prioritized. The plan adapts after every quiz and study session — you'll never finish on the exact path you started on."
2. Can I change my exam date or subjects later? — "Yes. Go to Settings → Exam profile. Changing your exam date triggers a roadmap regeneration. Changing your subjects regenerates the affected portion. Your XP, streaks, and quiz history are preserved."
3. What happens if I miss a day? — "On the Free plan, you have one streak freeze per month — it applies automatically if you miss a day, so your streak stays intact. On Scholar, you get four freezes per month. If you're out of freezes, your streak resets to zero. Your roadmap and progress are not affected by missed days — only the streak counter."
4. How does Propella generate quiz questions? — "We generate questions using Claude (the AI model) constrained strictly to your syllabus topic and the difficulty you select. Questions are not pulled from past papers — they're original, written in the style of the exam. We deduplicate against questions you've recently seen so you don't get the same one twice."
5. Are the AI assistant's answers always correct? — "Mostly, but not always. The AI assistant is built on a model trained on a broad knowledge base and tuned for the Nigerian secondary school curriculum. If you spot an answer that conflicts with your textbook or class teacher, trust the textbook. Report the mistake using the feedback button below any assistant message."
6. Can I use Propella offline? — "Partially. Once a topic's content loads, you can read it offline. Study sessions and the marathon timer work offline and sync when you reconnect. AI assistant, quiz generation, and mocks require an internet connection."
7. How do I cancel my Scholar subscription? — "Settings → Plan & billing → Cancel subscription. You keep Scholar features until the end of your current billing period, then your account moves back to Free. Your data is not deleted."
8. I found a bug or have a feature request. — "Email us at support@propella.app with as much detail as you can — what you were doing, what happened, and a screenshot if relevant. We read every message."

**Bottom of page:**
- 48px gap below last FAQ
- Centered caption in ink-3 body-sm: "Propella v{appVersion} · Built in Nigeria"
- `{appVersion}` read from `package.json` at build time via `NEXT_PUBLIC_APP_VERSION` (injected in `next.config.ts`)

**Routing:** Authenticated only, `app/(app)/help/`. The sidebar "Help & support" menu item routes here.

**Marketing footer:** Add "Support" link (`mailto:support@propella.app`) to the Legal column. No separate unauthenticated help page.

**Mobile:** Same single-column layout; responsive padding (px-6 mobile, px-8 desktop) handles it automatically.

---

## 7. COPY VOICE & GLOSSARY

### Voice
- **Direct.** "Start studying" not "Begin your learning adventure."
- **Calm.** No exclamation points outside celebration moments. Never use multiple exclamation points.
- **Respectful of the reader's seriousness.** They are preparing for a high-stakes exam. Don't talk down.
- **Nigerian context, global English.** Use ₦ when showing prices. Reference JAMB, WAEC, NECO by name without explanation (the audience knows). Don't write "Naija" or pidgin in product copy. Don't add the Nigerian flag emoji ever.
- **No exclamation, no hype.** "You earned 50 XP" not "Awesome! You crushed it! +50 XP!"
- **Use Fraunces numerics for any time the number itself is the point.** "47 days to JAMB" — the 47 is the message.

### Words we use
- "Roadmap" (the master plan)
- "Topic" (the unit of study)
- "Session" (a single study sitting)
- "Mock" (a full practice exam)
- "Revision" (returning to a topic — not "review")
- "Mastery" (how well you know a topic)
- "Streak" (consecutive days)

### Words we don't use
- "Lessons" (we don't deliver lessons, we structure study)
- "Course" / "Curriculum" (this is exam prep, not a course)
- "Module"
- "Crush it", "Smash it", "Level up" (when used outside literal rank-up)
- "Welcome"
- "Awesome", "Great job", "Way to go"
- "Powered by AI" (we just use AI, we don't market it)

### Empty states (write these exactly)

| Surface | Empty copy |
|---|---|
| Dashboard, no sessions today | "No sessions scheduled. Rest day, or [start a topic →]." |
| Quizzes list, no attempts yet | "You haven't taken a quiz. Start with a topic you marked as weak." |
| AI assistant, new thread | "Ask anything from your syllabus. The shorter your question, the clearer the answer." |
| Mocks, no attempts | "Mocks reveal what daily study can't. Take one when you've covered at least 30% of your roadmap." |
| Leaderboard, no rank yet | "Earn 500 XP to appear on the board." |
| Progress, first day | "Come back in a few days. Progress needs something to compare against." |

### Error states

| Error | Copy |
|---|---|
| Network failure | "Couldn't reach Propella. Check your connection and try again." |
| Auth expired | "You've been signed out for security. Sign in again to continue." |
| AI assistant rate limit (free) | "You've used today's AI messages. They reset at midnight, or upgrade to Scholar for unlimited." |
| AI generation failed | "Something went wrong generating that. Try once more." |
| 404 | "We couldn't find that page." |
| 500 | "Something broke on our end. We've been notified. Try again in a moment." |

---

## 8. AUTH & SECURITY

- JWT access tokens (15 min) + refresh tokens (30 days) stored in httpOnly secure cookies
- bcrypt with cost factor 12
- Rate limit: 5 login attempts per IP per 15 min, 3 signup per IP per hour, 20 AI requests per user per minute
- All requests validated with Zod schemas BEFORE hitting handlers (middleware)
- CORS locked to the frontend origin
- helmet enabled with sensible defaults
- express-mongo-sanitize to prevent injection
- Never log passwords, never log token values
- env vars validated at boot with Zod; refuse to start if missing

---

## 9. TESTING & QUALITY

- **Vitest** for unit tests, mainly on the adaptive engine, SM-2, XP calculator, scheduler logic. These are the load-bearing pieces — they get test coverage.
- **Playwright** for E2E on critical flows: signup → onboarding → first session → first quiz → see roadmap update
- **TypeScript strict everywhere.** No `any`, no `as unknown as X` shortcuts. If you reach for those, the type model is wrong.
- **ESLint + Prettier** with the configs in `packages/config`
- **No console.logs in production code.** Use the `pino` logger on backend, `lib/logger.ts` (no-op in production) on frontend
- **Accessibility:** every interactive element has a visible focus state. Color contrast WCAG AA minimum (most of our paper-on-ink combos exceed AAA). Use semantic HTML. ARIA only where needed (it usually isn't if you use the right tag).

---

## 10. ENV VARS

```
# Frontend (apps/web/.env.local)
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_URL=

# Backend (apps/api/.env)
NODE_ENV=
PORT=
DATABASE_URL=                 # mongodb+srv://...
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ANTHROPIC_API_KEY=
RESEND_API_KEY=
FRONTEND_URL=
COOKIE_DOMAIN=
```

---

## 11. BUILD ORDER

Build in this exact sequence. Do not skip ahead. Each phase ends with a working, demoable state.

### Phase 0 — Foundation (must be perfect before anything else)
1. Initialize monorepo, pnpm workspaces, shared package
2. Set up Next.js 15 + Tailwind v4 + shadcn baseline
3. Set up Express + Mongoose, MongoDB connection, health check route
4. Implement design system: globals.css with all tokens, fonts loaded, light/dark working
5. Build the `<Logo />`, `<Button />`, `<Card />`, `<Input />`, `<NumberCounter />` primitives and verify against the spec by hand
6. Build a `/design-system` route in the web app showing every primitive in both themes — keep this as a living reference page (do not delete it)

### Phase 1 — Auth + Onboarding
7. Build signup, login, forgot password (email send may be stubbed initially)
8. JWT middleware, refresh token rotation
9. Build the onboarding wizard, all 7 steps, with state persisted to backend after each step (resumable if user drops off)
10. Seed the JAMB syllabus data (Mathematics, English, Physics, Chemistry, Biology, Government, Economics, Literature, Geography, Commerce, Agricultural Science)

### Phase 2 — Roadmap + Dashboard
11. Implement the adaptive engine: initial generation only
12. Build the dashboard page exactly per spec
13. Build the roadmap page exactly per spec
14. Build the topic detail page

### Phase 3 — Study sessions
15. Build the study session page and timer logic
16. Wire up XP awards from session completion
17. Implement streak tracking — daily check, freeze logic
18. Build the planner page

### Phase 4 — Quizzes
19. Implement Claude API integration with the quiz generation prompt
20. Build the quiz page and results page
21. Wire up mastery recalculation in the adaptive engine on quiz completion
22. Caching layer for generated questions

### Phase 5 — Marathon + Gamification
23. Build marathon mode (landing + active)
24. Build leaderboard
25. Implement badges seeding and award triggers

### Phase 6 — AI assistant + Mocks
26. Build the AI assistant chat with streaming
27. Build mock exam generation and the mock-taking flow
28. Build the progress page with all charts

### Phase 7 — Reminders + Polish
29. Implement reminder scheduler + email sending via Resend
30. Polish pass — verify every page against this spec, fix every inconsistency
31. Accessibility audit
32. Performance audit (Lighthouse, image optimization, bundle size)

---

## 12. RULES FOR YOU, CLAUDE CODE

1. **Re-read this file at the start of every new task.** If a decision contradicts what's here, this file wins.
2. **Do not invent copy.** All product-facing copy is in this file. If you need a string that isn't here, ask the user — do not write your own marketing language.
3. **Do not add features.** If you think a feature is missing, ask. Do not silently add "improvements."
4. **Do not change the design system.** No new colors, no new fonts, no new shadows, no new radii. The system is closed.
5. **Build mobile-first.** Every component must work at 360px wide before you touch the desktop layout.
6. **Both themes from day one.** Never write "we'll add dark mode later."
7. **No emojis in code, comments, commit messages, or UI.** This is a hard rule.
8. **Test the loading state and the empty state for every async surface.** A page is not done until both exist.
9. **TypeScript types live in `packages/shared`.** Never duplicate types between web and api.
10. **Every Mongoose query goes through a service function.** No raw `Model.find()` in route handlers.
11. **Ask before you assume.** When the spec is ambiguous on a small detail, pick the most restrained, most editorial option.
12. **Do not install new libraries casually.** The stack is fixed. If you need something not listed, justify it first.

---

## 13. WHAT "DONE" LOOKS LIKE FOR MVP

A user can:
1. Sign up
2. Complete the JAMB onboarding (4 subjects)
3. Land on a dashboard that shows a real roadmap with real topics
4. Open a topic, study it, mark it complete
5. Take a quiz on that topic, get a result, see explanations
6. See their XP go up and a streak start
7. Take a marathon session
8. Ask the AI assistant a question about a topic and get a useful answer
9. Take a mock exam and get a breakdown
10. See progress over time

The same flow works for WAEC and NECO with 8–9 subjects.

The whole product looks like Headway and Readwise had a deliberate, serious child. Not a single screen looks like it came from a generic SaaS template. A stranger seeing the dashboard cannot guess which AI built it.

---

END OF SPECIFICATION.

---

## 15. COLOR TOKEN REFERENCE (Aubergine — current)

The accent color system was updated in Update Batch 01. The original ink-red has been replaced with a **warm aubergine** that is academically serious, clearly distinct from danger red, and holds up in both light and dark themes.

### Light theme
```css
--color-accent:       #6E3A5F;   /* Warm aubergine — primary brand accent */
--color-accent-2:     #56294A;   /* Hover/pressed — deeper */
--color-accent-tint:  #F2E8EE;   /* Background tint for accent-tinted surfaces */
```

### Dark theme
```css
--color-accent:       #B07A9D;   /* Lifted aubergine for dark surfaces */
--color-accent-2:     #99668A;   /* Hover/pressed in dark */
--color-accent-tint:  #2A1E25;   /* Tint surface in dark */
```

### Why aubergine
- `#4F46E5` (indigo) — rejected. The AI-SaaS default.
- `#6B21A8` (royal violet) — rejected. Too vivid, too festive.
- `#6E3A5F` (warm aubergine) — chosen. Deep, restrained, sits naturally next to the warm paper background, holds up in both themes, clearly distinct from danger (`#A82F2F`).

### Contrast
- Light: aubergine on paper background ~7.2:1 (WCAG AAA)
- Dark: aubergine on dark paper ~5.1:1 (WCAG AA)

### Downstream subject hues updated
Two subject hues were too close to the new accent and were shifted:
- `--color-subj-literature`: `#5A3F8E` → `#3F5A8E` (steel blue)
- `--color-subj-government`: `#8E3F5A` → `#7F4A35` (clay brown)

### Danger stays unchanged
`--color-danger: #A82F2F` is NOT modified. Now that accent and danger are clearly differentiated by hue (purple vs red), they are properly distinguishable — an improvement over the previous state where both were red.

### Favicon
`app/icon.tsx` generates the favicon dynamically using `ImageResponse` with the "P" wordmark on the `#6E3A5F` background. This overrides the static `favicon.ico`.

---

## 16. NOTIFICATIONS SYSTEM

### Overview
A full in-app notification system. Every reminder and event in the system writes a `Notification` record. The frontend polls for the unread count (60s interval) and renders a dropdown panel on desktop and a full-screen sheet on mobile.

### Backend model — `apps/api/src/models/Notification.ts`
```ts
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  type: NotificationType,         // closed set — see below
  title: string,                  // max 80 chars
  body: string,                   // max 200 chars
  deeplink: string | null,        // resolved path with IDs substituted
  metadata: Record<string, any>,  // arbitrary related IDs
  readAt: Date | null,
  createdAt: Date,
  expiresAt: Date | null          // auto-removed via TTL index
}
```

Indexes: `{ userId, createdAt: -1 }` (hot path), `{ userId, readAt }` (unread count), `{ expiresAt }` TTL.

### Notification types (closed set for MVP)
| Type slug | Icon | Icon color | Deep link |
|---|---|---|---|
| `study_reminder` | Bell | ink-2 | /dashboard |
| `revision_due` | RefreshCcw | accent | /roadmap/[topicId] |
| `streak_warning` | Flame | warning | /dashboard |
| `streak_milestone` | Trophy | accent | /dashboard |
| `mock_available` | FileText | ink-2 | /mocks |
| `quiz_result` | ClipboardCheck | success | /quizzes/[quizId]/results |
| `topic_unlocked` | Compass | accent | /roadmap/[topicId] |
| `rank_up` | Trophy | accent | /progress |
| `badge_earned` | Award | accent | /progress |
| `weekly_review` | TrendingUp | ink-2 | /progress |
| `system` | Info | ink-2 | varies |
| `plan_change` | CreditCard | ink-2 | /settings?tab=plan |

### Backend routes — `GET|PATCH|DELETE /api/notifications`
```
GET    /api/notifications              List (paginated, cursor-based)
GET    /api/notifications/unread-count { count: number }
PATCH  /api/notifications/:id/read     Mark single read
PATCH  /api/notifications/read-all     Mark all read
DELETE /api/notifications/:id          Delete single
```

### `notify()` helper — `apps/api/src/features/notifications/notification.service.ts`
All event-driven notifications flow through `notify(userId, type, data)`. **Anti-flood built in:** before inserting, checks if a notification of the same type + same `metadata.topicId` or `metadata.quizId` was created within the last 30 minutes. If so, suppresses. This is enforced in the helper, not at call sites.

Triggers:
- Scheduler: every reminder sent also writes a Notification
- Quiz submit: mocks and high-score (80%+) quizzes
- Rank up: after every XP award in `gamification.service.ts`
- Streak milestone: days 7, 14, 30, 60, 100 in `sessions.service.ts`
- Topic unlocked: locked → ready transition in `roadmap.service.ts`

### Frontend components — `apps/web/components/notifications/`
- `NotificationBell.tsx` — bell button with animated unread badge; decides desktop vs mobile on click
- `NotificationPanel.tsx` — desktop dropdown (400px wide, 520px max-height, sticky header/footer)
- `NotificationSheet.tsx` — mobile full-screen slide-in from right (Framer Motion)
- `NotificationRow.tsx` — shared row: icon block + content + unread dot
- `NotificationEmpty.tsx` — BellOff empty state
- `NotificationSkeleton.tsx` — 5 pulse skeleton rows

### Frontend hooks — `apps/web/lib/hooks/`
- `use-notifications.ts` — listing query, staleTime 30s
- `use-unread-count.ts` — polls every 60s when tab visible
- `use-mark-read.ts` — optimistic: removes unread dot, decrements badge
- `use-mark-all-read.ts` — optimistic: zeros everything

### TanStack Query keys
- `["notifications", "list"]`
- `["notifications", "unread-count"]`

### Design spec (desktop panel)
- Width: 400px, max-height: 520px
- Anchored: `right: 0`, `top: calc(100% + 8px)` from bell
- Unread rows: `2px` left border in `--color-accent`, `bg: --color-accent-tint` at 50%
- Unread dot: 6px circle, accent, centered right
- Badge: `min-w-[16px]`, `h-[16px]`, accent bg, white mono text, "9+" if count > 9

---

## 17. INTERNATIONALIZATION

### Library
**next-intl v3** (App Router + Server Components, locale-prefixed routing).

### Supported locales
```ts
export const locales = ["en", "yo", "ha", "ig"] as const
export const defaultLocale = "en"
```
Native labels: English, Yorùbá, Hausa, Igbo. No flag emojis — flags map to countries, not languages.

### Routing
Locale-prefixed always: `/en/dashboard`, `/yo/dashboard`, etc. `/dashboard` redirects to `/en/dashboard`. Middleware in `apps/web/middleware.ts`.

### File structure
```
apps/web/
├── app/[locale]/           ← ALL routes nested here
│   ├── (app)/
│   ├── (auth)/
│   ├── (marathon)/
│   ├── (marketing)/
│   ├── (onboarding)/
│   ├── layout.tsx          ← Locale-aware, with NextIntlClientProvider
│   ├── not-found.tsx
│   └── page.tsx
├── lib/i18n/
│   ├── locales.ts          ← Locale constants
│   ├── request.ts          ← next-intl getRequestConfig
│   └── navigation.ts       ← Typed Link, useRouter wrappers
├── messages/
│   ├── en.json             ← Canonical, hand-written
│   ├── yo.json             ← AI-translated (run pnpm translate)
│   ├── ha.json             ← AI-translated
│   └── ig.json             ← AI-translated
└── scripts/
    └── translate.ts        ← Run manually: pnpm translate
```

### Font handling (critical for Yoruba/Igbo)
Geist lacks full coverage for Yoruba dotted vowels (`ẹ`, `ọ`, `ṣ`) and combining tone marks. **Noto Sans** is added as fallback in the font stack. For `yo` and `ig` locales, Noto Sans leads:
```css
html[data-locale="yo"],
html[data-locale="ig"] {
  --font-sans: var(--font-noto-sans), var(--font-geist), ui-sans-serif, system-ui, sans-serif;
}
```
The `[locale]/layout.tsx` sets `data-locale` on `<html>` and loads Noto Sans + Noto Serif at weights 400, 500, 600.

### Translation script
`scripts/translate.ts` — run `pnpm translate`. Reads `messages/en.json`, calls Claude Sonnet per namespace, validates structure, writes `{locale}.json`. Manual overrides can be placed in `messages/{locale}.fixed.json` (entire namespaces) and are preserved across runs. NOT run at build time — translations are committed to the repo.

### Hard rules for string handling
1. Never concatenate translated strings — use ICU placeholders: `{days} days to {exam}`
2. Plurals use ICU MessageFormat syntax: `{days, plural, =1 {1 day} other {# days}}`
3. Dates/numbers: use next-intl's `useFormatter` — never hand-format
4. Digits (XP count, streak number) don't need translation — only the surrounding units do

### Locale switcher placement
- **Settings → Profile**: select dropdown with native labels
- **Mobile Tools sheet**: Language row at the bottom, expands inline list
- **Desktop sidebar user menu**: Globe icon item above the divider, opens popover

### Quality acknowledgement
In Settings → Language, a note in body-sm ink-3 explains that translations are AI-generated and may have errors. Link to `mailto:support@propella.app?subject=Translation%20report...` for user reports. This note is itself translated in each locale file.

### What NOT to translate
- User-generated content (chat messages, notes, quiz answers)
- Subject names and scientific terms ("Photosynthesis", "Quadratic Equations") — students need these in English to match exam papers
- JAMB, WAEC, NECO, XP, PDF, AI — kept in English across all locales
