"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, resendConfirmation, AuthError } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      if (err instanceof AuthError && (err.code === 'user_already_exists' || err.code === 'email_exists')) {
        setError("An account with this email already exists. Please sign in or reset your password.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    setResendLoading(true);
    try {
      await resendConfirmation(email);
      setError("Confirmation email resent. Please check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend confirmation email");
    } finally {
      setResendLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl text-ink">Check your inbox</h1>
        <p className="mt-2 text-sm text-ink/60">
          We&apos;ve sent a confirmation link to <strong>{email}</strong>.
          Redirecting you to sign in...
        </p>
        <div className="mt-6">
          <button
            onClick={handleResendConfirmation}
            disabled={resendLoading}
            className="text-sm text-clay hover:text-clay-dark underline disabled:opacity-60"
          >
            {resendLoading ? "Sending..." : "Resend confirmation email"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Create your account</h1>
      <p className="mt-1 text-sm text-ink/60">
        Join TheGanaGallery to save favourites and check out faster.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-sand-dark bg-white px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-sand-dark bg-white px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-sand-dark bg-white px-3.5 py-2.5 text-sm text-ink focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/20"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-clay hover:text-clay-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
}
