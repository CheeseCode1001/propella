'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

/** Capability checks never change during a session, so nothing to subscribe to. */
const noopSubscribe = () => () => {}

/* -------------------------------------------------------------------------- */
/* Minimal Web Speech typings                                                  */
/*                                                                            */
/* The DOM lib still ships these as vendor-prefixed and largely untyped, so we */
/* declare only the surface this app actually touches.                        */
/* -------------------------------------------------------------------------- */

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognitionResult {
  readonly length: number
  isFinal: boolean
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
  readonly length: number
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionEventLike extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEventLike extends Event {
  error: string
  message?: string
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

/* -------------------------------------------------------------------------- */
/* Dictation                                                                   */
/* -------------------------------------------------------------------------- */

export type SpeechErrorKind =
  | 'not-supported'
  | 'permission-denied'
  | 'no-speech'
  | 'network'
  | 'unknown'

export interface UseDictationOptions {
  /** BCP-47 tag. Nigerian English falls back to en-GB on most engines. */
  lang?: string
  /** Called with the finalized text each time a phrase completes. */
  onFinalText?: (text: string) => void
}

export interface UseDictationResult {
  supported: boolean
  listening: boolean
  /** Text for the phrase currently being spoken, before it is finalized. */
  interim: string
  error: SpeechErrorKind | null
  start: () => void
  stop: () => void
  toggle: () => void
}

/**
 * Live speech-to-text for the message composer.
 *
 * Finalized phrases are handed to `onFinalText` so the caller can append them
 * to whatever the student has already typed; the in-progress phrase is exposed
 * separately as `interim` so it can be shown greyed out without being committed.
 *
 * Recognition engines stop on their own after a pause. While the student still
 * has the mic on we restart it, so dictating a long question does not silently
 * cut out mid-sentence.
 */
export function useDictation(options: UseDictationOptions = {}): UseDictationResult {
  const { lang = 'en-NG', onFinalText } = options

  // Read through useSyncExternalStore so the server renders "unsupported" and
  // the client gets the real answer on its first render, with no effect.
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => getRecognitionCtor() !== null,
    () => false,
  )

  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<SpeechErrorKind | null>(null)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  // Read inside engine callbacks, which are not re-created per render.
  const wantsToListenRef = useRef(false)
  const onFinalTextRef = useRef(onFinalText)

  useEffect(() => {
    onFinalTextRef.current = onFinalText
  }, [onFinalText])

  const stop = useCallback(() => {
    wantsToListenRef.current = false
    setListening(false)
    setInterim('')
    recognitionRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setError('not-supported')
      return
    }

    // Restarting a live instance throws; reuse is not worth the edge cases.
    recognitionRef.current?.abort()

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      let finalText = ''
      let pending = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result) continue
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) finalText += text
        else pending += text
      }

      setInterim(pending)
      if (finalText.trim()) onFinalTextRef.current?.(finalText.trim())
    }

    recognition.onerror = (event) => {
      // A pause in speech is normal, not a failure worth surfacing.
      if (event.error === 'no-speech' || event.error === 'aborted') return

      setError(
        event.error === 'not-allowed' || event.error === 'service-not-allowed'
          ? 'permission-denied'
          : event.error === 'network'
            ? 'network'
            : 'unknown',
      )
      wantsToListenRef.current = false
      setListening(false)
      setInterim('')
    }

    recognition.onend = () => {
      setInterim('')
      // The engine times out on silence. Resume while the mic is still on.
      if (wantsToListenRef.current) {
        try {
          recognition.start()
        } catch {
          wantsToListenRef.current = false
          setListening(false)
        }
      } else {
        setListening(false)
      }
    }

    recognitionRef.current = recognition
    wantsToListenRef.current = true
    setError(null)

    try {
      recognition.start()
      setListening(true)
    } catch {
      wantsToListenRef.current = false
      setListening(false)
      setError('unknown')
    }
  }, [lang])

  const toggle = useCallback(() => {
    if (wantsToListenRef.current) stop()
    else start()
  }, [start, stop])

  // Releasing the mic on unmount matters — the browser keeps the indicator on.
  useEffect(() => {
    return () => {
      wantsToListenRef.current = false
      recognitionRef.current?.abort()
    }
  }, [])

  return { supported, listening, interim, error, start, stop, toggle }
}

/* -------------------------------------------------------------------------- */
/* Read-aloud                                                                  */
/* -------------------------------------------------------------------------- */

export interface UseSpeechResult {
  supported: boolean
  speaking: boolean
  speak: (text: string) => void
  stop: () => void
}

/** Strips markdown so the synthesiser reads prose, not punctuation. */
function toSpokenText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' (code example) ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Reads assistant replies aloud.
 *
 * Chrome drops utterances longer than roughly 200 characters, so long answers
 * are split on sentence boundaries and queued.
 */
export function useSpeech(): UseSpeechResult {
  const supported = useSyncExternalStore(
    noopSubscribe,
    () => 'speechSynthesis' in window,
    () => false,
  )

  const [speaking, setSpeaking] = useState(false)

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

      window.speechSynthesis.cancel()

      const spoken = toSpokenText(text)
      if (!spoken) return

      const chunks = spoken.match(/[^.!?]+[.!?]*\s*/g) ?? [spoken]
      const batched: string[] = []
      let current = ''

      for (const chunk of chunks) {
        if ((current + chunk).length > 180) {
          if (current) batched.push(current)
          current = chunk
        } else {
          current += chunk
        }
      }
      if (current) batched.push(current)

      batched.forEach((part, index) => {
        const utterance = new SpeechSynthesisUtterance(part)
        utterance.lang = 'en-GB'
        utterance.rate = 1
        if (index === batched.length - 1) {
          utterance.onend = () => setSpeaking(false)
        }
        utterance.onerror = () => setSpeaking(false)
        window.speechSynthesis.speak(utterance)
      })

      setSpeaking(true)
    },
    [],
  )

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  return { supported, speaking, speak, stop }
}
