import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react'
import { Folder2, DocumentText1, Magicpen, BookSaved, Cpu } from 'iconsax-reactjs'

export const metadata = {
  title: 'Undergraduate Track — Course Files & AI Study Assistant | Propella',
  description: 'Organize your university courses from 100L to 500L, upload lecture slides and past questions, and query your notes directly with AI.',
}

export default function UndergraduatePage() {
  const levels = [
    { level: '100 Level (Freshman)', desc: 'General studies (GST), introductory calculus, basic science & departmental pre-requisites.' },
    { level: '200 Level (Sophomore)', desc: 'Core faculty foundations, laboratory manuals, intermediate theory & past semester tests.' },
    { level: '300 Level (Junior)', desc: 'Advanced coursework, departmental electives, technical seminars & semester project files.' },
    { level: '400 Level (Senior / SIWES)', desc: 'Industrial training reports, specialized modules, research methodologies & mock exams.' },
    { level: '500 Level (Final Year)', desc: 'Thesis dissertation research, capstone project documents & degree qualification archives.' },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="accent" className="mb-4 px-3 py-1 text-xs">
                University Academic Track
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-ink)] leading-[1.12]">
                Your Academic Second Brain for University.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-[var(--color-ink-2)] leading-relaxed max-w-xl">
                Tired of scattered WhatsApp PDF handouts and lost Telegram slide decks? Propella gives Nigerian university undergraduates a structured Course Files vault with direct AI document synthesis.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Button size="lg" variant="accent" asChild>
                  <Link href="/signup">
                    Get Started as Undergraduate
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/pricing">View Plans</Link>
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-xs text-[var(--color-ink-3)] font-mono">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" /> 100L – 500L Organization
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" /> Direct AI Document Query
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" /> All Data in One Profile
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden border border-[var(--color-rule)] shadow-2xl aspect-[4/3] bg-[var(--color-paper-2)]">
                <Image
                  src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1000&q=80"
                  alt="African university students collaborating on laptops in a campus study area"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-black/85 backdrop-blur-md p-4 rounded-xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--color-accent-tint)] text-[var(--color-accent)]">
                      <Folder2 size={20} variant="Bold" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[var(--color-ink)]">Course Files Vault</h4>
                      <p className="text-[11px] text-[var(--color-ink-3)]">Organized by Year 1 to Year 5 · Instant AI Query</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-20 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)]">
              Built Specifically for the Nigerian Tertiary Experience
            </h2>
            <p className="mt-3 text-sm text-[var(--color-ink-2)]">
              From federal and state universities to private colleges and polytechnics, keep your entire academic library in sync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mb-5">
                <Folder2 size={24} variant="Bold" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">Year-by-Year File Classification</h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                Create specific course codes (e.g., MTH101, GST111, CHM201, EEE311) under Year 1 through Year 5 tabs. Group lecture PDFs, slides, and syllabus documents cleanly.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-5">
                <Magicpen size={24} variant="Bold" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">AI Assistant Document Reference</h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                Attach any course file directly into the AI Assistant. Ask questions like: &ldquo;Explain page 12 of this PDF with an example&rdquo; or &ldquo;Generate 10 exam questions from these slides.&rdquo;
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-5">
                <Cpu size={24} variant="Bold" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-ink)] mb-2">One Unified Profile</h3>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                Registered for JAMB or WAEC earlier? Simply flip the Undergraduate Mode switch under Settings. All your past mock scores, quizzes, and notes remain preserved forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 100L to 500L Breakdown */}
      <section className="py-20 bg-[var(--color-paper)] border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="accent" className="mb-3 px-3 py-1 text-xs">
                Academic Journey
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] leading-snug">
                Organized from Matriculation to Convocation.
              </h2>
              <p className="mt-4 text-sm text-[var(--color-ink-2)] leading-relaxed">
                Propella scales with you throughout your degree. Never lose past semester materials when revising for comprehensive examinations or preparing for your final year project defense.
              </p>

              <div className="mt-8 space-y-4">
                {levels.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[var(--color-rule)] bg-[var(--color-paper-2)]">
                    <h4 className="font-bold text-sm text-[var(--color-ink)]">{item.level}</h4>
                    <p className="text-xs text-[var(--color-ink-3)] mt-1">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[var(--color-rule)] shadow-xl aspect-[4/3]">
              <Image
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80"
                alt="University students studying in a library with digital devices"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[var(--color-paper-2)] text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] mb-4">
            Graduate with Top Honors
          </h2>
          <p className="text-sm text-[var(--color-ink-2)] mb-8">
            Join thousands of undergraduates across Unilag, UNN, UI, OAU, ABU, Covenant, and more who use Propella to ace their semester GPAs.
          </p>
          <Button size="lg" variant="accent" asChild>
            <Link href="/signup">Create Your Undergraduate Account</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
