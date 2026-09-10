'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MarathonStatus = 'idle' | 'running' | 'paused' | 'completed' | 'stopped'

export interface MarathonSummary {
  pomodorosCompleted: number
  durationSec: number
  xpAwarded: number
}

interface MarathonState {
  runId: string | null
  status: MarathonStatus

  /** Epoch ms when the run began. */
  startedAt: number | null
  plannedDurationMin: number
  pomodoroLength: number
  subjectSlugs: string[]
  pomodorosCompleted: number

  /** Epoch ms of the current pause, and total paused time before it. */
  pausedAt: number | null
  pausedMs: number

  /** Populated once the run ends, so the widget can show the celebration. */
  summary: MarathonSummary | null

  start: (run: {
    runId: string
    plannedDurationMin: number
    pomodoroLength: number
    subjectSlugs: string[]
  }) => void
  pause: () => void
  resume: () => void
  completePomodoro: () => void
  finish: (summary: MarathonSummary) => void
  /** Ended early: recorded, but no XP, badge or celebration. */
  stop: () => void
  reset: () => void
}

const initial = {
  runId: null,
  status: 'idle' as MarathonStatus,
  startedAt: null,
  plannedDurationMin: 60,
  pomodoroLength: 25,
  subjectSlugs: [] as string[],
  pomodorosCompleted: 0,
  pausedAt: null,
  pausedMs: 0,
  summary: null,
}

export const useMarathonStore = create<MarathonState>()(
  persist(
    (set) => ({
      ...initial,

      start: (run) =>
        set({
          ...initial,
          runId: run.runId,
          status: 'running',
          startedAt: Date.now(),
          plannedDurationMin: run.plannedDurationMin,
          pomodoroLength: run.pomodoroLength,
          subjectSlugs: run.subjectSlugs,
        }),

      pause: () => set((s) => (s.status === 'running' ? { status: 'paused', pausedAt: Date.now() } : s)),

      resume: () =>
        set((s) =>
          s.status === 'paused'
            ? {
                status: 'running',
                pausedMs: s.pausedMs + (s.pausedAt ? Date.now() - s.pausedAt : 0),
                pausedAt: null,
              }
            : s,
        ),

      completePomodoro: () => set((s) => ({ pomodorosCompleted: s.pomodorosCompleted + 1 })),

      finish: (summary) => set({ status: 'completed', summary, pausedAt: null }),

      stop: () => set({ status: 'stopped', summary: null, pausedAt: null }),

      reset: () => set({ ...initial }),
    }),
    {
      // Survives navigation and refresh so the timer keeps running while the
      // student moves around the dashboard.
      name: 'propella-marathon',
    },
  ),
)

/** Seconds of actual study time, excluding any paused stretches. */
export function elapsedSeconds(s: {
  startedAt: number | null
  pausedMs: number
  pausedAt: number | null
}): number {
  if (!s.startedAt) return 0
  const pausedNow = s.pausedAt ? Date.now() - s.pausedAt : 0
  return Math.max(0, Math.floor((Date.now() - s.startedAt - s.pausedMs - pausedNow) / 1000))
}

/**
 * True while a run is in progress. Distracting controls (sign out, leaderboard)
 * are disabled during this window.
 */
export function useMarathonActive(): boolean {
  return useMarathonStore((s) => s.status === 'running' || s.status === 'paused')
}
