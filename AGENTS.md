# GLE — Agent Instructions

## Project Context
- Project: GLE / TheGanaGallery.
- Stack: Next.js, TypeScript, Supabase Auth/Database, Razorpay.
- Read the existing relevant documentation in `docs/` before changing code. Avoid duplicating existing documentation.
- Use the repository's existing architecture and coding conventions.

## Working Rules
- Inspect `git status` and existing diffs before making changes.
- Preserve all pre-existing local modifications and untracked files.
- Make small, focused changes. Explain the root cause before implementing a fix.
- Do not run destructive Git commands, reset user changes, or overwrite unrelated work.
- Do not expose or request secrets, service-role keys, or production credentials.

## Security and Payments
- Never disable Supabase RLS to fix a permission error.
- Verify database grants, RLS policies, API validation, and authorization separately.
- User-submitted reviews must remain unapproved until moderation.
- Do not change Razorpay checkout, order status, payment verification, or webhook behavior unless explicitly authorized.
- Never mark an unpaid order as paid without verified payment evidence.
- Do not apply database migrations to production or deploy without explicit approval.

## Current Sprint
1. Investigate and fix the review submission RLS/permission blocker in DEV.
2. Test anonymous and authenticated review submissions, ensuring reviews remain unapproved.
3. Verify the Forgot Password flow only after the Supabase email rate limit clears.
4. Assess the P0 manual order-payment status risk and Razorpay regression requirements.
5. Update the Notion tracker with actual evidence, blockers, and test results.

## Out of Scope
- GST invoice implementation.
- Homepage video implementation.
- Reopening the completed COD-removal task.
- Unrelated refactoring or redesign.

## Validation
- Use PowerShell commands on Windows.
- Run the relevant targeted tests and `npx tsc --noEmit`.
- Run `npm run build` when practical.
- Report exactly what changed, what passed, what failed, and what remains unverified.
- Do not claim a task is complete until its required tests pass.