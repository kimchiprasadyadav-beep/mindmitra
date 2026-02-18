"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// Intersection observer for scroll animations
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    const sections = ref.current?.querySelectorAll(".reveal-section");
    sections?.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function LandingPage() {
  const pageRef = useScrollReveal();

  const handleAnonymousStart = () => {
    document.cookie = "lorelai-anonymous=true;path=/;max-age=31536000";
    localStorage.setItem("lorelai-anonymous", "true");
    window.location.href = "/";
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-[#FAF8F5] overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .reveal-section {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-section.revealed {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        .phone-float { animation: float 6s ease-in-out infinite; }
        .glow-bg { animation: pulse-glow 4s ease-in-out infinite; }
        .bento-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 60px -15px rgba(111, 78, 55, 0.15);
        }
      ` }} />

      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="glow-bg absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(111,78,55,0.08)_0%,transparent_70%)]" />
          <div className="glow-bg absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(232,240,232,0.5)_0%,transparent_70%)]" style={{ animationDelay: "2s" }} />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F0E8]/60 text-[#6F4E37]/60 text-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Free · Private · No sign-up needed
            </div>
            <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl lg:text-7xl text-[#6F4E37] leading-[1.1] mb-6 tracking-tight">
              The friend who&apos;s always there at <span className="italic">2am</span>
            </h1>
            <p className="text-lg md:text-xl text-[#6F4E37]/60 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              AI therapy companion that listens, understands, and speaks your language. Voice-first. Completely free. Always private.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={() => { /* handleAnonymousStart inline */ document.cookie = "lorelai-anonymous=true;path=/;max-age=31536000"; localStorage.setItem("lorelai-anonymous", "true"); window.location.href = "/"; }}
                className="px-8 py-4 bg-[#6F4E37] text-white rounded-full text-lg font-medium hover:bg-[#5a3f2d] transition-all hover:shadow-lg hover:shadow-[#6F4E37]/20 active:scale-[0.98]"
              >
                Start talking — free ☕
              </button>
              <Link
                href="/auth"
                className="px-8 py-4 border-2 border-[#6F4E37]/15 text-[#6F4E37] rounded-full text-lg font-medium hover:border-[#6F4E37]/30 hover:bg-[#6F4E37]/5 transition-all active:scale-[0.98]"
              >
                Sign in
              </Link>
            </div>
            <p className="text-[#6F4E37]/30 text-sm mt-6">No download · No credit card · Works on any device</p>
          </div>

          {/* Right: Phone mockup with chat UI */}
          <div className="phone-float hidden lg:flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="w-[300px] h-[600px] bg-white rounded-[40px] shadow-2xl shadow-[#6F4E37]/10 border border-[#6F4E37]/5 p-3 overflow-hidden">
                {/* Status bar */}
                <div className="flex justify-between items-center px-4 py-2 text-xs text-[#6F4E37]/40">
                  <span>9:41</span>
                  <div className="w-20 h-5 bg-black rounded-full" />
                  <span>☕</span>
                </div>
                {/* Chat header */}
                <div className="text-center py-3 border-b border-[#6F4E37]/5">
                  <p className="font-[family-name:var(--font-playfair)] text-[#6F4E37] text-lg">Lorelai</p>
                  <p className="text-[#6F4E37]/40 text-xs">your safe space ☕</p>
                </div>
                {/* Chat messages */}
                <div className="p-4 space-y-3 text-sm">
                  <div className="flex justify-end">
                    <div className="bg-[#E8F0E8] text-[#6F4E37] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[200px]">
                      I&apos;ve been feeling really anxious about work
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#6F4E37]/8 text-[#6F4E37]/80 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[220px]">
                      That sounds heavy. What specifically about work is weighing on you? 💛
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#E8F0E8] text-[#6F4E37] rounded-2xl rounded-br-md px-4 py-2.5 max-w-[200px]">
                      I&apos;m scared of failing
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white border border-[#6F4E37]/8 text-[#6F4E37]/80 rounded-2xl rounded-bl-md px-4 py-2.5 max-w-[220px]">
                      That fear of being &quot;found out&quot; — so many people carry that. It says nothing about your actual abilities.
                    </div>
                  </div>
                </div>
                {/* Input bar */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center gap-2 px-4 py-3 bg-[#FAF8F5] rounded-full border border-[#6F4E37]/8">
                  <div className="w-8 h-8 bg-[#6F4E37]/10 rounded-full flex items-center justify-center text-sm">🎤</div>
                  <span className="text-[#6F4E37]/30 text-sm">Type or speak...</span>
                </div>
              </div>
              {/* Glow behind phone */}
              <div className="absolute -inset-10 bg-[radial-gradient(circle,rgba(232,240,232,0.4)_0%,transparent_70%)] -z-10 rounded-full" />
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#6F4E37]/20">
          <span className="text-xs">scroll</span>
          <div className="w-5 h-8 border-2 border-[#6F4E37]/15 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-[#6F4E37]/20 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF BAR ===== */}
      <section className="reveal-section border-y border-[#6F4E37]/5 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-6 md:gap-12 text-sm text-[#6F4E37]/40">
          <span>💬 10,000+ conversations</span>
          <span>🌏 15 Indian languages</span>
          <span>🆓 100% free</span>
          <span>🔒 Anonymous mode</span>
          <span>🎙️ Voice-first</span>
        </div>
      </section>

      {/* ===== BENTO FEATURES GRID ===== */}
      <section className="reveal-section py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl text-[#6F4E37] text-center mb-4">
            Why people love Lorelai
          </h2>
          <p className="text-[#6F4E37]/50 text-center mb-16 text-lg">Not another chatbot. A genuine listener.</p>
          
          {/* Bento Grid - asymmetric */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Big card - Voice first */}
            <div className="bento-card md:col-span-2 bg-gradient-to-br from-[#E8F0E8]/40 to-[#E8F0E8]/10 rounded-3xl p-8 md:p-10 border border-[#6F4E37]/5">
              <div className="text-4xl mb-4">🎙️</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#6F4E37] mb-3">Voice-first therapy</h3>
              <p className="text-[#6F4E37]/60 text-lg leading-relaxed max-w-md">Talk, don&apos;t type. Lorelai listens with a warm Indian voice and responds like someone who genuinely cares. It&apos;s like calling a friend at 2am — except she always picks up.</p>
            </div>
            
            {/* Small card - Private */}
            <div className="bento-card bg-white rounded-3xl p-8 border border-[#6F4E37]/5">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[#6F4E37] mb-3">Truly private</h3>
              <p className="text-[#6F4E37]/60 leading-relaxed">Anonymous mode. Auto-delete. End-to-end privacy. We literally can&apos;t read your conversations.</p>
            </div>
            
            {/* Small card - Languages */}
            <div className="bento-card bg-white rounded-3xl p-8 border border-[#6F4E37]/5">
              <div className="text-4xl mb-4">🌏</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[#6F4E37] mb-3">Your language</h3>
              <p className="text-[#6F4E37]/60 leading-relaxed">Hindi, Tamil, Telugu, Bengali, Kannada, Malayalam, Marathi, Gujarati, Punjabi + 6 more.</p>
            </div>
            
            {/* Big card - Couples */}
            <div className="bento-card md:col-span-2 bg-gradient-to-br from-[#6F4E37]/5 to-transparent rounded-3xl p-8 md:p-10 border border-[#6F4E37]/5">
              <div className="text-4xl mb-4">💑</div>
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-[#6F4E37] mb-3">Couples mode</h3>
              <p className="text-[#6F4E37]/60 text-lg leading-relaxed max-w-md">Share a code, both join the same session. Lorelai mediates in real-time — validates both sides, teaches communication, never takes one. Free couples therapy that actually works.</p>
              <Link href="/couples" className="inline-flex items-center gap-2 mt-4 text-[#6F4E37] font-medium hover:gap-3 transition-all">
                Try couples mode <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONVERSATION PREVIEW ===== */}
      <section className="reveal-section py-24 px-6 bg-gradient-to-b from-[#FAF8F5] via-[#E8F0E8]/20 to-[#FAF8F5]">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl text-[#6F4E37] mb-4">
            A real conversation with Lorelai
          </h2>
          <p className="text-[#6F4E37]/50 text-lg">This is what it actually feels like.</p>
        </div>
        
        <div className="max-w-lg mx-auto space-y-4">
          {/* User message */}
          <div className="flex justify-end">
            <div className="bg-[#E8F0E8] text-[#6F4E37] rounded-2xl rounded-br-md px-5 py-3 max-w-[80%] text-[15px]">
              I&apos;ve been feeling really anxious about work lately. Like everyone&apos;s going to find out I don&apos;t belong here.
            </div>
          </div>
          {/* Lorelai */}
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6F4E37]/10 flex items-center justify-center text-sm flex-shrink-0 mt-1">☕</div>
            <div className="bg-white border border-[#6F4E37]/8 text-[#6F4E37]/80 rounded-2xl rounded-bl-md px-5 py-3 max-w-[80%] text-[15px] leading-relaxed">
              That sounds really heavy. The fear of being &quot;found out&quot; — it&apos;s called imposter syndrome, and so many brilliant people carry it. Can you tell me what specifically triggered this feeling?
            </div>
          </div>
          {/* User */}
          <div className="flex justify-end">
            <div className="bg-[#E8F0E8] text-[#6F4E37] rounded-2xl rounded-br-md px-5 py-3 max-w-[80%] text-[15px]">
              My manager gave me a big project and I just froze. I couldn&apos;t even start.
            </div>
          </div>
          {/* Lorelai */}
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6F4E37]/10 flex items-center justify-center text-sm flex-shrink-0 mt-1">☕</div>
            <div className="bg-white border border-[#6F4E37]/8 text-[#6F4E37]/80 rounded-2xl rounded-bl-md px-5 py-3 max-w-[80%] text-[15px] leading-relaxed">
              Freezing isn&apos;t failure — it&apos;s your nervous system saying &quot;this matters to me.&quot; The fact that you care enough to freeze? That&apos;s actually a sign of how much you want to do well. What if we broke that project into the tiniest first step? 💛
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="reveal-section py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl text-[#6F4E37] text-center mb-16">
            Three steps. That&apos;s it.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {[
              { num: "01", title: "Open Lorelai", desc: "No download. No sign-up. Just open the link on any phone or laptop and you\u2019re in." },
              { num: "02", title: "Talk about anything", desc: "Text or voice, in any of 15 Indian languages. Lorelai mirrors your language and meets you where you are." },
              { num: "03", title: "Feel heard", desc: "Come back whenever you need. Lorelai remembers your journey and grows with you." }
            ].map((step) => (
              <div key={step.num} className="text-center md:text-left">
                <div className="font-[family-name:var(--font-playfair)] text-7xl text-[#6F4E37]/8 mb-2">{step.num}</div>
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[#6F4E37] mb-2">{step.title}</h3>
                <p className="text-[#6F4E37]/50 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="reveal-section py-24 px-6 bg-gradient-to-b from-[#FAF8F5] via-[#E8F0E8]/15 to-[#FAF8F5]">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl text-[#6F4E37] text-center mb-16">
            Real stories, real people
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { quote: "I couldn\u2019t afford \u20B92,700/session therapy. Lorelai helped me through my worst week. I cried, she held space. For free.", name: "A., 24", city: "Mumbai" },
              { quote: "Finally an app that speaks Hindi and actually understands how I feel. \u092E\u0948\u0902\u0928\u0947 \u092A\u0939\u0932\u0940 \u092C\u093E\u0930 \u0915\u093F\u0938\u0940 \u0938\u0947 openly \u092C\u093E\u0924 \u0915\u0940\u0964", name: "S., 19", city: "Delhi" },
              { quote: "The couples mode saved a fight that was about to ruin our weekend. Lorelai helped us see each other\u2019s side without judgment.", name: "R. & M.", city: "Bangalore" }
            ].map((t, i) => (
              <div key={i} className="bento-card bg-white rounded-3xl p-8 border border-[#6F4E37]/5">
                <div className="text-[#6F4E37]/15 text-5xl font-serif mb-4">&ldquo;</div>
                <p className="text-[#6F4E37]/70 leading-relaxed mb-6 italic">{t.quote}</p>
                <div className="text-[#6F4E37]/40 text-sm">
                  <span className="font-medium text-[#6F4E37]/60">{t.name}</span> · {t.city}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRIVACY ===== */}
      <section className="reveal-section py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#E8F0E8]/50 rounded-2xl text-3xl mb-6">🔒</div>
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl text-[#6F4E37] mb-4">
            Your safe space. For real.
          </h2>
          <p className="text-[#6F4E37]/50 text-lg mb-10">We built Lorelai for people who don&apos;t trust apps with their feelings. So we made trust the default.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
            {["No sign-up required", "Conversations auto-delete", "Full anonymous mode", "Open privacy policy"].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-[#6F4E37]/70">
                <div className="w-6 h-6 rounded-full bg-[#E8F0E8] flex items-center justify-center text-xs text-[#6F4E37]">✓</div>
                {item}
              </div>
            ))}
          </div>
          <Link href="/privacy" className="inline-flex items-center gap-2 mt-8 text-[#6F4E37]/40 text-sm hover:text-[#6F4E37]/60 transition-colors">
            Read our privacy policy →
          </Link>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="reveal-section py-32 px-6 bg-gradient-to-b from-[#FAF8F5] to-[#E8F0E8]/20">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-[#6F4E37] mb-6">
            Ready to feel heard?
          </h2>
          <p className="text-[#6F4E37]/50 text-lg mb-10">You don&apos;t need to hit rock bottom to deserve support.</p>
          <button
            onClick={() => { document.cookie = "lorelai-anonymous=true;path=/;max-age=31536000"; localStorage.setItem("lorelai-anonymous", "true"); window.location.href = "/"; }}
            className="px-10 py-5 bg-[#6F4E37] text-white rounded-full text-xl font-medium hover:bg-[#5a3f2d] transition-all hover:shadow-xl hover:shadow-[#6F4E37]/20 active:scale-[0.98]"
          >
            Start now — it&apos;s free ☕
          </button>
          <p className="text-[#6F4E37]/25 text-sm mt-6">No credit card · No judgment · Just you</p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[#6F4E37]/5 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-[family-name:var(--font-playfair)] text-[#6F4E37]/40 text-lg mb-4">Made with ☕ in India</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-[#6F4E37]/30 mb-6">
            <Link href="/privacy" className="hover:text-[#6F4E37]/50 transition-colors">Privacy</Link>
            <span>·</span>
            <a href="tel:9152987821" className="hover:text-[#6F4E37]/50 transition-colors">iCall: 9152987821</a>
            <span>·</span>
            <a href="tel:18602662345" className="hover:text-[#6F4E37]/50 transition-colors">Vandrevala: 1860-2662-345</a>
            <span>·</span>
            <a href="tel:9820466726" className="hover:text-[#6F4E37]/50 transition-colors">AASRA: 9820466726</a>
          </div>
          <p className="text-[#6F4E37]/20 text-xs">
            Lorelai is an AI companion, not a replacement for professional therapy. If you&apos;re in crisis, please reach out to the helplines above.
          </p>
        </div>
      </footer>
    </div>
  );
}
