import { Mail, Clock, ArrowUpRight } from 'lucide-react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? '1.0.0'

const faqs = [
  {
    q: 'How is the roadmap generated?',
    a: 'Propella reads the official JAMB, WAEC, or NECO syllabus for your selected subjects and lays out every topic between today and your exam date. Subjects you marked as weak get more time. Topics with higher historical exam weight are prioritized. The plan adapts after every quiz and study session — you\'ll never finish on the exact path you started on.',
  },
  {
    q: 'Can I change my exam date or subjects later?',
    a: 'Yes. Go to Settings → Exam profile. Changing your exam date triggers a roadmap regeneration. Changing your subjects regenerates the affected portion. Your XP, streaks, and quiz history are preserved.',
  },
  {
    q: 'What happens if I miss a day?',
    a: 'On the Free plan, you have one streak freeze per month — it applies automatically if you miss a day, so your streak stays intact. On Scholar, you get four freezes per month. If you\'re out of freezes, your streak resets to zero. Your roadmap and progress are not affected by missed days — only the streak counter.',
  },
  {
    q: 'How does Propella generate quiz questions?',
    a: 'We generate questions using Claude (the AI model) constrained strictly to your syllabus topic and the difficulty you select. Questions are not pulled from past papers — they\'re original, written in the style of the exam. We deduplicate against questions you\'ve recently seen so you don\'t get the same one twice.',
  },
  {
    q: 'Are the AI assistant\'s answers always correct?',
    a: 'Mostly, but not always. The AI assistant is built on a model trained on a broad knowledge base and tuned for the Nigerian secondary school curriculum. If you spot an answer that conflicts with your textbook or class teacher, trust the textbook. Report the mistake using the feedback button below any assistant message.',
  },
  {
    q: 'Can I use Propella offline?',
    a: 'Partially. Once a topic\'s content loads, you can read it offline. Study sessions work offline and sync when you reconnect. AI assistant, quiz generation, and mocks require an internet connection.',
  },
  {
    q: 'How do I cancel my Scholar subscription?',
    a: 'Settings → Plan & billing → Cancel subscription. You keep Scholar features until the end of your current billing period, then your account moves back to Free. Your data is not deleted.',
  },
  {
    q: 'I found a bug or have a feature request.',
    a: 'Email us at support@propella.app with as much detail as you can — what you were doing, what happened, and a screenshot if relevant. We read every message.',
  },
]

export default function HelpPage() {
  return (
    <div className="max-w-[680px] mx-auto px-6 py-12 md:py-16">
      {/* Top section */}
      <div className="mb-8">
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 500,
            color: 'var(--color-ink)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 16,
          }}
        >
          Help &amp; support
        </h1>
        <p
          style={{
            fontSize: 17,
            color: 'var(--color-ink-2)',
            lineHeight: 1.6,
            maxWidth: 520,
          }}
        >
          Most things in Propella are designed to explain themselves. If something
          doesn&apos;t, we want to hear about it.
        </p>
      </div>

      {/* Contact card */}
      <div
        style={{
          border: '1px solid var(--color-rule)',
          borderRadius: 'var(--radius-md)',
          padding: 24,
          backgroundColor: 'var(--color-card)',
        }}
      >
        {/* Row 1 — Email */}
        <a
          href="mailto:support@propella.app"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            textDecoration: 'none',
            color: 'inherit',
            paddingBottom: 20,
            marginBottom: 20,
            borderBottom: '1px solid var(--color-rule)',
          }}
          className="group"
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-paper-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Mail size={20} strokeWidth={1.5} style={{ color: 'var(--color-ink-2)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-ink)', marginBottom: 2 }}>
              Email us
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-ink-2)' }}>support@propella.app</p>
          </div>
          <ArrowUpRight
            size={16}
            strokeWidth={1.5}
            style={{ color: 'var(--color-ink-3)', flexShrink: 0 }}
          />
        </a>

        {/* Row 2 — Response time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-paper-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={20} strokeWidth={1.5} style={{ color: 'var(--color-ink-2)' }} />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-ink)', marginBottom: 2 }}>
              Response time
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-ink-2)' }}>Within 24 hours, Mon–Sat</p>
          </div>
        </div>
      </div>

      {/* FAQ section */}
      <div style={{ marginTop: 48 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 500,
            color: 'var(--color-ink)',
            lineHeight: 1.3,
            letterSpacing: '-0.01em',
            marginBottom: 24,
          }}
        >
          Frequently asked
        </h2>

        <Accordion type="single" collapsible defaultValue="item-0">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{faq.q}</AccordionTrigger>
              <AccordionContent>{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Footer line */}
      <p
        style={{
          marginTop: 48,
          textAlign: 'center',
          fontSize: 14,
          color: 'var(--color-ink-3)',
        }}
      >
        Propella v{APP_VERSION} &middot; Built in Nigeria
      </p>
    </div>
  )
}
