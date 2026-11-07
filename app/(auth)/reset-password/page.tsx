"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { updatePassword, AuthError } from "@/lib/auth";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [validSession, setValidSession] = useState(false);
  const validationStarted = useRef(false);

  useEffect(() => {
    // Validation must run once because recovery tokens are single-use.
    if (validationStarted.current) return;
    validationStarted.current = true;

    const validateSession = async () => {
      const supabase = createClient();
      const tokenHash = searchParams.get("token_hash");

      try {
        // createBrowserClient automatically exchanges the PKCE `code` from
        // emailed links and removes it from the URL. Exchanging it manually
        // races that initialization and makes the valid one-time code appear
        // expired. token_hash is kept for controlled DEV recovery tests.
        const result = tokenHash
          ? await supabase.auth.verifyOtp({
              type: "recovery",
              token_hash: tokenHash,
            })
          : await supabase.auth.getSession();

        if (result.error || !result.data.session) {
          setError("This reset link has expired or is invalid. Please request a new one.");
          setValidSession(false);
        } else {
          setValidSession(true);
          window.history.replaceState({}, "", "/reset-password");
        }
      } catch {
        setError("Failed to validate reset link. Please request a new one.");
        setValidSession(false);
      } finally {
        setValidating(false);
      }
    };

    validateSession();
  }, [searchParams]);

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
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err) {
      if (err instanceof AuthError && err.code === 'same_password') {
        setError("New password must be different from your current password.");
      } else if (err instanceof AuthError && (err.code === 'invalid_token' || err.code === 'token_expired' || err.code === 'expired_token')) {
        setError("Your reset session has expired. Please request a new password reset link.");
        setValidSession(false);
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-clay border-t-transparent"></div>
        <p className="mt-4 text-sm text-ink/60">Validating reset link...</p>
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl text-ink">Invalid reset link</h1>
        <p className="mt-2 text-sm text-ink/60">
          {error || "This password reset link is invalid or has expired."}
        </p>
        <div className="mt-6">
          <Link
            href="/forgot-password"
            className="inline-block rounded-full bg-clay px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-clay-dark"
          >
            Request a new reset link
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-ink/60">
          <Link href="/login" className="font-semibold text-clay hover:text-clay-dark underline">
            Back to sign in
          </Link>
        </p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl text-ink">Password updated</h1>
        <p className="mt-2 text-sm text-ink/60">
          Your password has been successfully changed.
        </p>
        <p className="mt-4 text-sm text-ink/60">
          Redirecting you to sign in...
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Create new password</h1>
      <p className="mt-1 text-sm text-ink/60">
        Enter your new password below. Make sure it&apos;s different from your previous one.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink">
            New password
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
            Confirm new password
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
          {loading ? "Updating password..." : "Update password"}
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
