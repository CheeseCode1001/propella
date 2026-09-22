import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  bankIdsIn,
  hasPositionalOptions,
  pickIds,
  shuffle,
  shuffleOptions,
  toQuizQuestion,
  type RandomInt,
} from './question-bank'
import type { QuizQuestion } from '../models/types'

/** Deterministic generator so failures can be reproduced. */
function seeded(seed: number): RandomInt {
  let state = seed >>> 0
  return (max) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state % max
  }
}

function question(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: 'pq_abc',
    stem: 'The reward for capital is',
    options: [
      { id: 'A', text: 'interest' },
      { id: 'B', text: 'rent' },
      { id: 'C', text: 'risk' },
      { id: 'D', text: 'premium' },
    ],
    correctOptionId: 'A',
    explanation: 'Capital earns interest.',
    topicSlug: 'theory-of-production',
    difficulty: 'medium',
    ...overrides,
  }
}

test('shuffle returns a permutation and leaves the input alone', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8]
  const copy = input.slice()
  const out = shuffle(input, seeded(1))
  assert.deepEqual(input, copy)
  assert.deepEqual(out.slice().sort((a, b) => a - b), copy)
})

test('shuffle actually reorders, and every item reaches every position', () => {
  const rng = seeded(7)
  const seenAt = new Map<number, Set<number>>()
  let unchanged = 0
  for (let run = 0; run < 400; run++) {
    const out = shuffle([0, 1, 2, 3], rng)
    if (out.join() === '0,1,2,3') unchanged += 1
    out.forEach((value, position) => {
      if (!seenAt.has(value)) seenAt.set(value, new Set())
      seenAt.get(value)!.add(position)
    })
  }
  // 1 in 24 orderings is the identity; far more than that means no shuffle.
  assert.ok(unchanged < 40, `identity order came up ${unchanged}/400 times`)
  for (const positions of seenAt.values()) assert.equal(positions.size, 4)
})

test('shuffle handles empty and single-item lists', () => {
  assert.deepEqual(shuffle([]), [])
  assert.deepEqual(shuffle(['x']), ['x'])
})

test('shuffleOptions keeps the correct answer attached to its text', () => {
  const rng = seeded(42)
  const positions = new Set<string>()
  for (let run = 0; run < 200; run++) {
    const out = shuffleOptions(question(), rng)
    assert.deepEqual(
      out.options.map((o) => o.id),
      ['A', 'B', 'C', 'D'],
    )
    const correct = out.options.find((o) => o.id === out.correctOptionId)
    assert.equal(correct?.text, 'interest')
    positions.add(out.correctOptionId)
  }
  // Over 200 shuffles the answer should have landed on every letter.
  assert.deepEqual([...positions].sort(), ['A', 'B', 'C', 'D'])
})

test('shuffleOptions does not mutate the original question', () => {
  const original = question()
  const snapshot = JSON.stringify(original)
  shuffleOptions(original, seeded(3))
  assert.equal(JSON.stringify(original), snapshot)
})

test('options that refer to other options keep their order', () => {
  const positional = question({
    options: [
      { id: 'A', text: 'mitochondria' },
      { id: 'B', text: 'ribosomes' },
      { id: 'C', text: 'A and B' },
      { id: 'D', text: 'none of the above' },
    ],
    correctOptionId: 'C',
  })
  assert.equal(hasPositionalOptions(positional.options), true)
  assert.deepEqual(shuffleOptions(positional, seeded(5)), positional)
  // Ordinary text that merely contains a capital letter is still shuffled.
  assert.equal(hasPositionalOptions(question().options), false)
  assert.equal(
    hasPositionalOptions([{ id: 'A', text: 'Vitamin A deficiency' }]),
    false,
  )
})

test('pickIds serves unseen questions before recently seen ones', () => {
  const ids = ['a', 'b', 'c', 'd', 'e']
  const exclude = new Set(['a', 'b'])

  const fresh = pickIds(ids, 3, { exclude, randomInt: seeded(1) })
  assert.deepEqual(fresh.slice().sort(), ['c', 'd', 'e'])

  const noRepeats = pickIds(ids, 5, { exclude, randomInt: seeded(2) })
  assert.equal(noRepeats.length, 3)

  const withRepeats = pickIds(ids, 5, { exclude, allowRepeats: true, randomInt: seeded(3) })
  assert.equal(withRepeats.length, 5)
  assert.deepEqual(withRepeats.slice(0, 3).sort(), ['c', 'd', 'e'])
  assert.equal(new Set(withRepeats).size, 5)
})

test('pickIds never exceeds the pool or the count', () => {
  assert.deepEqual(pickIds([], 10), [])
  assert.deepEqual(pickIds(['a'], 0), [])
  assert.equal(pickIds(['a', 'b'], 10, { allowRepeats: true }).length, 2)
})

test('pickIds varies from draw to draw', () => {
  const ids = Array.from({ length: 30 }, (_, i) => `q${i}`)
  const draws = new Set<string>()
  for (let run = 0; run < 20; run++) draws.add(pickIds(ids, 10).join())
  assert.ok(draws.size > 15, `only ${draws.size} distinct draws out of 20`)
})

test('toQuizQuestion maps a bank row and explains by answer text, not letter', () => {
  const q = toQuizQuestion({
    id: 'row1',
    exam: 'jamb',
    year: 2014,
    subjectSlug: 'biology',
    topicSlug: null,
    stem: 'The lowest level of organization in living organisms is',
    options: [
      { id: 'A', text: 'organ' },
      { id: 'B', text: 'cell' },
      { id: 'C', text: 'system' },
      { id: 'D', text: 'tissue' },
    ],
    correctOptionId: 'B',
    explanation: null,
    source: 'JAMB UTME 2014 Q4',
  })
  assert.equal(q.id, 'pq_row1')
  assert.equal(q.correctOptionId, 'B')
  assert.equal(q.topicSlug, 'biology')
  assert.equal(q.source, 'JAMB UTME 2014 Q4')
  assert.match(q.explanation, /"cell"/)
  assert.doesNotMatch(q.explanation, /\bB\b/)
})

test('toQuizQuestion carries a diagram through, and shuffling keeps it', () => {
  const row = {
    id: 'row2',
    exam: 'jamb' as const,
    year: 1990,
    subjectSlug: 'physics',
    topicSlug: 'current-electricity',
    stem: 'In the circuit shown, what is the current?',
    options: [
      { id: 'A', text: '1 A' },
      { id: 'B', text: '2 A' },
      { id: 'C', text: '3 A' },
      { id: 'D', text: '4 A' },
    ],
    correctOptionId: 'B',
    explanation: null,
    source: 'JAMB UTME 1990 Q12',
  }
  const withImage = toQuizQuestion({ ...row, imageUrl: '/static/past-questions/physics/1990-12.png' })
  assert.equal(withImage.imageUrl, '/static/past-questions/physics/1990-12.png')
  assert.equal(shuffleOptions(withImage).imageUrl, withImage.imageUrl)
  // No image, no key - quiz JSON stays as small as before.
  assert.ok(!('imageUrl' in toQuizQuestion({ ...row, imageUrl: null })))
})

test('bankIdsIn only returns ids of bank questions', () => {
  const ids = bankIdsIn([
    question({ id: 'pq_one' }),
    question({ id: 'qlk2j3_0' }),
    question({ id: 'pq_two' }),
  ])
  assert.deepEqual(ids, ['one', 'two'])
})
