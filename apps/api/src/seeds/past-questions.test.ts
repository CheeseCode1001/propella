import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'fs'
import path from 'path'
import { loadPastQuestionFile, pastQuestionFiles, PAST_QUESTIONS_DIR } from './past-questions'
import { BANK_IMAGE_PREFIX, parsePastQuestions } from '../lib/past-question-import'
import { shuffleOptions, toQuizQuestion } from '../lib/question-bank'

/**
 * Checks the shipped question bank itself: every row must import cleanly,
 * point at a real syllabus topic, and survive option shuffling with its
 * answer intact.
 */

const files = pastQuestionFiles()

test('the bank ships data files', () => {
  assert.ok(files.length > 0, 'no files in data/past-questions')
})

for (const file of files) {
  const name = path.basename(file)

  test(`${name}: every row imports and matches the syllabus`, () => {
    const questions = loadPastQuestionFile(file)
    assert.ok(questions.length > 0)

    for (const q of questions) {
      const texts = q.options.map((o) => o.text.trim().toLowerCase())
      assert.equal(new Set(texts).size, 4, `${q.source}: options are not distinct`)
      assert.ok(q.topicSlug, `${q.source}: no topic`)
      assert.ok(q.stem.length >= 8, `${q.source}: stem too short`)
      assert.doesNotMatch(
        `${q.stem} ${texts.join(' ')}`,
        /myschoolgist|this question is based|questions \d+ (to|and) \d+/i,
        `${q.source}: extraction junk in text`,
      )
    }
  })

  test(`${name}: no question appears twice`, () => {
    const questions = loadPastQuestionFile(file)
    const sources = questions.map((q) => q.source)
    assert.equal(new Set(sources).size, sources.length, 'duplicate source')
    // Two diagram questions may share a stem ("Which of the diagrams...") and
    // still differ by their picture, so the image is part of the identity.
    const stems = questions.map(
      (q) => `${q.stem.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()}|${q.imageUrl ?? ''}`,
    )
    assert.equal(new Set(stems).size, stems.length, 'duplicate stem')
  })

  test(`${name}: every diagram it points at ships with it`, () => {
    for (const q of loadPastQuestionFile(file)) {
      if (!q.imageUrl) continue
      assert.ok(q.imageUrl.startsWith(BANK_IMAGE_PREFIX), `${q.source}: image is not a bank path`)
      const onDisk = path.join(PAST_QUESTIONS_DIR, 'images', q.imageUrl.slice(BANK_IMAGE_PREFIX.length))
      assert.ok(fs.existsSync(onDisk), `${q.source}: missing ${q.imageUrl}`)
      assert.ok(fs.statSync(onDisk).size > 500, `${q.source}: ${q.imageUrl} is empty`)
    }
  })

  test(`${name}: shuffling never loses the answer`, () => {
    for (const q of loadPastQuestionFile(file)) {
      const served = toQuizQuestion({
        id: q.fingerprint,
        exam: q.exam,
        year: q.year,
        subjectSlug: q.subjectSlug,
        topicSlug: q.topicSlug,
        stem: q.stem,
        options: q.options,
        correctOptionId: q.correctOptionId,
        explanation: q.explanation,
        source: q.source,
        imageUrl: q.imageUrl,
      })
      assert.equal(served.imageUrl, q.imageUrl ?? undefined, `${q.source}: image dropped`)
      const answer = q.options.find((o) => o.id === q.correctOptionId)!.text
      for (let run = 0; run < 5; run++) {
        const shuffled = shuffleOptions(served)
        const picked = shuffled.options.find((o) => o.id === shuffled.correctOptionId)
        assert.equal(picked?.text, answer, `${q.source}: answer moved`)
      }
    }
  })
}

test('fingerprints are unique across the whole bank', () => {
  const all = files.flatMap((f) => loadPastQuestionFile(f).map((q) => q.fingerprint))
  assert.equal(new Set(all).size, all.length)
})

test('the importer accepts bank and https images and refuses anything else', () => {
  const row = (image: string) =>
    JSON.stringify([
      {
        exam: 'jamb',
        year: 1990,
        subject: 'physics',
        question: 'In the circuit shown, what is the current?',
        options: ['1 A', '2 A', '3 A', '4 A'].map((text, i) => ({ id: 'ABCD'[i], text })),
        answer: 'B',
        image,
      },
    ])
  const ok = (image: string) => parsePastQuestions(row(image), 'json').errors.length === 0

  assert.ok(ok('/static/past-questions/physics/1990-12.png'))
  assert.ok(ok('https://cdn.example.com/diagram.png'))
  assert.ok(!ok('/static/past-questions/../../.env'))
  assert.ok(!ok('/static/past-questions/physics/1990-12.svg'))
  assert.ok(!ok('http://insecure.example.com/diagram.png'))
  assert.ok(!ok('javascript:alert(1)'))
  assert.ok(!ok('C:\Users\diagram.png'))
  assert.equal(parsePastQuestions(row(''), 'json').questions[0]?.imageUrl, null)
})
