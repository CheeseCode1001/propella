'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Clock, MessageSquare, CheckCircle2, Send } from 'lucide-react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState('general')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="flex flex-col py-12">
      {/* Header */}
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 text-center mb-16">
        <Badge variant="accent" className="mb-4 px-3 py-1 text-xs">
          We&apos;re Here to Help
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-ink)] leading-[1.12] max-w-2xl mx-auto">
          Get in Touch with Our Team.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[var(--color-ink-2)] max-w-xl mx-auto">
          Have questions about subscription activation, syllabus roadmaps, school partnerships, or your referral withdrawal? Reach out anytime.
        </p>
      </div>

      <div className="max-w-[1240px] mx-auto px-6 lg:px-8 w-full mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Details & Office */}
          <div className="space-y-8">
            <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-8 shadow-sm">
              <h2 className="text-xl font-bold text-[var(--color-ink)] mb-6">
                Support Channels
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-tint)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-ink)]">Email Support</h4>
                    <p className="text-xs text-[var(--color-ink-2)] mt-0.5">Average response under 2 hours</p>
                    <a
                      href="mailto:support@propella.ng"
                      className="text-xs font-mono font-medium text-[var(--color-accent)] hover:underline mt-1 block"
                    >
                      support@propella.ng
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-ink)]">WhatsApp Student Helpdesk</h4>
                    <p className="text-xs text-[var(--color-ink-2)] mt-0.5">Direct chat for quick issue resolution & payment help</p>
                    <span className="text-xs font-mono font-medium text-emerald-600 block mt-1">
                      +234 (0) 812 345 6789
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-ink)]">Operating Hours</h4>
                    <p className="text-xs text-[var(--color-ink-2)] mt-0.5">Monday – Friday: 8:00 AM – 7:00 PM WAT</p>
                    <p className="text-xs text-[var(--color-ink-3)]">Saturday: 9:00 AM – 4:00 PM WAT</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--color-ink)]">Headquarters</h4>
                    <p className="text-xs text-[var(--color-ink-2)] mt-0.5">
                      Yaba Innovation District, Herbert Macaulay Way, Yaba, Lagos, Nigeria
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-[var(--color-rule)] shadow-sm aspect-[16/9] bg-[var(--color-paper-2)]">
              <Image
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80"
                alt="Propella student counseling and technical support team in Lagos"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white text-xs font-medium">
                Serving over 14,000 students nationwide
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-2xl border border-[var(--color-rule)] bg-[var(--color-paper)] p-8 shadow-sm">
            <h2 className="text-xl font-bold text-[var(--color-ink)] mb-2">Send Us a Message</h2>
            <p className="text-xs text-[var(--color-ink-2)] mb-6">
              Fill out the form below and an academic advisor will get back to you promptly.
            </p>

            {submitted ? (
              <div className="py-12 text-center">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-ink)] mb-1">Message Sent Successfully!</h3>
                <p className="text-xs text-[var(--color-ink-2)] max-w-sm mx-auto mb-6">
                  Thank you, <strong>{name}</strong>. We have received your inquiry and sent a receipt confirmation to <strong>{email}</strong>.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSubmitted(false)
                    setName('')
                    setEmail('')
                    setMessage('')
                  }}
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="contactName" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Your Full Name
                  </Label>
                  <Input
                    id="contactName"
                    placeholder="e.g. Damilola Adeleke"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Email Address
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="e.g. damilola@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="contactCategory" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Topic of Inquiry
                  </Label>
                  <select
                    id="contactCategory"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] outline-none"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="highschool">JAMB / WAEC / NECO Highschool Prep</option>
                    <option value="undergraduate">Undergraduate Course Files & AI</option>
                    <option value="payment">Payment, Billing or Gifting Issue</option>
                    <option value="referral">Referral Program & Withdrawal Request</option>
                    <option value="school">School / Tutorial Center Institutional License</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="contactMessage" className="text-xs font-semibold text-[var(--color-ink-2)] mb-1 block">
                    Message
                  </Label>
                  <textarea
                    id="contactMessage"
                    rows={5}
                    placeholder="Describe how we can help you in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full text-xs p-3 rounded-lg border border-[var(--color-rule)] bg-[var(--color-paper)] text-[var(--color-ink)] outline-none"
                  />
                </div>

                <Button type="submit" variant="accent" className="w-full font-semibold">
                  <Send size={15} className="mr-2" />
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
