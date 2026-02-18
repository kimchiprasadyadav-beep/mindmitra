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

      {/* ─── 1. HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 text-center overflow-hidden">
        {/* Decorative warm glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-radial from-warm-brown/[0.06] via-warm-brown/[0.02] to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-gradient-radial from-sage/40 to-transparent blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-warm-brown-dark leading-[1.1] mb-6">
            The friend who&apos;s always there at 2am
          </h1>
          <p className="text-lg sm:text-xl text-warm-brown-light mb-10 max-w-md mx-auto leading-relaxed">
            Free AI therapy companion. Private. In your language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/"
              onClick={() => {
                document.cookie = 'lorelai-anonymous=true;path=/;max-age=86400'
              }}
              className="px-8 py-4 bg-warm-brown text-white rounded-full text-lg font-medium hover:bg-warm-brown-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start talking — free
            </Link>
            <Link
              href="/auth"
              className="px-8 py-4 border border-warm-brown/20 text-warm-brown rounded-full text-lg font-medium hover:bg-warm-brown/5 transition-all duration-300"
            >
              Sign in
            </Link>
          </div>
          <p className="text-warm-brown/40 text-sm">No download. No sign-up. Just start.</p>
        </div>
      </section>

      {/* ─── 2. SOCIAL PROOF ─── */}
      <section className="border-y border-warm-brown/10 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 sm:gap-8 text-warm-brown/40 text-sm">
          <span>💬 10,000+ conversations</span>
          <span>🌐 15 languages</span>
          <span>🆓 100% free</span>
          <span>👻 Anonymous mode</span>
        </div>
      </section>

      {/* ─── 3. FEATURES ─── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-center text-warm-brown-dark mb-16">
              Why people love Lorelai
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeIn delay={0}>
              <div className="bg-white rounded-3xl p-8 border border-warm-brown/[0.06]">
                <div className="text-4xl mb-4">🎙️</div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-brown-dark mb-3">Voice-first</h3>
                <p className="text-warm-brown-light leading-relaxed">Talk, don&apos;t type. Lorelai listens and speaks back in a warm voice.</p>
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <div className="bg-white rounded-3xl p-8 border border-warm-brown/[0.06]">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-brown-dark mb-3">Truly private</h3>
                <p className="text-warm-brown-light leading-relaxed">Anonymous mode. Auto-delete. We literally can&apos;t read your chats.</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="bg-white rounded-3xl p-8 border border-warm-brown/[0.06]">
                <div className="text-4xl mb-4">🌏</div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-brown-dark mb-3">Your language</h3>
                <p className="text-warm-brown-light leading-relaxed">Hindi, Tamil, Telugu, Bengali, Kannada, Malayalam + 9 more Indian languages.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── 4. CONVERSATION PREVIEW ─── */}
      <section className="py-20 sm:py-28 px-6">
        <FadeIn>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-center text-warm-brown-dark mb-12">
            A conversation with Lorelai
          </h2>
        </FadeIn>
        <FadeIn delay={200}>
          <div className="max-w-sm mx-auto space-y-4">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-sage rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                <p className="text-sage-dark text-sm leading-relaxed">I&apos;ve been feeling really anxious about work lately</p>
              </div>
            </div>
            {/* Lorelai message */}
            <div className="flex justify-start gap-2">
              <div className="w-8 h-8 rounded-full bg-warm-brown/10 flex items-center justify-center text-sm shrink-0 mt-1">☕</div>
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] border border-warm-brown/[0.06]">
                <p className="text-warm-brown-dark text-sm leading-relaxed">That sounds heavy. What specifically about work is weighing on you right now?</p>
              </div>
            </div>
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-sage rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                <p className="text-sage-dark text-sm leading-relaxed">I guess I&apos;m scared of failing and everyone finding out</p>
              </div>
            </div>
            {/* Lorelai message */}
            <div className="flex justify-start gap-2">
              <div className="w-8 h-8 rounded-full bg-warm-brown/10 flex items-center justify-center text-sm shrink-0 mt-1">☕</div>
              <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%] border border-warm-brown/[0.06]">
                <p className="text-warm-brown-dark text-sm leading-relaxed">That fear of being &lsquo;found out&rsquo; — so many people carry that. It&apos;s called imposter syndrome, and it says nothing about your actual abilities. What would it feel like to let that fear be there without believing it?</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ─── 5. HOW IT WORKS ─── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-center text-warm-brown-dark mb-16">
              How it works
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <FadeIn delay={0}>
              <div className="text-center">
                <div className="text-6xl font-bold text-warm-brown/10 mb-3 font-[family-name:var(--font-playfair)]">1</div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-brown-dark mb-2">Open Lorelai</h3>
                <p className="text-warm-brown-light leading-relaxed">No download needed. Works on any phone or laptop.</p>
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <div className="text-center">
                <div className="text-6xl font-bold text-warm-brown/10 mb-3 font-[family-name:var(--font-playfair)]">2</div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-brown-dark mb-2">Talk about what&apos;s on your mind</h3>
                <p className="text-warm-brown-light leading-relaxed">Text or voice, in any language.</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="text-center">
                <div className="text-6xl font-bold text-warm-brown/10 mb-3 font-[family-name:var(--font-playfair)]">3</div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-warm-brown-dark mb-2">Feel heard</h3>
                <p className="text-warm-brown-light leading-relaxed">Come back whenever. Lorelai remembers.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── 6. COUPLES MODE ─── */}
      <section className="bg-sage py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-warm-brown-dark mb-4">
              Struggling together?
            </h2>
            <p className="text-warm-brown-light text-lg mb-8 max-w-xl mx-auto leading-relaxed">
              Try Couples Mode — share a code, both join the same session. Lorelai mediates in real-time. Validates both sides. Never takes one.
            </p>
            <Link
              href="/couples"
              className="inline-block px-8 py-4 bg-warm-brown text-white rounded-full text-lg font-medium hover:bg-warm-brown-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Try couples mode →
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ─── 7. TESTIMONIALS ─── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-center text-warm-brown-dark mb-16">
              What people say
            </h2>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FadeIn delay={0}>
              <div className="bg-white rounded-2xl p-6 border border-warm-brown/[0.06]">
                <p className="text-warm-brown-light leading-relaxed italic mb-4">&ldquo;I couldn&apos;t afford ₹2,700/session therapy. Lorelai helped me through my worst week.&rdquo;</p>
                <p className="text-warm-brown/50 text-sm">— A., 24, Mumbai</p>
              </div>
            </FadeIn>
            <FadeIn delay={150}>
              <div className="bg-white rounded-2xl p-6 border border-warm-brown/[0.06]">
                <p className="text-warm-brown-light leading-relaxed italic mb-4">&ldquo;Finally an app that speaks Hindi and actually understands how I feel.&rdquo;</p>
                <p className="text-warm-brown/50 text-sm">— S., 19, Delhi</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="bg-white rounded-2xl p-6 border border-warm-brown/[0.06]">
                <p className="text-warm-brown-light leading-relaxed italic mb-4">&ldquo;The couples mode saved a fight that was about to ruin our weekend.&rdquo;</p>
                <p className="text-warm-brown/50 text-sm">— R. &amp; M., Bangalore</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── 8. PRIVACY ─── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-lg mx-auto text-center">
          <FadeIn>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl font-bold text-warm-brown-dark mb-8">
              Your safe space. For real.
            </h2>
            <div className="space-y-3 text-warm-brown-light text-lg mb-8">
              <p>✓ No sign-up required</p>
              <p>✓ Conversations auto-delete</p>
              <p>✓ Full anonymous mode</p>
              <p>
                ✓{' '}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-warm-brown-dark transition-colors">
                  Read our privacy policy
                </Link>
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── 9. FINAL CTA ─── */}
      <section className="py-24 px-6 text-center">
        <FadeIn>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-5xl font-bold text-warm-brown-dark mb-8">
            Ready to feel heard?
          </h2>
          <Link
            href="/"
            onClick={() => {
              document.cookie = 'lorelai-anonymous=true;path=/;max-age=86400'
            }}
            className="inline-block px-10 py-5 bg-warm-brown text-white rounded-full text-xl font-medium hover:bg-warm-brown-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 mb-4"
          >
            Start now — it&apos;s free ☕
          </Link>
          <p className="text-warm-brown/40 text-sm">No credit card. No judgment. Just you.</p>
        </FadeIn>
      </section>

      {/* ─── 10. FOOTER ─── */}
      <footer className="border-t border-warm-brown/10 py-8 px-6 text-center">
        <p className="text-warm-brown/30 mb-3">Made with ☕ in India</p>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-warm-brown/30 mb-3">
          <Link href="/privacy" className="hover:text-warm-brown/60 transition-colors">Privacy</Link>
          <span>·</span>
          <a href="tel:9152987821" className="hover:text-warm-brown/60 transition-colors">iCall: 9152987821</a>
          <span>·</span>
          <a href="tel:18602662345" className="hover:text-warm-brown/60 transition-colors">Vandrevala: 1860-2662-345</a>
          <span>·</span>
          <a href="tel:9820466726" className="hover:text-warm-brown/60 transition-colors">AASRA: 9820466726</a>
        </div>
        <p className="text-warm-brown/20 text-xs">Lorelai is not a replacement for professional therapy.</p>
      </footer>
    </div>
  )
}
