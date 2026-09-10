import crypto from 'crypto'
import type { ExamType } from '../config/db'
import type { OptionId, QuizOption } from '../models/types'

/**
 * Parsing and validation for admin bulk uploads of past questions.
 *
 * Deliberately dependency-free: the CSV dialect here is the one Excel and
 * Google Sheets emit (comma separated, double-quote quoting, "" escapes).
 */

export interface ParsedPastQuestion {
  exam: ExamType
  year: number
  subjectSlug: string
  topicSlug: string | null
  stem: string
  options: QuizOption[]
  correctOptionId: OptionId
  explanation: string | null
  source: string | null
  fingerprint: string
}

export interface RowError {
  row: number
  reason: string
}

export interface ParseResult {
  questions: ParsedPastQuestion[]
  errors: RowError[]
  total: number
}

const EXAMS: ExamType[] = ['jamb', 'waec', 'neco']
const OPTION_IDS: OptionId[] = ['A', 'B', 'C', 'D']

/** Columns accepted in the CSV header, normalised to lower-case no-punctuation. */
const COLUMN_ALIASES: Record<string, string> = {
  exam: 'exam',
  examtype: 'exam',
  year: 'year',
  subject: 'subjectSlug',
  subjectslug: 'subjectSlug',
  topic: 'topicSlug',
  topicslug: 'topicSlug',
  question: 'stem',
  stem: 'stem',
  a: 'a',
  optiona: 'a',
  b: 'b',
  optionb: 'b',
  c: 'c',
  optionc: 'c',
  d: 'd',
  optiond: 'd',
  answer: 'answer',
  correct: 'answer',
  correctoption: 'answer',
  correctoptionid: 'answer',
  explanation: 'explanation',
  source: 'source',
}

function normaliseHeader(name: string): string {
  return name.trim().toLowerCase().replace(/[\s_\-.]/g, '')
}

/** RFC-4180-ish CSV reader. Handles quoted fields, embedded commas and newlines. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  // Strip a UTF-8 BOM, which Excel loves to add.
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!

    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') {
      field += ch
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

/**
 * Stable identity for a question, so re-uploading the same file is a no-op.
 * Whitespace and case are normalised so trivial edits do not create duplicates.
 */
