"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link href="/" className="text-warm-brown/40 hover:text-warm-brown text-sm mb-8 inline-block">
          ← Back to Lorelai
        </Link>

        <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-warm-brown mb-2">
          Privacy Policy
        </h1>
        <p className="text-warm-brown/40 text-sm mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-warm-brown/70 text-[15px] leading-relaxed">
          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-warm-brown mb-3">
              What we collect
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Your email address (for authentication)</li>
              <li>Your name (if you provide one)</li>
              <li>Conversation messages between you and Lorelai</li>
              <li>Mood check-in selections</li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-warm-brown mb-3">
              What we don&apos;t do
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>We don&apos;t sell your data.</strong> Ever. To anyone.</li>
              <li><strong>We don&apos;t share your conversations</strong> with third parties.</li>
              <li><strong>We don&apos;t train AI models</strong> on your conversations.</li>
              <li><strong>We don&apos;t use your data for advertising.</strong></li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-warm-brown mb-3">
              How your data is stored
            </h2>
            <p>
              Your data is stored in <strong>Supabase</strong> (Singapore region, AWS ap-southeast-1), encrypted at rest.
              Only you can access your conversations through your authenticated account.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-warm-brown mb-3">
              Third-party services
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Anthropic Claude</strong> — Powers Lorelai&apos;s responses</li>
              <li><strong>ElevenLabs</strong> — Voice synthesis for spoken responses</li>
              <li><strong>Supabase</strong> — Authentication and data storage</li>
              <li><strong>Google</strong> — OAuth sign-in option</li>
            </ul>
            <div className="mt-4 p-4 bg-warm-brown/5 rounded-2xl border border-warm-brown/8">
              <p className="text-warm-brown/60 text-sm">
                <strong>Honest note:</strong> Your conversations are sent to Anthropic&apos;s Claude API to generate responses.
                Anthropic does not train on API data. We don&apos;t store or train on your conversations beyond your active session.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-warm-brown mb-3">
              Anonymous mode
            </h2>
            <p>
              You can use Lorelai without signing in. In anonymous mode, <strong>nothing is saved</strong> — no account,
              no conversations, no data. Everything exists only in your browser&apos;s memory and disappears when you close the tab.
            </p>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-warm-brown mb-3">
              Deleting your data
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Use the <strong>Settings</strong> panel in the app to delete individual or all conversations</li>
              <li>Use &quot;Delete all my data&quot; to remove everything — conversations, messages, and profile</li>
              <li>Enable auto-delete to automatically remove conversations after 7 or 30 days</li>
              <li>Or email us at <a href="mailto:support@lorelai.app" className="text-warm-brown underline">support@lorelai.app</a></li>
            </ul>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-warm-brown mb-3">
              Crisis disclaimer
            </h2>
            <div className="p-4 bg-red-50 rounded-2xl border border-red-200">
              <p className="text-red-800 text-sm">
                <strong>Lorelai is not a replacement for professional therapy or crisis intervention.</strong> If you are
                experiencing a mental health emergency, please contact:
              </p>
              <ul className="mt-2 text-red-700 text-sm space-y-1">
                <li>iCall: <a href="tel:9152987821" className="underline">9152987821</a></li>
                <li>Vandrevala Foundation: <a href="tel:18602662345" className="underline">1860-2662-345</a> (24/7)</li>
                <li>AASRA: <a href="tel:9820466726" className="underline">9820466726</a></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-warm-brown mb-3">
              Contact
            </h2>
            <p>
              Questions about your privacy? Reach us at{" "}
              <a href="mailto:support@lorelai.app" className="text-warm-brown underline">support@lorelai.app</a>
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-warm-brown/8 text-center">
          <p className="text-warm-brown/30 text-xs">Made with care ☕</p>
        </div>
      </div>
    </div>
  );
}
