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
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createClient();

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

          {error && (
            <p className="text-rust text-sm">{error}</p>
          )}
          {message && (
            <p className="text-coffee text-sm">{message}</p>
          )}

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
