#!/usr/bin/env ts-node
/**
 * Translation script — run manually: pnpm translate
 *
 * Reads messages/en.json as source of truth and uses the Gemini API
 * to translate each top-level namespace into Yoruba, Hausa, and Igbo.
 * Existing manual overrides in messages/{locale}.fixed.json are preserved.
 *
 * Requires GEMINI_API_KEY in the environment.
 */

import { GoogleGenAI } from '@google/genai'
import fs from 'fs/promises'
import path from 'path'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set — get a key at https://aistudio.google.com/apikey')
  process.exit(1)
}

const client = new GoogleGenAI({ apiKey })
const MODEL = process.env.GEMINI_TRANSLATE_MODEL ?? 'gemini-2.5-pro'

const TARGET_LOCALES: Array<{ code: string; name: string }> = [
  { code: 'yo', name: 'Yoruba' },
  { code: 'ha', name: 'Hausa' },
  { code: 'ig', name: 'Igbo' },
]

const MESSAGES_DIR = path.join(__dirname, '../messages')

type JsonObject = Record<string, unknown>

function buildPrompt(targetLanguageName: string, sourceJson: string): string {
  return `You are translating UI strings for Propella, a study app for Nigerian secondary school students preparing for JAMB, WAEC, and NECO exams.

Source language: English
Target language: ${targetLanguageName}

Translate the JSON object below from English to ${targetLanguageName}. Rules:

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
${sourceJson}`
}

async function translateNamespace(
  namespace: string,
  value: unknown,
  targetLanguageName: string,
): Promise<unknown> {
  const sourceJson = JSON.stringify({ [namespace]: value }, null, 2)

  const response = await client.models.generateContent({
    model: MODEL,
    contents: buildPrompt(targetLanguageName, sourceJson),
    config: {
      // Gemini returns strict JSON when asked, so no fence-stripping is needed.
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  })

  const raw = (response.text ?? '').trim()

  try {
    const parsed = JSON.parse(raw) as JsonObject
    return parsed[namespace]
  } catch {
    console.error(`  Failed to parse response for namespace "${namespace}". Raw:\n${raw}`)
    return value
  }
}

async function loadFixed(localeCode: string): Promise<JsonObject> {
  const fixedPath = path.join(MESSAGES_DIR, `${localeCode}.fixed.json`)
  try {
    const raw = await fs.readFile(fixedPath, 'utf-8')
    return JSON.parse(raw) as JsonObject
  } catch {
    return {}
  }
}

async function run() {
  const enPath = path.join(MESSAGES_DIR, 'en.json')
  const enRaw = await fs.readFile(enPath, 'utf-8')
  const en = JSON.parse(enRaw) as JsonObject

  for (const { code, name } of TARGET_LOCALES) {
    console.log(`\nTranslating → ${name} (${code})`)

    const existingPath = path.join(MESSAGES_DIR, `${code}.json`)
    let existing: JsonObject = {}
    try {
      existing = JSON.parse(await fs.readFile(existingPath, 'utf-8')) as JsonObject
    } catch {
      // No existing file
    }

    const fixed = await loadFixed(code)
    const result: JsonObject = {}

    for (const [namespace, value] of Object.entries(en)) {
      if (fixed[namespace] !== undefined) {
        console.log(`  [${namespace}] — using fixed override`)
        result[namespace] = fixed[namespace]
        continue
      }

      const existingNs = existing[namespace]
      if (existingNs !== undefined && JSON.stringify(existingNs) === JSON.stringify(value)) {
        console.log(`  [${namespace}] — unchanged, skipping`)
        result[namespace] = existingNs
        continue
      }

      console.log(`  [${namespace}] — translating...`)
      result[namespace] = await translateNamespace(namespace, value, name)
    }

    const output = JSON.stringify(result, null, 2)
    await fs.writeFile(existingPath, output, 'utf-8')
    console.log(`  Wrote ${existingPath}`)
  }

  console.log('\nDone.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
