# PROPELLA — UPDATE BATCH 01

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

> **For Claude Code:** Three updates in this batch. Read this file in full before starting. Append the contents to `PROPELLA_BUILD.md` as Sections 15–17 once complete so future Claude Code instances inherit the decisions.
>
> Do all three updates in one branch. Order: color first (smallest, lowest risk), then notifications (medium), then i18n (largest). Verify each works before moving to the next.

---

## UPDATE 1 — Color system: warm red → warm purple

### What we're changing

The current accent system uses `--color-accent: #B23A2E` (a warm crimson "ink red"). We are replacing it with a **warm aubergine** — a deep, slightly desaturated purple with red undertones. This holds the editorial-academic feel (it reads as serious and slightly archival, not festive), and is distinct from the generic indigo-purple that every AI-generated SaaS uses.

### Why this exact purple

I evaluated three options:
- Indigo `#4F46E5` — **rejected.** This is the AI-SaaS default. Defeats the entire point of the design system.
- Royal violet `#6B21A8` — **rejected.** Too vivid, too festive. Reads as marketing-y, not academic.
- **Warm aubergine `#6E3A5F` — chosen.** Deep, restrained, sits naturally next to the warm paper background, holds up in both light and dark themes, distinguishable from the danger color, and pairs well with the existing forest green success and amber warning tones.

### Exact new token values

Replace these tokens in `apps/web/app/globals.css` (and anywhere else they live). **These exact hex values, no improvisation.**

**Light theme:**
```css
--color-accent:       #6E3A5F;   /* Warm aubergine — primary brand accent */
--color-accent-2:     #56294A;   /* Hover/pressed — deeper */
--color-accent-tint:  #F2E8EE;   /* Background tint for accent-tinted surfaces */
```

**Dark theme:**
```css
--color-accent:       #B07A9D;   /* Lifted aubergine for dark surfaces */
--color-accent-2:     #99668A;   /* Hover/pressed in dark */
--color-accent-tint:  #2A1E25;   /* Tint surface in dark */
```

### What changes downstream

The `--color-danger` token (`#A82F2F`) **does not change**. Now that danger and accent are clearly differentiated by hue (red vs purple), they are properly distinguishable. This is actually an improvement — before, danger and accent were both red, which was a subtle accessibility concern.

The `--color-subj-literature: #5A3F8E` subject hue is now too close to the new accent. Change it to **`#3F5A8E`** (a deeper steel blue) so subject markers remain visually distinct from accent UI.

The `--color-subj-government: #8E3F5A` subject hue is also now too close. Change it to **`#8E3F6E`** (a warmer rose-pink) — actually, no, that's even closer. Change it to **`#7F4A35`** (a clay-brown).

### Implementation

1. Update `globals.css` with the new tokens above.
2. Search the codebase for any hardcoded uses of the old accent hex values (`#B23A2E`, `#8E2B22`, `#F7E8E5`). Replace with the new ones. Any hardcoded hex outside `globals.css` is itself a bug — flag those and migrate them to use the CSS variable.
3. Update the favicon: the "P" wordmark mark on accent background now uses `#6E3A5F`.
4. **Verify** in both light and dark themes across these screens: dashboard, roadmap, study session, quiz active and results, marathon active, AI assistant, settings → plan billing, and the landing page. Pay particular attention to:
   - The streak flame icon (uses accent)
   - XP counter color
   - Primary CTA buttons across all surfaces
   - The accent left-border on milestone nodes in the roadmap timeline
   - The accent tint on selected quiz options
   - The accent tint on the active marathon pomodoro ring

5. Update the `/design-system` reference route — every accent swatch and example must reflect the new color.

### Accessibility check

The new aubergine on the paper background has contrast ratio ~7.2:1 (WCAG AAA). The new dark-theme aubergine on dark paper has contrast ~5.1:1 (WCAG AA). Both pass. If your implementation produces lower contrast, you made a mistake — recheck the hex values.

---

