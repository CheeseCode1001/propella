import Image from 'next/image'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Quote, CheckCircle2, TrendingUp, Award, Users } from 'lucide-react'

export const metadata = {
  title: 'Student Testimonials & Success Stories | Propella',
  description: 'See how Nigerian students cracked JAMB with 300+ scores, aced WAEC with straight A1s, and earned first-class GPAs in university with Propella.',
}

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: 'Chidubem Okafor',
      role: 'JAMB Candidate → UNN Medicine',
      score: 'Score: 318 / 400',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      quote:
        'My first JAMB in 2024 was 214 and I missed medicine. I used Propella for 4 months, took 18 CBT mock simulations, and drilled past questions by topic. In 2025 I scored 318 (Maths 82, English 78, Physics 80, Chemistry 78). Today I am a 100L Medical student at UNN!',
    },
    {
      name: 'Amina Bello',
      role: 'WAEC Science Candidate, Abuja',
      score: 'Result: 7 A1s, 2 B2s',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
      quote:
        'The step-by-step marking rubrics on Propella are what set it apart. Most textbooks give only letters (A, B, C) without explaining why. Propella gave me complete working for physics and chemistry calculations. I breezed through my WAEC exams with straight distinctions.',
    },
    {
      name: 'Femi Adeyemi',
      role: 'Undergraduate, Electrical Eng, Unilag',
      score: 'CGPA: 4.88 / 5.00',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      quote:
        'I switched to Undergraduate Mode as soon as I entered Unilag. Having all my 100L and 200L course slides organized in Course Files and being able to ask the AI tutor to summarize long 80-page handouts before semester tests has been an absolute game changer.',
    },
    {
      name: 'Blessing Udoh',
      role: 'NECO Candidate & Top Referrer, Port Harcourt',
      score: 'Earned ₦24,000 + 9 NECO Credits',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
      quote:
        'Not only did Propella help me clear NECO in one sitting, but the referral program actually works! I invited classmates in my tutorial center, reached my 5 referrals, and withdrew ₦24,000 to my GTBank account within 18 hours of approval. Best learning investment ever.',
    },
    {
      name: 'Tunde Bakare',
      role: 'Commercial Candidate → OAU Accounting',
      score: 'Score: 294 / 400',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      quote:
        'The Commerce and Accounts past question explanations were gold. The mock timer trained me not to panic during the 2-hour UTME exam. If you are serious about university admission, stop buying paper booklets and use Propella.',
    },
    {
      name: 'Zainab Ibrahim',
      role: 'Arts & Law Aspirant, Kaduna',
      score: 'Literature in English: 84%',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      quote:
        'The literary devices breakdowns and Government constitution past questions made revision so straightforward. The AI explained complex jurisprudence terms like rule of law and separation of powers using simple Nigerian everyday examples.',
    },
  ]

  const stats = [
    { label: 'Verified Pass Rate', value: '94.6%', icon: Award },
    { label: 'Active Nigerian Students', value: '14,000+', icon: Users },
    { label: 'Mock Questions Answered', value: '2.4M+', icon: TrendingUp },
    { label: 'Average Score Increase', value: '+68 Pts', icon: CheckCircle2 },
  ]

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden pt-12 pb-20 border-b border-[var(--color-rule)] bg-[var(--color-paper)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center">
          <Badge variant="accent" className="mb-4 px-3 py-1 text-xs">
            Real Candidates · Verified Results
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-ink)] leading-[1.12] max-w-3xl mx-auto">
            Real Stories of Academic Transformation.
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[var(--color-ink-2)] max-w-2xl mx-auto leading-relaxed">
            Discover how students across all 36 Nigerian states and the FCT use Propella to conquer exams, gain university admission, and excel in tertiary education.
          </p>

          {/* Stats Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className="p-5 rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper-2)] text-center">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center mx-auto mb-2">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-ink)]">{s.value}</h3>
                  <p className="text-xs text-[var(--color-ink-3)] mt-1 font-medium">{s.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20 bg-[var(--color-paper-2)] border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-7 shadow-sm hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={15} fill="currentColor" />
                    ))}
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--color-ink-2)] leading-relaxed italic mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--color-rule)] flex items-center gap-3">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[var(--color-rule)] bg-[var(--color-paper-3)]">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-[var(--color-ink)] truncate">{t.name}</h4>
                    <p className="text-[11px] text-[var(--color-ink-3)] truncate">{t.role}</p>
                    <span className="text-[11px] font-semibold text-emerald-600 block mt-0.5">
                      {t.score}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Visual Section: African Students Celebrating */}
      <section className="py-20 bg-[var(--color-paper)] border-b border-[var(--color-rule)]">
        <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative rounded-2xl overflow-hidden border border-[var(--color-rule)] shadow-xl aspect-[4/3]">
              <Image
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80"
                alt="Happy African university students celebrating academic success"
                fill
                className="object-cover"
              />
            </div>

            <div>
              <Badge variant="accent" className="mb-3 px-3 py-1 text-xs">
                Guaranteed Improvement
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] leading-snug">
                Join the Top 5% of Candidates Admitted on Merit.
              </h2>
              <p className="mt-4 text-sm text-[var(--color-ink-2)] leading-relaxed">
                Nigerian university admissions are competitive, with over 1.8 million candidates fighting for under 500,000 slots. A score above 280+ gives you direct first-choice merit admission into competitive courses like Medicine, Law, Computer Science, and Engineering.
              </p>
              <div className="mt-6 flex flex-col gap-3 text-xs text-[var(--color-ink)] font-medium">
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Over 8,200 Propella alumni currently matriculated in federal & state universities
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Average 32-point increase on repeated CBT mock attempts
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  Undergraduate alumni maintaining first-class and second-class upper GPAs
                </span>
              </div>
              <div className="mt-8">
                <Button size="lg" variant="accent" asChild>
                  <Link href="/signup">Start Your Success Story Today</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-20 bg-[var(--color-paper-2)] text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--color-ink)] mb-3">
            Ready to Ace Your Next Exam?
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-ink-2)] mb-8">
            Create an account in 30 seconds and test your readiness with our diagnostic CBT mock.
          </p>
          <Button size="lg" variant="accent" asChild>
            <Link href="/signup">Get Started for Free</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
