"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { resetPasswordForEmail, AuthError } from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearTimeout(cooldownTimerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(true);
    setCooldownSeconds(60);
    cooldownTimerRef.current = setInterval(() => {
      setCooldownSeconds((prev) => {
        if (prev <= 1) {
          if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
          setCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordForEmail(email.trim());
      setSuccess(true);
      startCooldown(); // prevent immediate repeat even after success
    } catch (err) {
      if (err instanceof AuthError && err.code === 'over_email_send_rate_limit') {
        setError("Too many requests. Please wait a moment before trying again.");
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
      startCooldown(); // enforce cooldown on any error as well
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl text-ink">Check your inbox</h1>
        <p className="mt-2 text-sm text-ink/60">
          If an account exists for <strong>{email}</strong>, you will receive a password reset link shortly.
        </p>
        <p className="mt-4 text-sm text-ink/60">
          The link will expire in 24 hours for security.
        </p>
        <p className="mt-6 text-center text-sm text-ink/60">
          <Link href="/login" className="font-semibold text-clay hover:text-clay-dark underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  const isDisabled = loading || cooldown;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Reset your password</h1>
      <p className="mt-1 text-sm text-ink/60">
        Enter your email address and we&apos;ll send you a link to create a new password.
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

        {error && (
          <p className="rounded-lg bg-clay/10 px-3 py-2 text-sm text-clay-dark">
            {error}
          </p>
        )}

        {cooldown && (
          <p className="text-sm text-ink/60 text-center">
            Please wait {cooldownSeconds}s before requesting another email.
          </p>
        )}

        <button
          type="submit"
          disabled={isDisabled}
          className="w-full rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark disabled:opacity-60"
        >
          {loading
            ? "Sending reset link..."
            : cooldown
            ? `Try again in ${cooldownSeconds}s`
            : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        <Link href="/login" className="font-semibold text-clay hover:text-clay-dark underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}