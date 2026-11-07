'use client'

import { useEffect, useState } from 'react'
import { createClient } from './supabase-browser'
import type { User } from '@supabase/supabase-js'

// ── Auth Error Classes ────────────────────────────────
export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: Error
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

function mapSupabaseError(error: { message: string; code?: string }): AuthError {
  const code = error.code ?? 'unknown_error'
  const message = error.message

  switch (code) {
    case 'invalid_credentials':
      return new AuthError(
        'Email or password is incorrect. Check your details or reset your password.',
        code,
        new Error(message)
      )
    case 'email_not_confirmed':
      return new AuthError(
        'Please confirm your email before signing in. Check your inbox for the confirmation link.',
        code,
        new Error(message)
      )
    case 'user_already_exists':
    case 'email_exists':
      return new AuthError(
        'An account with this email already exists. Please sign in or reset your password.',
        code,
        new Error(message)
      )
    case 'weak_password':
      return new AuthError(
        'Password is too weak. Use at least 8 characters with a mix of letters, numbers, and symbols.',
        code,
        new Error(message)
      )
    case 'over_email_send_rate_limit':
      return new AuthError(
        'Too many requests. Please wait a moment before trying again.',
        code,
        new Error(message)
      )
    case 'over_request_rate_limit':
    case 'rate_limit':
      return new AuthError(
        'Too many attempts. Please wait before trying again.',
        code,
        new Error(message)
      )
    case 'invalid_token':
    case 'token_expired':
    case 'expired_token':
      return new AuthError(
        'This link has expired or is invalid. Please request a new one.',
        code,
        new Error(message)
      )
    case 'same_password':
      return new AuthError(
        'New password must be different from your current password.',
        code,
        new Error(message)
      )
    default:
      return new AuthError(
        message || 'Something went wrong. Please try again.',
        code,
        new Error(message)
      )
  }
}

// ── Hook: use in any Client Component ────────────────
export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// ── Sign Up ───────────────────────────────────────────
export async function signUp(email: string, password: string) {
  const supabase = createClient()
  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })
  if (error) throw mapSupabaseError(error)
  return data
}

// ── Sign In ───────────────────────────────────────────
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw mapSupabaseError(error)
  return data
}

// ── Forgot Password — request reset email ─────────────
export async function resetPasswordForEmail(email: string) {
  const supabase = createClient()
  const origin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`,
  })
  if (error) throw mapSupabaseError(error)
}

// ── Reset Password — update password with recovery session ─────────────
export async function updatePassword(newPassword: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw mapSupabaseError(error)
}

// ── Resend Confirmation Email ─────────────────────────
export async function resendConfirmation(email: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) throw mapSupabaseError(error)
}

// ── Sign Out — clears cart from localStorage too ─────
export async function signOut() {
  const supabase = createClient()
  // Clear persisted cart so next user starts fresh
  if (typeof window !== 'undefined') {
    localStorage.removeItem('thegana-cart')
  }
  const { error } = await supabase.auth.signOut()
  if (error) throw mapSupabaseError(error)
}
