'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Link } from '@/lib/i18n/navigation'
import { Pause, Play, Square, Trophy, ChevronDown, ChevronUp, X } from 'lucide-react'
import { api } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Confetti } from './confetti'
import { elapsedSeconds, useMarathonStore } from '@/lib/stores/marathon-store'

function formatTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Badge tier earned for a completed run. */
function badgeFor(pomodoros: number): { name: string; tint: string; ink: string } {
  if (pomodoros >= 8) {
    return { name: 'Marathoner', tint: 'var(--color-accent-tint)', ink: 'var(--color-accent)' }
  }
  if (pomodoros >= 6) {
    return { name: 'Iron Will', tint: 'var(--color-success-tint)', ink: 'var(--color-success)' }
  }
  if (pomodoros >= 4) {
    return { name: 'Locked In', tint: 'var(--color-warning-tint)', ink: 'var(--color-warning)' }
  }
  return { name: 'Focused', tint: 'var(--color-paper-3)', ink: 'var(--color-ink-2)' }
}

export function MarathonWidget() {
  const queryClient = useQueryClient()
  const store = useMarathonStore()
  const {
    runId,
    status,
    plannedDurationMin,
    pomodoroLength,
    pomodorosCompleted,
    summary,
  } = store

  const [elapsed, setElapsed] = useState(0)
  const [busy, setBusy] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  // Guards against the auto-finish effect firing twice while the request is in flight.
  const finishingRef = useRef(false)

  const pomodoroSec = pomodoroLength * 60
  const plannedPomodoros = Math.max(1, Math.floor(plannedDurationMin / pomodoroLength))

  // Tick once a second while the run is live. Elapsed time is always derived
  // from the stored timestamps, so a refresh or navigation cannot drift it.
  useEffect(() => {
    if (status !== 'running' && status !== 'paused') return
    const update = () => setElapsed(elapsedSeconds(useMarathonStore.getState()))
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [status])

  const endRun = useCallback(
    async (pomodoros: number, durationSec: number) => {
      if (!runId) return
      setBusy(true)
      try {
        const res = await api.post<{ data: { xpAwarded: number } }>(
          `/marathon/${runId}/end`,
          {
            actualDurationSec: durationSec,
            pomodorosCompleted: pomodoros,
            topicsCovered: [],
          },
        )
        useMarathonStore.getState().finish({
          pomodorosCompleted: pomodoros,
          durationSec,
          xpAwarded: res.data.xpAwarded,
        })
        // The marathon page reads this list, so the finished run shows up there.
        void queryClient.invalidateQueries({ queryKey: ['marathon-history'] })
        void queryClient.invalidateQueries({ queryKey: ['streak-xp'] })
      } catch {
        // Keep the run on screen so the student can retry rather than lose it.
        finishingRef.current = false
      } finally {
        setBusy(false)
      }
    },
    [runId, queryClient],
  )

  // Count finished pomodoros, and close the run out once the target is hit.
  useEffect(() => {
    if (status !== 'running') return
    const done = Math.floor(elapsed / pomodoroSec)
    if (done > pomodorosCompleted) {
      useMarathonStore.setState({ pomodorosCompleted: done })
    }
    if (done >= plannedPomodoros && !finishingRef.current) {
      finishingRef.current = true
      void endRun(done, elapsed)
    }
  }, [elapsed, status, pomodoroSec, pomodorosCompleted, plannedPomodoros, endRun])

  if (status === 'idle') return null

  const isDone = status === 'completed'
  const isStopped = status === 'stopped'
  const inPomodoroSec = elapsed % pomodoroSec
  const remaining = Math.max(0, pomodoroSec - inPomodoroSec)
  const pomodoroPct = Math.min(100, (inPomodoroSec / pomodoroSec) * 100)
  const overallPct = Math.min(100, (pomodorosCompleted / plannedPomodoros) * 100)
  const badge = summary ? badgeFor(summary.pomodorosCompleted) : null

  async function handlePause() {
    if (!runId) return
    setBusy(true)
    useMarathonStore.getState().pause()
    try {
      await api.post(`/marathon/${runId}/pause`)
    } catch {
      // Local state already reflects the pause; the timer is the source of truth.
    } finally {
      setBusy(false)
    }
  }

  async function handleResume() {
    if (!runId) return
    setBusy(true)
    useMarathonStore.getState().resume()
    try {
      await api.post(`/marathon/${runId}/resume`)
    } catch {
      /* no-op — see handlePause */
    } finally {
      setBusy(false)
    }
  }

  /**
   * Stopping early is not a completion: the run is recorded as abandoned, no XP
   * is awarded and nothing is celebrated. Only running the marathon out earns
   * the badge.
   */
  async function handleStop() {
    if (!runId) return
    const confirmed = window.confirm(
      'Stop this marathon? It will be saved as unfinished, and this run will not earn XP.',
    )
    if (!confirmed) return

    finishingRef.current = true
    setBusy(true)
    try {
      await api.post(`/marathon/${runId}/abandon`, {
        actualDurationSec: elapsed,
        pomodorosCompleted,
        topicsCovered: [],
      })
      void queryClient.invalidateQueries({ queryKey: ['marathon-history'] })
      useMarathonStore.getState().stop()
    } catch {
      finishingRef.current = false
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      role="region"
      aria-label="Marathon in progress"
      style={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        width: 268,
        zIndex: 60,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-rule-2)',
        backgroundColor: 'var(--color-card)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
        overflow: 'hidden',
      }}
      className="max-md:right-3 max-md:bottom-[calc(72px+env(safe-area-inset-bottom))] max-md:w-[calc(100vw-24px)] max-md:max-w-[300px]"
    >
      {/* Celebration is reserved for a marathon actually seen through. */}
      {isDone && <Confetti />}

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '10px 12px',
          borderBottom: collapsed ? 'none' : '1px solid var(--color-rule)',
          backgroundColor: 'var(--color-paper-2)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: isDone
              ? 'var(--color-success)'
              : isStopped
                ? 'var(--color-ink-3)'
                : 'var(--color-accent)',
            fontWeight: 600,
          }}
        >
          {isDone
            ? 'Marathon complete'
            : isStopped
              ? 'Marathon stopped'
              : status === 'paused'
                ? 'Paused'
                : 'Marathon'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!isDone && !isStopped && (
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand marathon' : 'Collapse marathon'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 3,
                color: 'var(--color-ink-3)',
                display: 'flex',
              }}
            >
              {collapsed ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          )}
          {(isDone || isStopped) && (
            <button
              type="button"
              onClick={() => useMarathonStore.getState().reset()}
              aria-label="Dismiss"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 3,
                color: 'var(--color-ink-3)',
                display: 'flex',
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {isStopped ? (
        /* Ended early — factual, not celebratory, and never shaming. */
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <p style={{ fontSize: 13.5, color: 'var(--color-ink-2)', marginBottom: 4 }}>
            Saved as unfinished. No XP for this one.
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--color-ink-3)', marginBottom: 14 }}>
            {formatTime(elapsed)} of focus still counts. Start another when you are ready.
          </p>
          <Button
            variant="secondary"
            size="sm"
            style={{ width: '100%' }}
            onClick={() => useMarathonStore.getState().reset()}
          >
            Close
          </Button>
        </div>
      ) : collapsed && !isDone ? (
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 18,
              color: 'var(--color-ink)',
            }}
          >
            {formatTime(remaining)}
          </span>
          <span style={{ fontSize: 11, color: 'var(--color-ink-3)' }}>
            {pomodorosCompleted}/{plannedPomodoros}
          </span>
        </div>
      ) : isDone && summary && badge ? (
        /* ── Celebration ─────────────────────────────────────────── */
        <div style={{ padding: '18px 16px', textAlign: 'center', position: 'relative' }}>
          <div
            style={{
              width: 46,
              height: 46,
              margin: '0 auto 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: badge.tint,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Trophy size={22} color={badge.ink} strokeWidth={1.8} />
          </div>

          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 17,
              color: 'var(--color-ink)',
              marginBottom: 2,
            }}
          >
            {badge.name}
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--color-ink-2)', marginBottom: 12 }}>
            {summary.pomodorosCompleted} pomodoro
            {summary.pomodorosCompleted === 1 ? '' : 's'} in {formatTime(summary.durationSec)}
          </p>

          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-success)',
              marginBottom: 14,
            }}
          >
            +{summary.xpAwarded} XP
          </p>

          <Button variant="secondary" size="sm" asChild style={{ width: '100%' }}>
            <Link href="/marathon" onClick={() => useMarathonStore.getState().reset()}>
              View marathons
            </Link>
          </Button>
        </div>
      ) : (
        /* ── Live run ────────────────────────────────────────────── */
        <div style={{ padding: '14px 14px 12px' }}>
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 34,
                lineHeight: 1,
                color: 'var(--color-ink)',
                letterSpacing: '-0.02em',
              }}
            >
              {formatTime(remaining)}
            </span>
            <p style={{ fontSize: 11.5, color: 'var(--color-ink-3)', marginTop: 4 }}>
              Pomodoro {Math.min(pomodorosCompleted + 1, plannedPomodoros)} of {plannedPomodoros}
              {' · '}
              {formatTime(elapsed)} total
            </p>
          </div>

          {/* Current pomodoro */}
          <div
            style={{
              height: 5,
              borderRadius: 999,
              backgroundColor: 'var(--color-paper-3)',
              overflow: 'hidden',
              marginBottom: 6,
            }}
          >
            <div
              style={{
                width: `${pomodoroPct}%`,
                height: '100%',
                backgroundColor: 'var(--color-accent)',
                transition: 'width 1s linear',
              }}
            />
          </div>

          {/* Whole run */}
          <div
            style={{
              height: 3,
              borderRadius: 999,
              backgroundColor: 'var(--color-paper-3)',
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: `${overallPct}%`,
                height: '100%',
                backgroundColor: 'var(--color-success)',
                transition: 'width 0.4s',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {status === 'paused' ? (
              <Button
                variant="accent"
                size="sm"
                onClick={handleResume}
                disabled={busy}
                style={{ flex: 1 }}
              >
                <Play size={14} strokeWidth={2} style={{ marginRight: 5 }} />
                Resume
              </Button>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={handlePause}
                disabled={busy}
                style={{ flex: 1 }}
              >
                <Pause size={14} strokeWidth={2} style={{ marginRight: 5 }} />
                Pause
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStop}
              disabled={busy}
              aria-label="Stop marathon"
              style={{ color: 'var(--color-danger)' }}
            >
              <Square size={14} strokeWidth={2} style={{ marginRight: 5 }} />
              Stop
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
