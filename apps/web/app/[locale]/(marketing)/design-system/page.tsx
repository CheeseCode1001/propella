'use client'

import { useState } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Check, AlertTriangle, Info, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Logo } from '@/components/common/logo'
import { NumberCounter } from '@/components/common/number-counter'
import { EmptyState } from '@/components/common/empty-state'
import { LoadingState } from '@/components/common/loading-state'
import { useToast } from '@/components/ui/toast'
import {
  DoodleRays,
  DoodleSmile,
  DoodleSquiggle,
  DoodleStar,
  DoodleSun,
  DoodleSwirl,
  JOY,
  JoyEyebrow,
  JoyMaskedImage,
  PHOTOS,
  RatingStars,
  px,
} from '@/components/marketing/joy'

// ---- helpers ----

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2
        className="text-[11px] font-mono font-medium tracking-[0.12em] uppercase text-[var(--color-ink-3)] mb-6 pb-3 border-b border-[var(--color-rule)]"
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      {label && (
        <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-3 uppercase tracking-[0.06em]">{label}</p>
      )}
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

interface SwatchProps {
  variable: string
  label: string
  dark?: boolean
}

function Swatch({ variable, label, dark }: SwatchProps) {
  return (
    <div className="flex flex-col gap-1.5 w-[88px]">
      <div
        className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-rule)]"
        style={{ background: `var(${variable})` }}
      />
      <p className="text-[10px] font-mono text-[var(--color-ink-3)] leading-tight truncate">{label}</p>
      {dark && (
        <p className="text-[9px] font-mono text-[var(--color-ink-3)] leading-tight opacity-60 truncate">{variable}</p>
      )}
    </div>
  )
}

function SubjectMarker({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ background: `var(${color})` }}
      />
      <span className="text-[13px] text-[var(--color-ink-2)]">{label}</span>
    </div>
  )
}

// ---- Main page ----