export function fingerprint(
  exam: string,
  year: number,
  subjectSlug: string,
  stem: string,
): string {
  const normalised = stem.trim().toLowerCase().replace(/\s+/g, ' ')
  return crypto
    .createHash('sha256')
    .update(`${exam}|${year}|${subjectSlug}|${normalised}`)
    .digest('hex')
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface RawRow {
  exam?: string
  year?: string | number
  subjectSlug?: string
  topicSlug?: string
  stem?: string
  a?: string
  b?: string
  c?: string
  d?: string
  answer?: string
  explanation?: string
  source?: string
  options?: unknown
  correctOptionId?: string
}

function validateRow(raw: RawRow, rowNumber: number): ParsedPastQuestion | RowError {
  const fail = (reason: string): RowError => ({ row: rowNumber, reason })

  const exam = String(raw.exam ?? '').trim().toLowerCase()
  if (!EXAMS.includes(exam as ExamType)) {
    return fail(`exam must be one of ${EXAMS.join(', ')} (got "${raw.exam ?? ''}")`)
  }

  const year = Number(raw.year)
  if (!Number.isInteger(year) || year < 1970 || year > 2100) {
    return fail(`year must be a 4-digit year (got "${raw.year ?? ''}")`)
  }

  const subjectSlug = slugify(String(raw.subjectSlug ?? ''))
  if (!subjectSlug) return fail('subject is required')

  const stem = String(raw.stem ?? '').trim()
  if (!stem) return fail('question text is required')

  // Options may arrive as four columns (CSV) or a ready-made array (JSON).
  let options: QuizOption[]
  if (Array.isArray(raw.options)) {
    const arr = raw.options as Array<{ id?: unknown; text?: unknown }>
    if (arr.length !== 4) return fail('options must contain exactly 4 entries')
    options = arr.map((o, i) => ({
      id: (typeof o?.id === 'string' ? o.id.trim().toUpperCase() : OPTION_IDS[i]!) as OptionId,
      text: String(o?.text ?? '').trim(),
    }))
  } else {
    const texts = [raw.a, raw.b, raw.c, raw.d].map((t) => String(t ?? '').trim())
    if (texts.some((t) => t === '')) return fail('all four options (A-D) are required')
    options = OPTION_IDS.map((id, i) => ({ id, text: texts[i]! }))
  }

  if (options.some((o) => !OPTION_IDS.includes(o.id) || o.text === '')) {
    return fail('options must be A-D with non-empty text')
  }

  const answerRaw = String(raw.answer ?? raw.correctOptionId ?? '').trim().toUpperCase()
  if (!OPTION_IDS.includes(answerRaw as OptionId)) {
    return fail(`answer must be A, B, C or D (got "${answerRaw}")`)
  }

  const topic = String(raw.topicSlug ?? '').trim()
  const explanation = String(raw.explanation ?? '').trim()
  const source = String(raw.source ?? '').trim()

  return {
    exam: exam as ExamType,
    year,
    subjectSlug,
    topicSlug: topic ? slugify(topic) : null,
    stem,
    options,
    correctOptionId: answerRaw as OptionId,
    explanation: explanation || null,
    source: source || null,
    fingerprint: fingerprint(exam, year, subjectSlug, stem),
  }
}

function isError(value: ParsedPastQuestion | RowError): value is RowError {
  return 'reason' in value
}

export function parsePastQuestions(content: string, format: 'csv' | 'json'): ParseResult {
  const questions: ParsedPastQuestion[] = []
  const errors: RowError[] = []
  let total = 0

  let rawRows: RawRow[] = []

  if (format === 'json') {
    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      return { questions: [], errors: [{ row: 0, reason: 'File is not valid JSON' }], total: 0 }
    }
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { questions?: unknown }).questions)
        ? (parsed as { questions: unknown[] }).questions
        : null
    if (!list) {
      return {
        questions: [],
        errors: [{ row: 0, reason: 'JSON must be an array, or an object with a "questions" array' }],
        total: 0,
      }
    }
    // Accept the same friendly key names the CSV template uses ("subject",
    // "question", "answer"...) so one vocabulary covers both formats.
    rawRows = (list as Array<Record<string, unknown>>).map((row) => {
      const mapped: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(row ?? {})) {
        mapped[COLUMN_ALIASES[normaliseHeader(key)] ?? key] = value
      }
      return mapped as RawRow
    })
  } else {
    const rows = parseCsv(content)
    if (rows.length < 2) {
      return {
        questions: [],
        errors: [{ row: 0, reason: 'CSV needs a header row and at least one data row' }],
        total: 0,
      }
    }

    const header = rows[0]!.map((h) => COLUMN_ALIASES[normaliseHeader(h)] ?? normaliseHeader(h))

    for (const required of ['exam', 'year', 'subjectSlug', 'stem', 'answer']) {
      if (!header.includes(required)) {
        return {
          questions: [],
          errors: [{ row: 0, reason: `CSV is missing a required column: ${required}` }],
          total: 0,
        }
      }
    }

    rawRows = rows.slice(1).map((cells) => {
      const obj: Record<string, string> = {}
      header.forEach((key, i) => {
        obj[key] = cells[i] ?? ''
      })
      return obj as RawRow
    })
  }

  // De-duplicate within the file itself as well as against the database later.
  const seen = new Set<string>()

  rawRows.forEach((raw, index) => {
    total += 1
    // +2 accounts for the header row and 1-based numbering, so the number
    // matches what the admin sees in their spreadsheet.
    const result = validateRow(raw, format === 'csv' ? index + 2 : index + 1)
    if (isError(result)) {
      errors.push(result)
      return
    }
    if (seen.has(result.fingerprint)) {
      errors.push({ row: format === 'csv' ? index + 2 : index + 1, reason: 'Duplicate of an earlier row in this file' })
      return
    }
    seen.add(result.fingerprint)
    questions.push(result)
  })

  return { questions, errors, total }
}
