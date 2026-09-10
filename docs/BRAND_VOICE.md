# Propella — Brand Voice & Tone

Working reference for anyone writing copy in this codebase: UI strings, empty
states, error messages, notifications, emails, AI system prompts.

Source: *PROPELLA Brand Voice & Tone Guidelines*.

---

## The test

> **"Would the smartest senior student or tutor I wish I had say it this way?"**

If yes, it is probably on brand.

## Voice

| | |
|---|---|
| **Encouraging** | We believe students improve. Celebrate effort, not just results. Build confidence instead of fear. |
| **Simple** | Learning is already hard; the interface should not be. If a secondary school student cannot understand it, simplify it. |
| **Intelligent** | Knowledgeable without being academic or robotic. We teach, we do not lecture. |
| **Human** | Students are people, not users. Acknowledge stress. Celebrate progress. |
| **Optimistic** | Every message should leave a student more confident than before they read it. |

## Every message must do at least one of these

Teach something · Encourage someone · Solve a problem · Build confidence ·
Create curiosity · Inspire action.

If it does none of them, rewrite it.

## We say / We don't say

| We say | We don't say |
|---|---|
| Study smarter. | Study harder. |
| Let's figure it out together. | You're doing it wrong. |
| You've made progress. Keep going. | That's easy. |
| Every question helps you improve. | You should already know this. |
| One step at a time. | Last chance! Don't fail! |
| You're closer than you think. | Only geniuses pass JAMB. |

## Words to avoid

`fail` · `impossible` · `genius` · `guaranteed` · `miracle` · `cheat` ·
`last chance` · `secret hack` · `overnight success`

We build confidence. We never manipulate it.

## Words we like

learn · grow · improve · progress · practice · confidence · prepare · smart ·
better · goal · journey · success

## Style

- Active voice, short sentences, simple English.
- Explain before you impress. No educational jargon.
- Do not exaggerate. Never use fear to market.
- Emojis sparingly and intentionally; never in formal or official copy.

## Never

Shame students · talk down · promise guaranteed scores · use fear as marketing ·
sound robotic · overcomplicate learning · **make students feel behind** ·
mock wrong answers.

---

## How this shows up in the product

Concrete patterns already applied, worth matching when you add screens:

**Empty states** — [`components/common/empty-state.tsx`](../apps/web/components/common/empty-state.tsx)
describes what *will* appear and how to make it appear. It never frames absence
as the student's failing.

- ✅ "No quizzes yet — pick a topic above to generate your first one."
- ❌ "You haven't taken a quiz."

**Wrong answers** — study mode shows the explanation and moves on. No red
crosses with scolding copy; the framing is "every question helps you improve".

**Marathon stopped early** — recorded honestly, no XP, but phrased as
*"Saved as unfinished. No XP for this one. Your time still counts."* — factual,
never shaming.

**Errors** — say what happened and what to do next, calmly.

- ✅ "We could not build your plan just yet."
- ❌ "Roadmap generation failed."

**Streaks and reminders** — never threaten loss. "Study today to keep it" rather
than "Don't lose your streak!".

## Before you publish

Is it clear? Is it encouraging? Is it accurate? Does it help the student? Would
our ideal tutor say this? Does it sound like Propella?

If any answer is no, revise.
