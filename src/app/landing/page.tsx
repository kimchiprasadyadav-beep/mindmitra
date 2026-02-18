'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('landing-visible')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

function FadeIn({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useFadeIn()
  return (
    <div ref={ref} className={`landing-fade ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-dark">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cream via-cream to-sage/30" />
        <div className="absolute top-20 right-10 text-8xl opacity-10 animate-float select-none">☕</div>
        <div className="absolute bottom-32 left-8 text-6xl opacity-[0.07] animate-float-slow select-none">☕</div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl font-bold text-warm-brown-dark leading-tight mb-6">
            The friend who&apos;s always there at 2am
          </h1>
          <p className="text-lg sm:text-xl text-warm-brown-light mb-10 max-w-lg mx-auto leading-relaxed">
            AI-powered therapy companion. Free. Private. In your language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              onClick={() => {
                document.cookie = 'lorelai-anonymous=true;path=/;max-age=86400'
              }}
              className="px-8 py-4 bg-warm-brown text-white rounded-2xl text-lg font-medium hover:bg-warm-brown-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start talking — no sign up needed
            </Link>
            <Link
              href="/auth"
              className="px-8 py-4 border-2 border-warm-brown text-warm-brown rounded-2xl text-lg font-medium hover:bg-warm-brown hover:text-white transition-all duration-300"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-8 bg-warm-brown/5 border-y border-warm-brown/10">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap justify-center gap-6 sm:gap-10 text-warm-brown font-medium text-sm sm:text-base">
          <span>10,000+ conversations held</span>
          <span className="hidden sm:inline text-warm-brown/30">·</span>
          <span>15 Indian languages</span>
          <span className="hidden sm:inline text-warm-brown/30">·</span>
          <span>100% free</span>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-center text-warm-brown-dark mb-16">
              Why people love Lorelai
            </h2>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { emoji: '🎙️', title: 'Voice-first', desc: 'Talk, don\'t type. Lorelai listens and speaks back.' },
              { emoji: '🔒', title: 'Truly private', desc: 'Anonymous mode. Auto-delete. We can\'t read your chats.' },
              { emoji: '🌏', title: 'Your language', desc: 'Hindi, Tamil, Telugu, Bengali, Kannada + 10 more.' },
            ].map((f, i) => (
              <FadeIn key={f.title} delay={i * 150}>
                <div className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 text-center">
                  <div className="text-5xl mb-5">{f.emoji}</div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-brown-dark mb-3">{f.title}</h3>
                  <p className="text-warm-brown-light leading-relaxed">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-28 px-6 bg-sage/40">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-center text-warm-brown-dark mb-16">
              How it works
            </h2>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-10">
            {[
              { step: '1', title: 'Open Lorelai', desc: 'No download needed. Works in your browser.' },
              { step: '2', title: 'Talk about what\'s on your mind', desc: 'Voice or text. Whatever feels right.' },
              { step: '3', title: 'Feel heard', desc: 'Come back whenever you need.' },
            ].map((s, i) => (
              <FadeIn key={s.step} delay={i * 150}>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-warm-brown text-white flex items-center justify-center text-xl font-bold mx-auto mb-5">
                    {s.step}
                  </div>
                  <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-brown-dark mb-2">{s.title}</h3>
                  <p className="text-warm-brown-light">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Couples Mode */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="text-5xl mb-6">💑</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-warm-brown-dark mb-4">
              Struggling together? Try Couples Mode
            </h2>
            <p className="text-warm-brown-light text-lg mb-8 max-w-lg mx-auto">
              Share a code, both join, Lorelai mediates. Real-time.
            </p>
            <Link
              href="/couples"
              className="inline-block px-8 py-4 bg-warm-brown text-white rounded-2xl text-lg font-medium hover:bg-warm-brown-dark transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Try Couples Mode
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 px-6 bg-warm-brown/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-center text-warm-brown-dark mb-16">
              What people say
            </h2>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              'I couldn\'t afford therapy. Lorelai helped me through my worst week.',
              'Finally an app that speaks Hindi and actually understands.',
              'The couples mode saved a fight that was about to ruin our weekend.',
            ].map((q, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="bg-white rounded-3xl p-8 shadow-sm">
                  <p className="text-warm-brown-light leading-relaxed italic text-lg">&ldquo;{q}&rdquo;</p>
                  <p className="mt-4 text-warm-brown/50 text-sm">— Anonymous</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <div className="text-5xl mb-6">🛡️</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-warm-brown-dark mb-6">
              Your safe space. For real.
            </h2>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {['No sign-up required', 'Auto-delete', 'Anonymous mode', 'Privacy policy'].map((item) => (
                <span key={item} className="px-4 py-2 bg-sage rounded-full text-sage-dark text-sm font-medium">
                  {item}
                </span>
              ))}
            </div>
            <Link href="/privacy" className="text-warm-brown underline underline-offset-4 hover:text-warm-brown-dark transition-colors">
              Read our privacy policy →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 sm:py-32 px-6 bg-gradient-to-b from-cream to-sage/30">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-bold text-warm-brown-dark mb-8">
              Ready to feel heard?
            </h2>
            <Link
              href="/"
              onClick={() => {
                document.cookie = 'lorelai-anonymous=true;path=/;max-age=86400'
              }}
              className="inline-block px-10 py-5 bg-warm-brown text-white rounded-2xl text-xl font-medium hover:bg-warm-brown-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start now — it&apos;s free
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 border-t border-warm-brown/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-warm-brown/60 mb-4">Made with ☕ in India</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-warm-brown/50">
            <Link href="/privacy" className="hover:text-warm-brown transition-colors">Privacy</Link>
            <span>·</span>
            <a href="https://icallhelpline.org" target="_blank" rel="noopener noreferrer" className="hover:text-warm-brown transition-colors">iCall</a>
            <span>·</span>
            <a href="https://vandrevalafoundation.com" target="_blank" rel="noopener noreferrer" className="hover:text-warm-brown transition-colors">Vandrevala Foundation</a>
            <span>·</span>
            <a href="http://www.aasra.info" target="_blank" rel="noopener noreferrer" className="hover:text-warm-brown transition-colors">AASRA</a>
          </div>
          <p className="mt-4 text-xs text-warm-brown/30">If you&apos;re in crisis, please reach out to a helpline above. Lorelai is not a replacement for professional help.</p>
        </div>
      </footer>
    </div>
  )
}