export default function DesignSystemPage() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [counterValue, setCounterValue] = useState(1234)
  const [inputError, setInputError] = useState(false)

  const surfaceColors = [
    { variable: '--color-paper', label: 'paper (#F8F6F1)' },
    { variable: '--color-paper-2', label: 'paper-2' },
    { variable: '--color-paper-3', label: 'paper-3' },
    { variable: '--color-card', label: 'card' },
  ]

  const inkColors = [
    { variable: '--color-ink', label: 'ink (#1A1917)' },
    { variable: '--color-ink-2', label: 'ink-2' },
    { variable: '--color-ink-3', label: 'ink-3' },
  ]

  const joyColors = [
    { variable: '--color-joy-orange', label: 'orange (#FF8555)' },
    { variable: '--color-joy-green', label: 'green (#2EBB5E)' },
    { variable: '--color-joy-blue', label: 'blue (#58A5EF)' },
    { variable: '--color-joy-yellow', label: 'yellow (#FFE494)' },
    { variable: '--color-joy-amber', label: 'amber (#FFAD28)' },
    { variable: '--color-joy-brown', label: 'brown (#381D0F)' },
    { variable: '--color-joy-lime', label: 'lime (#D6F48F)' },
  ]

  const accentColors = [
    { variable: '--color-accent', label: 'accent (#F8642B)' },
    { variable: '--color-accent-2', label: 'accent-2' },
    { variable: '--color-accent-tint', label: 'accent-tint' },
  ]

  const functionalColors = [
    { variable: '--color-success', label: 'success' },
    { variable: '--color-warning', label: 'warning' },
    { variable: '--color-danger', label: 'danger' },
  ]

  const subjectColors = [
    { variable: '--color-subj-english', label: 'English' },
    { variable: '--color-subj-math', label: 'Math' },
    { variable: '--color-subj-physics', label: 'Physics' },
    { variable: '--color-subj-chemistry', label: 'Chemistry' },
    { variable: '--color-subj-biology', label: 'Biology' },
    { variable: '--color-subj-economics', label: 'Economics' },
    { variable: '--color-subj-government', label: 'Government' },
    { variable: '--color-subj-literature', label: 'Literature' },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Logo />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-[12px] font-mono text-[var(--color-ink-3)] uppercase tracking-[0.08em]">
              Joyloo Design System
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-full transition-colors ${
                theme === 'light'
                  ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
              }`}
              aria-label="Light theme"
            >
              <Sun size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`p-1.5 rounded-full transition-colors ${
                theme === 'system'
                  ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
              }`}
              aria-label="System theme"
            >
              <Monitor size={14} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-full transition-colors ${
                theme === 'dark'
                  ? 'bg-[var(--color-paper-3)] text-[var(--color-ink)]'
                  : 'text-[var(--color-ink-3)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-2)]'
              }`}
              aria-label="Dark theme"
            >
              <Moon size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Page title */}
        <div className="mb-12">
          <JoyEyebrow className="mb-4">Joyloo Visual Identity</JoyEyebrow>
          <h1
            className="text-[44px] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)] mb-3 font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Propella Design System
          </h1>
          <p className="text-[16px] text-[var(--color-ink-2)] max-w-xl leading-relaxed">
            Replicated from the Joyloo design system: warm cream paper, charcoal ink, coral-orange accent, playful color blocks, Parkinsans headings, Source Sans body, Caveat Brush handwriting, and organic student mask shapes.
          </p>
        </div>

        {/* ---- Joy Shape Masks ---- */}
        <Section title="Joyloo Organic Shape Masks (Pexels African Students)">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <JoyMaskedImage src={px(PHOTOS.campusLaughing, 300)} alt="Scallop" shape="scallop" glow={JOY.green} />
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mt-2">Scallop</p>
            </div>
            <div className="text-center">
              <JoyMaskedImage src={px(PHOTOS.girlBooks, 300)} alt="Starburst" shape="starburst" glow={JOY.amber} />
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mt-2">Starburst</p>
            </div>
            <div className="text-center">
              <JoyMaskedImage src={px(PHOTOS.kidsStudying, 300)} alt="Cog" shape="cog" glow={JOY.blue} />
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mt-2">Cog</p>
            </div>
            <div className="text-center">
              <JoyMaskedImage src={px(PHOTOS.campusGroup, 300)} alt="Hexagon" shape="hexagon" glow={JOY.orange} />
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mt-2">Hexagon</p>
            </div>
            <div className="text-center">
              <JoyMaskedImage src={px(PHOTOS.studentNotebooks, 300)} alt="Flower" shape="flower" glow={JOY.accent} />
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mt-2">Flower</p>
            </div>
            <div className="text-center">
              <JoyMaskedImage src={px(PHOTOS.studentWriting, 300)} alt="Circle" shape="circle" />
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mt-2">Circle</p>
            </div>
          </div>
        </Section>

        {/* ---- Joy Doodles & Badges ---- */}
        <Section title="Joyloo Doodles, Eyebrows & Badges">
          <div className="flex flex-wrap items-center gap-8 p-6 bg-white rounded-2xl border border-[var(--color-rule)]">
            <div className="flex flex-col items-center gap-2">
              <DoodleSmile className="w-14" />
              <span className="text-[10px] font-mono text-[var(--color-ink-3)]">Smile</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DoodleRays className="w-12" />
              <span className="text-[10px] font-mono text-[var(--color-ink-3)]">Rays</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DoodleStar className="w-14" />
              <span className="text-[10px] font-mono text-[var(--color-ink-3)]">3D Star</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DoodleSquiggle className="w-24" />
              <span className="text-[10px] font-mono text-[var(--color-ink-3)]">Squiggle</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <DoodleSun className="w-14" />
              <span className="text-[10px] font-mono text-[var(--color-ink-3)]">Sun</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <RatingStars />
              <span className="text-[10px] font-mono text-[var(--color-ink-3)]">5.0 Rating</span>
            </div>
            <div className="flex flex-col gap-2">
              <JoyEyebrow tone="light">Light Eyebrow</JoyEyebrow>
              <JoyEyebrow tone="accent">Accent Eyebrow</JoyEyebrow>
            </div>
          </div>
        </Section>

        {/* ---- Typography ---- */}
        <Section title="Typography Scale">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Display 2XL — Parkinsans 56px</p>
              <p
                className="text-[56px] leading-[1.05] tracking-[-0.03em] text-[var(--color-ink)] font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Propella
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Display XL — Parkinsans 40px</p>
              <p
                className="text-[40px] leading-[1.1] tracking-[-0.02em] text-[var(--color-ink)] font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Where little minds grow with confidence.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Display LG — Parkinsans 32px</p>
              <p
                className="text-[32px] leading-[1.15] tracking-[-0.02em] text-[var(--color-ink)] font-semibold"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Build your joyful study path
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Handwriting Accent — Caveat Brush</p>
              <p className="text-[32px] font-[family-name:var(--font-hand)] text-[var(--color-accent)] leading-none">
                Small daily habits build distinction scholars!
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Body — Source Sans 3 16px</p>
              <p className="text-[16px] leading-[1.6] text-[var(--color-ink-2)] max-w-lg">
                A personalized roadmap generated from your exam date, target subjects, and daily study time. Progress is tracked with spaced repetition so every revision hits at the right moment.
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-[10px] font-mono text-[var(--color-ink-3)] mb-1 uppercase tracking-[0.06em]">Mono / Code — JetBrains Mono 13px</p>
              <p className="text-[13px] font-mono text-[var(--color-ink-2)] bg-[var(--color-paper-2)] px-3 py-2 rounded-full inline-block">
                mastery: 0.84 | topic: Quadratic Equations | 3-day welcome: ₦999
              </p>
            </div>
          </div>
        </Section>

        {/* ---- Colors ---- */}
        <Section title="Color Tokens">
          <div className="space-y-8">
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Joyloo Surfaces</p>
              <div className="flex flex-wrap gap-4">
                {surfaceColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Joyloo Color Blocks</p>
              <div className="flex flex-wrap gap-4">
                {joyColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Primary Accent (Coral Orange)</p>
              <div className="flex flex-wrap gap-4">
                {accentColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Ink</p>
              <div className="flex flex-wrap gap-4">
                {inkColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-mono text-[var(--color-ink-3)] mb-4 uppercase tracking-[0.06em]">Subject Hues</p>
              <div className="flex flex-wrap gap-4">
                {subjectColors.map((c) => (
                  <Swatch key={c.variable} variable={c.variable} label={c.label} />
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ---- Pill Buttons ---- */}
        <Section title="Joyloo Pill Buttons (border-radius: 100px)">
          <Row label="All Variants">
            <Button variant="default">Default</Button>
            <Button variant="accent">Accent</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link variant</Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="With Icons">
            <Button variant="accent">
              <BookOpen size={14} strokeWidth={1.5} />
              Start practice
            </Button>
            <Button variant="secondary">
              <Check size={14} strokeWidth={1.5} />
              Mark complete
            </Button>
          </Row>
        </Section>

        {/* ---- Cards ---- */}
        <Section title="Cards">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] text-[var(--color-ink-2)] leading-relaxed">
                  Clean rounded card with subtle border stroke.
                </p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] text-[var(--color-ink-2)] leading-relaxed">
                  Border + soft shadow for interactive tiles.
                </p>
              </CardContent>
            </Card>
            <Card variant="flush">
              <CardHeader>
                <CardTitle>Flush card</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[14px] text-[var(--color-ink-2)] leading-relaxed">
                  Background only, nested inside colorful containers.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* ---- Badges ---- */}
        <Section title="Badges">
          <Row label="All variants">
            <Badge variant="default">Default</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
          </Row>
        </Section>

        {/* ---- Number Counter ---- */}
        <Section title="Number Counter">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-baseline gap-8">
              <div className="text-center">
                <NumberCounter
                  value={counterValue}
                  className="text-[48px] leading-none text-[var(--color-ink)]"
                />
                <p className="text-[12px] font-mono text-[var(--color-ink-3)] mt-1">Questions answered</p>
              </div>
              <div className="text-center">
                <NumberCounter
                  value={Math.round(counterValue * 0.74)}
                  className="text-[32px] leading-none text-[var(--color-success)]"
                  suffix="%"
                />
                <p className="text-[12px] font-mono text-[var(--color-ink-3)] mt-1">Accuracy rate</p>
              </div>
              <div className="text-center">
                <NumberCounter
                  value={Math.round(counterValue / 10)}
                  prefix="+"
                  className="text-[32px] leading-none text-[var(--color-accent)]"
                />
                <p className="text-[12px] font-mono text-[var(--color-ink-3)] mt-1">XP earned</p>
              </div>
            </div>
          </div>
        </Section>

        {/* ---- Subject Markers ---- */}
        <Section title="Subject Color Markers">
          <Card className="max-w-xs">
            <div className="space-y-3">
              {subjectColors.map((c) => (
                <SubjectMarker key={c.variable} color={c.variable} label={c.label} />
              ))}
              <SubjectMarker color="--color-subj-default" label="Other / Default" />
            </div>
          </Card>
        </Section>

        <footer className="border-t border-[var(--color-rule)] pt-8 mt-4 pb-12">
          <p className="text-[12px] font-mono text-[var(--color-ink-3)]">
            Propella Joyloo Design System — Internal Reference
          </p>
        </footer>
      </main>
    </div>
  )
}
