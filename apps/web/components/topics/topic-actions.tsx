'use client'

import { useMemo, useState } from 'react'
import { Magicpen, Note1, TaskSquare, VolumeHigh, PauseCircle, CloseCircle } from 'iconsax-reactjs'
import { useSpeech } from '@/lib/hooks/use-speech'
import { cn } from '@/lib/utils/cn'
import { TopicNoteModal } from './topic-note-modal'
import { TopicTodoModal } from './topic-todo-modal'
import { TopicChatModal } from './topic-chat-modal'

interface TopicSection {
  heading: string
  points: string[]
}

interface TopicExample {
  title: string
  problem: string
  walkthrough: string[]
  answer: string
}

export interface TopicForActions {
  subjectSlug: string
  subjectName: string
  topicSlug: string
  topicName: string
  intro: string
  sections: TopicSection[]
  examples: TopicExample[]
  summary: string[]
}

/** Flattens the lesson into the order a person would read it aloud. */
function toSpokenScript(topic: TopicForActions): string {
  const parts: string[] = [topic.topicName, topic.intro]

  for (const section of topic.sections) {
    parts.push(section.heading)
    parts.push(...section.points)
  }

  for (const example of topic.examples) {
    parts.push(example.title, example.problem)
    parts.push(...example.walkthrough)
    parts.push(`The answer is ${example.answer}`)
  }

  if (topic.summary.length > 0) {
    parts.push('In summary.')
    parts.push(...topic.summary)
  }

  // A full stop between parts makes the synthesiser pause instead of running
  // headings straight into the sentence after them.
  return parts.map((p) => p.trim().replace(/\.?$/, '.')).join(' ')
}

type OpenModal = 'note' | 'todo' | 'chat' | null

function ActionButton({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: typeof Note1
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5',
        'text-[12.5px] font-medium transition-colors',
        active
          ? 'border border-[var(--color-danger)] bg-[var(--color-danger)] text-white'
          : 'border border-[var(--color-rule-2)] bg-[var(--color-paper)] text-[var(--color-ink-2)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
      )}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <Icon size={15} color="currentColor" variant={active ? 'Bold' : 'Linear'} />
      {label}
    </button>
  )
}

/**
 * The four things a student wants while reading a topic, pinned to the top so
 * they stay reachable however far down the page they are.
 *
 * Each opens a modal rather than navigating away — losing your place in a
 * lesson to jot one line down is the thing worth avoiding.
 */
export function TopicActions({ topic }: { topic: TopicForActions }) {
  const { supported: canSpeak, speaking, speak, stop } = useSpeech()
  const [openModal, setOpenModal] = useState<OpenModal>(null)
  // Bumped on every open so the modals remount with fresh fields — cheaper and
  // more predictable than an effect that resets state when `open` flips.
  const [session, setSession] = useState(0)

  function openWith(which: Exclude<OpenModal, null>) {
    setSession((s) => s + 1)
    setOpenModal(which)
  }

  const script = useMemo(() => toSpokenScript(topic), [topic])

  return (
    <>
      {/*
        Sticky under the shell's top bar. The negative margins let the bar span
        the full content width while the article itself stays measure-width.
      */}
      <div
        className="sticky top-0 z-20 -mx-4 mb-7 border-b border-[var(--color-rule)] px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-7 lg:px-7"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-paper) 88%, transparent)' }}
      >
        <div className="scrollbar-hide flex gap-2 overflow-x-auto">
          <ActionButton
            icon={Magicpen}
            label="Ask AI"
            onClick={() => openWith('chat')}
          />
          <ActionButton
            icon={Note1}
            label="Take notes"
            onClick={() => openWith('note')}
          />
          <ActionButton
            icon={TaskSquare}
            label="Create todo"
            onClick={() => openWith('todo')}
          />
          {canSpeak && (
            <ActionButton
              icon={speaking ? PauseCircle : VolumeHigh}
              label={speaking ? 'Stop' : 'Read to me'}
              active={speaking}
              onClick={() => (speaking ? stop() : speak(script))}
            />
          )}
        </div>
      </div>

      {/* Floating listen button — the one action a student uses hands-free, so
          it stays put rather than living only in the header. */}
      {canSpeak && (
        <button
          type="button"
          onClick={() => (speaking ? stop() : speak(script))}
          aria-label={speaking ? 'Stop reading this topic' : 'Read this topic aloud'}
          className="fixed right-4 z-30 flex items-center gap-2 rounded-full border-none px-4 py-3 text-[13px] font-semibold text-white transition-transform active:scale-95 lg:right-8"
          style={{
            bottom: 'calc(80px + env(safe-area-inset-bottom))',
            backgroundColor: speaking ? 'var(--color-danger)' : 'var(--color-accent)',
            fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
          }}
        >
          {speaking ? (
            <>
              <CloseCircle size={18} color="currentColor" variant="Bold" />
              Stop
            </>
          ) : (
            <>
              <VolumeHigh size={18} color="currentColor" variant="Bold" />
              Listen
            </>
          )}
        </button>
      )}

      <TopicChatModal
        key={`chat-${session}`}
        open={openModal === 'chat'}
        onClose={() => setOpenModal(null)}
        subjectSlug={topic.subjectSlug}
        subjectName={topic.subjectName}
        topicSlug={topic.topicSlug}
        topicName={topic.topicName}
      />

      <TopicNoteModal
        key={`note-${session}`}
        open={openModal === 'note'}
        onClose={() => setOpenModal(null)}
        subjectSlug={topic.subjectSlug}
        subjectName={topic.subjectName}
        topicSlug={topic.topicSlug}
        topicName={topic.topicName}
      />

      <TopicTodoModal
        key={`todo-${session}`}
        open={openModal === 'todo'}
        onClose={() => setOpenModal(null)}
        subjectSlug={topic.subjectSlug}
        subjectName={topic.subjectName}
        topicSlug={topic.topicSlug}
        topicName={topic.topicName}
      />
    </>
  )
}
