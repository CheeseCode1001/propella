import { test } from 'node:test'
import assert from 'node:assert/strict'
import { liveStreak, nextStreak, type StreakState } from './streak'

const day = (d: number, hour = 12) => new Date(2026, 8, d, hour)

function state(currentStreak: number, lastActive: Date, freezesAvailable = 1): StreakState {
  return { currentStreak, longestStreak: currentStreak, lastActiveDate: lastActive, freezesAvailable, freezesUsed: [] }
}

test('the first activity starts a streak of 1', () => {
  assert.equal(nextStreak(null, day(10)).state.currentStreak, 1)
  // Signup creates a 0-day row dated today: the first quiz that day still counts.
  const { state: s, changed } = nextStreak(state(0, day(10, 8)), day(10, 20))
  assert.equal(changed, true)
  assert.equal(s.currentStreak, 1)
})

test('a day counts once', () => {
  const { state: s, changed } = nextStreak(state(3, day(10, 8)), day(10, 23))
  assert.equal(changed, false)
  assert.equal(s.currentStreak, 3)
})

test('studying the next day continues the streak', () => {
  const s = nextStreak(state(3, day(10, 23)), day(11, 1)).state
  assert.equal(s.currentStreak, 4)
  assert.equal(s.longestStreak, 4)
})

test('one missed day is bridged by a freeze, and the freeze is spent', () => {
  const s = nextStreak(state(5, day(10)), day(12)).state
  assert.equal(s.currentStreak, 6)
  assert.equal(s.freezesAvailable, 0)
  assert.equal(s.freezesUsed.length, 1)
  assert.equal(s.freezesUsed[0]!.getDate(), 11)
})

test('without a freeze, or after a longer gap, the streak starts again', () => {
  assert.equal(nextStreak(state(5, day(10), 0), day(12)).state.currentStreak, 1)
  const s = nextStreak(state(5, day(10)), day(15)).state
  assert.equal(s.currentStreak, 1)
  assert.equal(s.longestStreak, 5, 'the record survives a reset')
  assert.equal(s.freezesAvailable, 1, 'a freeze is not wasted on a gap it cannot bridge')
})

test('a lapsed streak shows as 0 until the student studies again', () => {
  assert.equal(liveStreak(state(4, day(10)), day(10)), 4)
  assert.equal(liveStreak(state(4, day(10)), day(11)), 4, 'still savable today')
  assert.equal(liveStreak(state(4, day(10)), day(12)), 4, 'a freeze can still save it')
  assert.equal(liveStreak(state(4, day(10), 0), day(12)), 0)
  assert.equal(liveStreak(state(4, day(10)), day(14)), 0)
  assert.equal(liveStreak(null, day(10)), 0)
})