## UPDATE 2 — Notification panel

### What we're building

A clickable notification panel anchored to the bell icon. The bell already exists in the top bar (both desktop 56px and mobile 48px) and currently does nothing. We're wiring it up.

### Behavior model — read this first

**Desktop:** Clicking the bell opens a dropdown panel anchored below and slightly right of the bell, 400px wide, ~520px max height with internal scrolling. Closes on: clicking outside, pressing Escape, or clicking a notification (which navigates and closes).

**Mobile:** Tapping the bell opens a full-screen sheet sliding in from the right (`x: 100% → 0`, 240ms ease-out). The sheet covers the full viewport. Closes on: tapping the back arrow in the sheet header, or system back gesture, or after navigation.

### Visual specification — desktop panel

A card with:
- `bg: --color-card`, `border: 1px solid --color-rule`, `border-radius: --radius-md`, `box-shadow: --shadow-md`
- Width: 400px, max-height: 520px
- Position: anchored under the bell, `right: 0`, `top: calc(100% + 8px)` from the bell's parent
- Z-index above page content but below modals

**Header (sticky, paper-2 bg, hairline bottom border, h-14, px-4, flex):**
- Left: "Notifications" in Fraunces heading-md
- Right: "Mark all read" — small ghost button, only visible when unread count > 0. On click: marks all read locally and via API, updates the unread badge.

**Body (scrollable):**
- List of notification rows, separated by hairline `--color-rule` dividers (no card-on-card nesting).
- Each row: `min-h-[72px]`, `px-4 py-3`, hover: `bg --color-paper-2`, cursor: pointer.
- Unread rows have a `2px` left border in `--color-accent` and a subtle `bg: --color-accent-tint` at 50% opacity.
- Row layout (left to right):
  1. **Icon block** — 36×36 rounded-sm square, `bg: --color-paper-2`, containing a Lucide icon at 18px in the type-specific color. See "Notification types" below for icon mapping.
  2. **Content** (flex-1, min-width: 0 for proper truncation):
     - Title in Geist 500 14px, ink, single-line truncate
     - Body in body-sm (13px) ink-2, two-line max with ellipsis truncation
     - Timestamp in caption 11px JetBrains Mono ink-3, e.g. "2h ago", "Yesterday", "Tue 14 May"
  3. **Right-side dot** — 6px circle in `--color-accent` for unread, hidden for read. Sits centered vertically, 8px from right edge.

**Empty state** (when no notifications at all):
- Centered in the body, py-16
- Lucide `BellOff` icon 32px in `--color-ink-3`
- Below: "Nothing yet." in Fraunces heading-md
- Below: "Reminders and updates appear here." in body-sm ink-3, max-w-[240px], text-center

**Loading state:**
- Show 5 skeleton rows. Skeleton uses existing skeleton component spec (paper-3 bg, pulse animation).

**Error state** (fetch failed):
- Centered: "Couldn't load notifications. Try again." in body-sm ink-2, with a small ghost "Retry" button below.

**Footer (sticky, hairline top border, h-12, px-4, flex justify-center):**
- Single ghost-link "Notification settings →" routing to `/settings?tab=notifications`. Closes the panel on click.

### Visual specification — mobile sheet

Full-screen, paper bg. Animates in from the right.

**Header (sticky top, h-14, paper bg, hairline bottom border, px-4, flex items-center):**
- Left: back arrow (Lucide `ChevronLeft` 22px) — closes sheet
- Center: "Notifications" in Fraunces heading-md
- Right: "Mark all read" if unread > 0

**Body:** same row pattern as desktop panel, but rows take full width.

**Footer:** same — but `pb-[env(safe-area-inset-bottom)]` for iPhone safe area.

### The unread badge on the bell

A small pill anchored to the top-right of the bell icon:
- Position: `absolute`, `-top-1`, `-right-1`
- Size: min-w-[16px], h-[16px], rounded-full, px-1
- Background: `--color-accent`
- Text: white, JetBrains Mono 10px font-weight 600, tabular-nums
- Shows the unread count, "9+" if count > 9
- Hidden entirely when count is 0
- Subtle scale-in animation when count increments (200ms, ease-out)

