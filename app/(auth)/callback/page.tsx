import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AuthCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; error?: string; error_description?: string }>
}) {
  const { code, error, error_description } = await searchParams

  // If Supabase returned an error (e.g., expired or invalid token)
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl text-ink">Confirmation failed</h1>
          <p className="mt-4 text-sm text-ink/60">
            {error_description ?? error}
          </p>
          <p className="mt-6 text-sm text-clay-dark">
            Please{' '}
            <Link href="/login" className="underline hover:text-clay">
              sign in
            </Link>{' '}
            and request a new confirmation email.
          </p>
        </div>
      </div>
    )
  }

  if (!code) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl text-ink">Invalid link</h1>
          <p className="mt-4 text-sm text-ink/60">
            This confirmation link is missing a verification code.
          </p>
          <p className="mt-6 text-sm text-clay-dark">
            {' '}
            <Link href="/login" className="underline hover:text-clay">
              Sign in
            </Link>{' '}
            and request a new confirmation email.
          </p>
        </div>
      </div>
    )
  }

  // Exchange the code for a session (sets auth cookies via SSR bridge)
  const supabase = await createServerSupabaseClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sand px-4">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl text-ink">Could not confirm</h1>
          <p className="mt-4 text-sm text-ink/60">
            {exchangeError.message}
          </p>
          <p className="mt-6 text-sm text-clay-dark">
            <Link href="/login" className="underline hover:text-clay">
              Sign in
            </Link>{' '}
            and request a new confirmation email.
          </p>
        </div>
      </div>
    )
  }

  // Success – redirect to home (or any safe internal route)
  redirect('/')
}