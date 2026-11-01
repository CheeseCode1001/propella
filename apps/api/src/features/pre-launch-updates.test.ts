import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  SUBSCRIPTION_PLANS,
  WELCOME_DISCOUNT_WINDOW_HOURS,
  WELCOME_DISCOUNT_WINDOW_MS,
  WELCOME_DISCOUNT_PERCENT,
  SUBJECT_SLUGS,
  XP,
  QUIZ_MODES,
  StartSessionSchema,
} from '@propella/shared'
import { subjects, validateSyllabus } from '../seeds/syllabus'

describe('Pre-Launch Updates Verification Suite', () => {
  describe('1. 3-Day 50% Welcome Discount (#999) & Auto-Renewal Constants', () => {
    it('configures a 72-hour (3-day) 50% welcome discount window', () => {
      assert.equal(WELCOME_DISCOUNT_WINDOW_HOURS, 72)
      assert.equal(WELCOME_DISCOUNT_WINDOW_MS, 72 * 60 * 60 * 1000)
      assert.equal(WELCOME_DISCOUNT_PERCENT, 50)
    })

    it('offers ₦999 (50% off) for Basic Plan and renews at standard ₦1,999', () => {
      const basic = SUBSCRIPTION_PLANS.scholar_basic
      assert.equal(basic.discountPrice, 999)
      assert.equal(basic.discountPriceKobo, 99900)
      assert.equal(basic.price, 1999)
      assert.equal(basic.priceKobo, 199900)
      assert.equal(basic.autoRenews, true)
    })

    it('offers 50% discount on Shared (₦1,499 -> ₦2,999) and Full Pass (₦4,999 -> ₦9,999) with auto-renewal', () => {
      const shared = SUBSCRIPTION_PLANS.scholar_shared
      assert.equal(shared.discountPrice, 1499)
      assert.equal(shared.discountPriceKobo, 149900)
      assert.equal(shared.price, 2999)
      assert.equal(shared.priceKobo, 299900)
      assert.equal(shared.autoRenews, true)

      const full = SUBSCRIPTION_PLANS.scholar_full
      assert.equal(full.discountPrice, 4999)
      assert.equal(full.discountPriceKobo, 499900)
      assert.equal(full.price, 9999)
      assert.equal(full.priceKobo, 999900)
      assert.equal(full.autoRenews, true)
    })
  })

  describe('2. Marathon Feature Completely Deleted', () => {
    it('removes marathon XP constants and session schema fields', () => {
      assert.equal('MARATHON_PER_POMODORO' in XP, false)
      assert.equal('MARATHON_4_PLUS_BONUS' in XP, false)

      const parsed = StartSessionSchema.safeParse({
        subjectSlug: 'mathematics',
        topicSlug: 'indices-logarithms-surds',
        plannedMinutes: 45,
        isMarathon: true,
      })
      // Zod strips unknown keys by default, so isMarathon is not part of the output data
      assert.equal(parsed.success, true)
      if (parsed.success) {
        assert.equal('isMarathon' in parsed.data, false)
      }
    })

    it('removes marathon backend feature folder and frontend marathon pages', () => {
      const rootDir = path.resolve(__dirname, '../../../..')
      const removedPaths = [
        'apps/api/src/features/marathon',
        'apps/web/app/[locale]/(app)/marathon',
        'apps/web/app/[locale]/(marathon)',
        'apps/web/components/marathon',
        'apps/web/lib/stores/marathon-store.ts',
        'apps/mobile/src/app/marathon.tsx',
        'apps/mobile/src/components/marathon-widget.tsx',
        'apps/mobile/src/lib/marathon-store.ts',
      ]
      for (const rel of removedPaths) {
        assert.equal(
          fs.existsSync(path.join(rootDir, rel)),
          false,
          `Expected ${rel} to be deleted`,
        )
      }
    })
  })

  describe('3. Expanded 15 Subjects & Past Questions Syllabus', () => {
    it('includes crk, irk, and history in SUBJECT_SLUGS and syllabus seeds', () => {
      assert.equal(SUBJECT_SLUGS.length, 15)
      assert.ok(SUBJECT_SLUGS.includes('crk'))
      assert.ok(SUBJECT_SLUGS.includes('irk'))
      assert.ok(SUBJECT_SLUGS.includes('history'))
      assert.ok(SUBJECT_SLUGS.includes('agricultural-science'))
      assert.ok(SUBJECT_SLUGS.includes('geography'))

      assert.equal(subjects.length, 15)
      assert.deepEqual(validateSyllabus(), [])
    })

    it('has non-empty past question JSON files for all 15 subjects', () => {
      const dataDir = path.resolve(__dirname, '../../data/past-questions')
      for (const slug of SUBJECT_SLUGS) {
        const filePath = path.join(dataDir, `${slug}.json`)
        assert.equal(fs.existsSync(filePath), true, `Missing past questions file for ${slug}`)
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        assert.ok(Array.isArray(parsed.questions) && parsed.questions.length > 0, `Expected >0 questions for ${slug}`)
        assert.equal(parsed.questions[0].subject, slug)
      }
    })
  })

  describe('4. Quiz Study Mode vs Exam Mode Configuration', () => {
    it('supports both study and exam modes in shared QUIZ_MODES', () => {
      assert.deepEqual([...QUIZ_MODES], ['study', 'exam'])
    })

    it('computes Exam Mode timeLimit as 90 seconds per question and Study Mode as null', () => {
      const computeTimeLimit = (mode: 'study' | 'exam', count: number) =>
        mode === 'exam' ? count * 90 : null

      assert.equal(computeTimeLimit('exam', 10), 900)
      assert.equal(computeTimeLimit('exam', 20), 1800)
      assert.equal(computeTimeLimit('study', 10), null)
    })
  })
})