### Notification types — the closed set for MVP

We are NOT building a generic "anything can become a notification" system. The set is closed. If you want to add a new type later, it requires a spec update. The types:

| Type slug | Lucide icon | Icon color | Deep link |
|---|---|---|---|
| `study_reminder` | `Bell` | `--color-ink-2` | `/dashboard` |
| `revision_due` | `RefreshCcw` | `--color-accent` | `/roadmap/[topicId]` |
| `streak_warning` | `Flame` | `--color-warning` | `/dashboard` |
| `streak_milestone` | `Trophy` | `--color-accent` | `/dashboard` |
| `mock_available` | `FileText` | `--color-ink-2` | `/mocks` |
| `quiz_result` | `ClipboardCheck` | `--color-success` | `/quizzes/[quizId]/results` |
| `topic_unlocked` | `Compass` | `--color-accent` | `/roadmap/[topicId]` |
| `rank_up` | `Trophy` | `--color-accent` | `/progress` |
| `badge_earned` | `Award` | `--color-accent` | `/progress` |
| `weekly_review` | `TrendingUp` | `--color-ink-2` | `/progress` |
| `system` | `Info` | `--color-ink-2` | varies, may be null |
| `plan_change` | `CreditCard` | `--color-ink-2` | `/settings?tab=plan` |

Notifications with a null or unsupported deep link mark themselves read but do not navigate.

### Backend — Notification model

Add a new Mongoose model `Notification` in `apps/api/src/models/Notification.ts`:

```ts
{
  _id: ObjectId,
  userId: ObjectId (indexed),
  type: string (one of the slugs above),
  title: string,                    // max 80 chars
  body: string,                     // max 200 chars
  deeplink: string | null,          // resolved path with IDs substituted
  metadata: Record<string, any>,    // arbitrary related IDs (topicId, quizId, etc.)
  readAt: Date | null,
  createdAt: Date (indexed, desc),
  expiresAt: Date | null            // optional — auto-removed after this date
}
```

Indexes:
- `{ userId: 1, createdAt: -1 }` — for the listing query, this is the hot path
- `{ userId: 1, readAt: 1 }` — for the unread count query
- `{ expiresAt: 1 }` with TTL — automatic cleanup of expired notifications

### Backend — Routes

Add a notifications feature under `apps/api/src/features/notifications/`:

```
GET    /api/notifications              List notifications, paginated
GET    /api/notifications/unread-count Returns { count: number }
PATCH  /api/notifications/:id/read     Mark single notification read
PATCH  /api/notifications/read-all     Mark all read for current user
DELETE /api/notifications/:id          Delete a single notification (rarely used)
```

`GET /api/notifications` accepts:
- `?limit=20` (default 20, max 50)
- `?cursor=<ObjectId>` — opaque cursor for pagination, based on the `_id` of the last seen item

Response shape:
```ts
{
  items: Notification[],
  nextCursor: string | null,
  unreadCount: number
}
```

The endpoint includes `unreadCount` in the listing response so the client gets it for free without a second request.

### Backend — Generating notifications

Existing reminder scheduler (`apps/api/src/lib/scheduler.ts`) currently only sends emails. Update it to **also write a `Notification` record** for every reminder sent. This is the single canonical way notifications enter the system for scheduled reminders.

