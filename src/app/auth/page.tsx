"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for a confirmation link! ☕");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.push("/");
        router.refresh();
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center msg-enter">
        <div className="text-7xl mb-6">☕</div>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-coffee-dark mb-2">
          Lorelai
        </h1>
        <p className="text-dark/60 mb-8">
          {isSignUp
            ? "Pull up a chair. Let's get you set up."
            : "Welcome back. Your usual spot is waiting."}
        </p>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full px-6 py-3 bg-white border border-warm-gray rounded-full hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-3 disabled:opacity-50 mb-4"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="text-dark">
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-warm-gray"></div>
          <span className="text-dark/30 text-sm">or</span>
          <div className="flex-1 h-px bg-warm-gray"></div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name..."
              className="w-full px-4 py-3 rounded-full bg-white border border-warm-gray focus:border-coffee focus:outline-none text-dark placeholder:text-dark/30"
              required
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email..."
            className="w-full px-4 py-3 rounded-full bg-white border border-warm-gray focus:border-coffee focus:outline-none text-dark placeholder:text-dark/30"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password..."
            className="w-full px-4 py-3 rounded-full bg-white border border-warm-gray focus:border-coffee focus:outline-none text-dark placeholder:text-dark/30"
            required
            minLength={6}
          />

          {error && <p className="text-rust text-sm">{error}</p>}
          {message && <p className="text-coffee text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-coffee text-cream rounded-full hover:bg-coffee-light transition-colors font-medium disabled:opacity-50"
          >
            {loading
              ? "Brewing..."
              : isSignUp
              ? "Sign up ☕"
              : "Sign in ☕"}
          </button>
        </form>

        <button
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError("");
            setMessage("");
          }}
          className="mt-4 text-coffee/60 hover:text-coffee text-sm transition-colors"
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
}
