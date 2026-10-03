'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

/**
 * WhatsApp-style thinking animation bubble.
 * Features 3 bouncing dots with staggered delays in an organic wave.
 */
export function AiThinkingBubble({ label = 'Propella is thinking' }: { label?: string }) {
  return (
    <div className="flex justify-start mb-4 animate-in fade-in-50 duration-200">
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-sm border shadow-sm"
        style={{
          backgroundColor: 'var(--color-paper-2)',
          borderColor: 'var(--color-rule-2)',
        }}
      >
        <div className="flex items-center gap-1.5 py-0.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-accent)',
              animation: 'propella-thinking-bounce 1.4s infinite ease-in-out both',
              animationDelay: '0s',
            }}
          />
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-accent)',
              animation: 'propella-thinking-bounce 1.4s infinite ease-in-out both',
              animationDelay: '0.2s',
            }}
          />
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{
              backgroundColor: 'var(--color-accent)',
              animation: 'propella-thinking-bounce 1.4s infinite ease-in-out both',
              animationDelay: '0.4s',
            }}
          />
        </div>
        <span
          className="text-[12.5px] font-medium tracking-wide"
          style={{
            fontFamily: 'var(--font-sans)',
            color: 'var(--color-ink-3)',
          }}
        >
          {label}
        </span>
      </div>
      <style jsx global>{`
        @keyframes propella-thinking-bounce {
          0%, 80%, 100% {
            transform: scale(0.65) translateY(0);
            opacity: 0.35;
          }
          40% {
            transform: scale(1.15) translateY(-5px);
            opacity: 1;
          }
        }
        @keyframes propella-typing-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

/**
 * Live typing stream bubble with typewriter cursor and dynamic typing indicator.
 */
export function AiStreamingBubble({ text }: { text: string }) {
  return (
    <div className="flex flex-col justify-start mb-4 animate-in fade-in-50 duration-200">
      <div
        className="max-w-[85%] sm:max-w-[75%] px-4 py-3 rounded-2xl rounded-tl-sm border text-[14px] leading-[1.65]"
        style={{
          backgroundColor: 'var(--color-paper-2)',
          borderColor: 'var(--color-rule-2)',
          color: 'var(--color-ink)',
          fontFamily: 'var(--font-sans)',
        }}
      >
        <div className="prose-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
        <span
          aria-hidden
          className="inline-block w-1.5 h-3.5 ml-1 rounded-sm align-middle"
          style={{
            backgroundColor: 'var(--color-accent)',
            animation: 'propella-typing-blink 0.8s step-end infinite',
          }}
        />
      </div>
      <div className="mt-1 flex items-center gap-1.5 pl-1">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: 'var(--color-accent)',
            animation: 'propella-thinking-bounce 1.2s infinite ease-in-out both',
          }}
        />
        <span
          className="text-[11.5px] text-[var(--color-ink-3)] font-medium"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          typing...
        </span>
      </div>
    </div>
  )
}