For event-driven notifications (rank up, badge earned, quiz result, topic unlocked, streak milestone), add a small `notify(userId, type, data)` helper in `apps/api/src/features/notifications/notification.service.ts`. Call it from:
- The XP/rank service after a rank-up calculation
- The badge award trigger
- The quiz attempt completion handler — but only for mocks and high-stakes quizzes, NOT every casual topic quiz (we'd flood users otherwise)
- The roadmap adaptive engine when a topic transitions from `locked` → `ready` (deduplicate per topic per 24h to avoid spam)
- The streak service when a milestone day is hit (7, 14, 30, 60, 100)

**Anti-flood rule:** at the service level, before inserting a new notification, check if a notification of the same `type` for the same user was created within the last 30 minutes with overlapping `metadata.topicId` or `metadata.quizId` (whichever applies). If so, skip. Build this into the helper, not into every call site.

### Frontend — implementation

**TanStack Query keys:**
- `["notifications", "list"]` — for the panel listing
- `["notifications", "unread-count"]` — for the bell badge

**Polling:** the unread count query refetches every 60 seconds when the tab is visible (use TanStack's `refetchInterval` with the document visibility API). The listing query refetches when the panel opens.

**Optimistic updates:**
- Marking a notification read: optimistically remove the unread dot and decrement the badge count. Roll back on error.
- Mark all read: optimistically zero everything. Roll back on error.

**Hooks to add in `apps/web/lib/hooks/`:**
- `use-notifications.ts` — returns the listing query
- `use-unread-count.ts` — returns the badge count, polls
- `use-mark-read.ts` — mutation, marks one read
- `use-mark-all-read.ts` — mutation

**Components in `apps/web/components/notifications/`:**
- `NotificationBell.tsx` — the bell button with the unread badge, used in both top bars
- `NotificationPanel.tsx` — the desktop dropdown panel
- `NotificationSheet.tsx` — the mobile full-screen sheet
- `NotificationRow.tsx` — single row, shared between panel and sheet
- `NotificationEmpty.tsx` — empty state
- `NotificationSkeleton.tsx` — loading row skeleton

The bell component decides which to render based on viewport (use a media query hook or Tailwind's `md:` for visibility). Don't try to share one component between dropdown and sheet — they behave differently enough that fork is cleaner than abstract.

### Deeplink resolution

The `deeplink` field in the notification record is a *resolved* path with IDs substituted. The backend resolves it when creating the notification. So `/roadmap/[topicId]` becomes `/roadmap/68f24abc...` in the actual record. The frontend just calls `router.push(notification.deeplink)`.

If `deeplink` is null, clicking the notification only marks it read without navigating.

### What "done" looks like

1. Bell shows unread badge with correct count
2. Click bell on desktop → dropdown panel appears, anchored correctly, with notifications listed
3. Click bell on mobile (< 768px) → full-screen sheet slides in
4. Click a notification → marks read, navigates to deeplink, panel closes
5. Click "Mark all read" → all marked read, badge disappears
6. Empty state renders correctly when no notifications exist
7. Loading skeletons render while fetching
8. Notification settings link in footer routes to `/settings?tab=notifications`
9. New notifications generated by quiz completion, rank up, and reminder scheduler appear in the panel
10. Anti-flood logic prevents duplicate notifications within 30 minutes

---

## UPDATE 3 — Internationalization (English + Yoruba + Hausa + Igbo)

### Important context Claude Code must read carefully

The user has decided to ship this for MVP using AI translation, accepting that quality will be uneven and may need human-translator fixes later. We are **building the infrastructure correctly** so we can swap in human-translated content per-language without re-engineering. We are NOT skipping the infrastructure layer because the translation is AI-sourced.

This is also a **product decision the user owns** — when implementing, do not second-guess it. Just build it.

### Library — next-intl

Use **`next-intl`** (latest v3+). Justification: built for App Router + Server Components, ~2KB bundle, native server-side translation rendering means zero client bundle penalty for translated content, type-safe message keys, locale-prefixed routing built in.

Install:
```bash
pnpm add next-intl
```

### Supported locales

```ts
// apps/web/lib/i18n/locales.ts
export const locales = ["en", "yo", "ha", "ig"] as const;
export const defaultLocale = "en";

export const localeMetadata = {
  en: { label: "English",  nativeLabel: "English",  flag: null },
  yo: { label: "Yoruba",   nativeLabel: "Yorùbá",   flag: null },
  ha: { label: "Hausa",    nativeLabel: "Hausa",    flag: null },
  ig: { label: "Igbo",     nativeLabel: "Igbo",     flag: null },
} as const;
```

Note: native labels use the language's own script. **Do not use flag emojis** — flags map to countries, not languages, and using a Nigerian flag for "Yoruba" is geographically and politically clumsy. Just the native name.

### Routing

Use locale-prefixed paths: `/en/dashboard`, `/yo/dashboard`, `/ha/dashboard`, `/ig/dashboard`. The English locale is **NOT** the implicit default URL — `/dashboard` redirects to `/en/dashboard`. This keeps SEO and analytics clean.

Implement via the `next-intl/middleware`:

```ts
// apps/web/middleware.ts
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/lib/i18n/locales";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",     // always show locale in URL
  localeDetection: true,      // detect browser/cookie preference
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

### Folder structure

```
apps/web/
├── messages/
│   ├── en.json              ← canonical, hand-written
│   ├── yo.json              ← AI-translated from en.json
│   ├── ha.json              ← AI-translated from en.json
│   └── ig.json              ← AI-translated from en.json
├── lib/i18n/
│   ├── locales.ts
│   ├── request.ts           ← next-intl request config
│   └── navigation.ts        ← typed Link, useRouter wrappers
├── scripts/
│   ├── translate.ts         ← AI translation script (runs against en.json, outputs others)
│   └── extract-strings.ts   ← optional: walks src/ looking for hardcoded strings
└── app/
    └── [locale]/            ← every route nested under this segment
        ├── (marketing)/
        ├── (auth)/
        ├── (app)/
        └── ...
```

**Critical: the entire `app/` directory must move into `app/[locale]/`.** This is a significant refactor. Every existing route becomes locale-aware. Do it carefully in one commit so nothing breaks.

### Critical font issue — read this or Yoruba will render broken

**Geist (the current sans body font) does NOT have full coverage for Yoruba diacritics.** Yoruba uses dotted vowels (`ẹ`, `ọ`, `ṣ`, `Ẹ`, `Ọ`, `Ṣ`) and combining tone marks (acute, grave). These live in the Latin Extended Additional and Combining Diacritical Marks Unicode blocks. If you let Geist render Yoruba, you'll get tofu (□) for missing characters or misaligned combining marks.

**Fraunces** (the display serif) is mostly OK for Yoruba but has imperfect combining-mark positioning at small sizes.

**Hausa** uses standard Latin + a few hooked consonants (`ɓ`, `ɗ`, `ƙ`, `ʼy`) — Geist and Fraunces handle these adequately.

**Igbo** uses dotted vowels (`ị`, `ọ`, `ụ`) and a few additional marks — same risk as Yoruba.

**The fix:** add **Noto Sans** as a font fallback specifically for Yoruba and Igbo. Noto Sans has complete Latin Extended Additional coverage and is designed for exactly this case. Update `globals.css`:

```css
@theme {
  --font-display: "Fraunces", "Noto Serif", ui-serif, Georgia, serif;
  --font-sans: "Geist", "Noto Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}
```

Noto Sans is added to the font loading in `app/[locale]/layout.tsx`. Self-host weights 400, 500, 600.

When the locale is `yo` or `ig`, the `[locale]` layout sets a `data-locale` attribute on `<html>`. We can optionally override the font stack to lead with Noto Sans for those locales:

```css
html[data-locale="yo"],
html[data-locale="ig"] {
  --font-sans: "Noto Sans", "Geist", ui-sans-serif, system-ui, sans-serif;
}
```

This way Latin (English) keeps Geist as primary, and Yoruba/Igbo lead with Noto Sans which has proper combining diacritic support.

### Message file structure

Use namespaced JSON. Group by feature, not by page (allows reuse across pages):

```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "continue": "Continue",
    "back": "Back",
    "loading": "Loading",
    "tryAgain": "Try again"
  },
  "nav": {
    "dashboard": "Home",
    "roadmap": "Roadmap",
    "study": "Study",
    "tools": "Tools",
    "profile": "Profile"
  },
  "dashboard": {
    "greeting": "{date}.",
    "daysToExam": "{days, plural, =1 {1 day to {exam}.} other {# days to {exam}.}}",
    "todaysFocus": "Today's focus",
    "weakestTopics": "Where you're struggling",
    ...
  },
  "onboarding": { ... },
  "roadmap": { ... },
  "study": { ... },
  "quiz": { ... },
  "assistant": { ... },
  "marathon": { ... },
  "settings": { ... },
  "errors": { ... },
  "emptyStates": { ... },
  "notifications": { ... }
}
```

### Hard rules for string handling

1. **Never concatenate translated strings.** Use ICU placeholders: `"daysToExam": "{days} days to {exam}."` Not `"daysToExam": "days to "`.
2. **Plurals use ICU MessageFormat plural syntax** (shown in `daysToExam` above). Yoruba, Hausa, and Igbo all have plural rules; ICU handles them. Hausa specifically has a `one`/`other` distinction. Yoruba and Igbo are effectively `other`-only but the syntax still works.
3. **Dates and numbers** use next-intl's `useFormatter` — `formatter.dateTime(date, { dateStyle: "medium" })`. Never hand-format dates as English strings.
4. **Numbers in body copy** — interpolate the number with `{count}`. The display-numeric counter (XP, streak number) does NOT need translation since it's a digit. But the *unit* ("day streak", "minutes") is translated.

### Locale switcher

Add a locale switcher in two places:
- **Settings → Profile** — a select dropdown showing native labels: English / Yorùbá / Hausa / Igbo. Save preference to `User.locale` in the database.
- **Mobile Tools sheet** — at the bottom of the Tools sheet, a row labeled "Language" with the current language's native label on the right and a `ChevronRight`. Tapping opens a sub-sheet with the four options. This is the discoverable surface for casual users who don't open Settings.
- **Desktop sidebar** — bottom-left of the user card menu, above the divider, add an item: `Globe` icon, label "Language", showing current language. Opens a small popover with the four options.

On switch:
1. PATCH the user's locale preference to backend
2. `router.replace(currentPath, { locale: newLocale })` — next-intl's typed router handles this
3. The page re-renders in the new locale

### The translation script (`scripts/translate.ts`)

Build a Node script that:
1. Reads `messages/en.json` as the source of truth.
2. For each non-English locale (`yo`, `ha`, `ig`), loads the existing target file (if any), preserves any keys that have been manually edited (marked with a `// fixed` comment or stored in a separate `messages/yo.fixed.json` overlay).
3. Calls the Anthropic API (Claude Sonnet) with a translation prompt (below) for each top-level namespace.
4. Validates the returned JSON matches the source structure exactly (same keys, no missing, no extra).
5. Writes the result to `messages/{locale}.json`.
6. Prints a diff summary: keys added, keys changed, keys unchanged.

The script is run manually by the founder via `pnpm translate`. NOT run at build time — translations are committed to the repo.

### The translation prompt (use this exactly in the script)

```
You are translating UI strings for Propella, a study app for Nigerian secondary school students preparing for JAMB, WAEC, and NECO exams.

Source language: English
Target language: {TARGET_LANGUAGE_NAME}

Translate the JSON object below from English to {TARGET_LANGUAGE_NAME}. Rules:

1. Preserve the exact JSON structure. Same keys, same nesting. No additions, no omissions.
2. Preserve ALL ICU MessageFormat placeholders exactly: {name}, {count}, {date}, {days, plural, ...}. Translate ONLY the surrounding text. Never translate placeholder names.
3. Keep technical terms in English when there is no widely-understood native term: "JAMB", "WAEC", "NECO", "XP", "PDF", "AI", subject names ("Mathematics", "Physics", "Chemistry"). Nigerian students use these in English in daily speech.
4. Tone: serious, direct, respectful. NOT casual or playful. Match how a serious tutor would address a student.
5. For Yoruba: use correct tone marks (acute, grave, macron) and dot diacritics (ẹ, ọ, ṣ). Failing to mark tone changes meaning.
6. For Hausa: use Boko (Latin) script, NOT Ajami. Use modern standard Hausa (Kano dialect baseline).
7. For Igbo: use modern Onwu orthography with proper dotted vowels (ị, ọ, ụ).
8. Do not transliterate or invent. If a phrase has no direct native translation, prefer a clear equivalent over a literal translation.
9. Length: keep translations within ~150% of source length where possible. UI space is constrained.

Output: the translated JSON object, nothing else. No commentary, no markdown fences.

Source:
{SOURCE_JSON}
```

Submit one namespace at a time (e.g., the `dashboard` namespace alone) to keep context manageable and improve accuracy. Loop through namespaces.

### Quality acknowledgement — make this visible

In Settings → Language, below the locale selector, show a small note in body-sm ink-3:

> **English (en):** "We use AI to translate Propella into Yoruba, Hausa, and Igbo. Translations may have errors — let us know if you find one."

This note is translated into each locale (use this exact translation note in the relevant locale file). It manages user expectations honestly. Do not hide it. Do not market the languages as "professionally translated" until they actually are.

### Add a "report a translation" link

In the language sub-sheet (mobile) and the language popover (desktop), add a small link at the bottom: "Report a translation" → opens `mailto:support@propella.app?subject=Translation%20report%20-%20{LOCALE}&body={CURRENT_URL}`.

### What "done" looks like

1. Every page in `app/` lives under `app/[locale]/`
2. `/dashboard` redirects to `/en/dashboard`; visiting `/yo/dashboard` renders in Yoruba
3. Locale switcher appears in Settings, mobile Tools sheet, and desktop user-card menu
4. Switching locale updates the URL, persists to backend, re-renders the page in the new language
5. All four locale files exist in `messages/`. `en.json` is hand-written, others are AI-generated via the translate script
6. Yoruba text renders with proper tone marks and dotted vowels (no tofu, no misaligned combining marks) — Noto Sans fallback is loading correctly for `yo` and `ig` locales
7. Dates and numbers format correctly per locale (no hardcoded English month names anywhere)
8. The quality acknowledgement note appears in the language settings, translated
9. Notifications panel from Update 2 displays notification titles and bodies in the user's selected language

### What NOT to do

- Don't translate user-generated content (chat messages, notes, quiz answers). Only translate UI chrome.
- Don't translate subject names or scientific terms ("Photosynthesis", "Quadratic Equations") — students need these in English to match the exam papers.
- Don't try to translate the marketing landing page perfectly on the first pass. The marketing site can stay English-only at the `/` (no locale prefix) and we add localized marketing later. Inside the app, full i18n.
- Don't ship without verifying Yoruba renders correctly. Take a screenshot of `/yo/dashboard` and visually confirm tone marks display. This is the single most likely failure mode.

---

## ORDER OF EXECUTION

1. Update 1 (color) — should take a few hours. Test, ship.
2. Update 2 (notifications) — schema, backend routes, frontend components, wire up. About a day.
3. Update 3 (i18n) — biggest. Restructure routes, install next-intl, extract strings to en.json, write translate script, run it, verify rendering. Two days minimum.

**Commit each update separately.** Three branches or three commits on one branch. Either way, do not mix them in one commit — if i18n breaks something, we want to be able to revert it without losing the color and notification work.

---

## APPEND TO PROPELLA_BUILD.md

When all three are done, append these sections to `PROPELLA_BUILD.md`:

- **Section 15** — Color token reference (updated with aubergine)
- **Section 16** — Notifications system (this entire Update 2 spec)
- **Section 17** — Internationalization (this entire Update 3 spec)

Future Claude Code instances must read these along with the original spec.

END.
