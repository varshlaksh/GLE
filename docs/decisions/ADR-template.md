# Architecture Decision Record Template

## ADR-XXX: [Title]

**Status:** Proposed | Accepted | Deprecated | Superseded
**Date:** YYYY-MM-DD
**Deciders:** [Names/roles]
**Technical Story:** [Link to issue/PR]

---

## Context

What is the issue that we're seeing that is motivating this decision or change?

Describe the forces at play:
- Technical constraints
- Business requirements
- Team capabilities
- Timeline pressures
- Regulatory/compliance needs

---

## Decision

What is the change that we're proposing or have agreed to implement?

State the decision clearly and concisely.

---

## Alternatives Considered

### Option 1: [Name]
- **Pros:**
- **Cons:**

### Option 2: [Name]
- **Pros:**
- **Cons:**

### Option 3: [Name] (Current/Status Quo)
- **Pros:**
- **Cons:**

---

## Consequences

### Positive
- [Benefit 1]
- [Benefit 2]

### Negative
- [Drawback 1]
- [Drawback 2]

### Risks
- [Risk 1] — Mitigation: [How to handle]
- [Risk 2] — Mitigation: [How to handle]

### Migration/Implementation Effort
- Estimated effort: [Small/Medium/Large]
- Breaking changes: [Yes/No]
- Rollback plan: [Description]

---

## Implementation Notes

- Key files to modify:
- New dependencies:
- Configuration changes:
- Testing requirements:

---

## Related ADRs

- ADR-XXX: [Title] — [Relationship]
- ADR-YYY: [Title] — [Relationship]

---

## References

- [Link to relevant docs, issues, PRs, external resources]

---

## Example: ADR-001: Use Supabase Auth over Clerk/NextAuth

**Status:** Accepted
**Date:** 2024-01-15
**Deciders:** Lakshya (Backend), Daksh (Frontend)

### Context

Need authentication for e-commerce storefront. Requirements:
- Email/password signup & login
- Session management with SSR support
- Admin role-based access
- PostgreSQL database already on Supabase
- Team has Supabase experience
- Budget constraints (free tier preferred)

### Decision

Use **Supabase Auth** with `@supabase/ssr` for Next.js App Router integration.

### Alternatives Considered

#### Option 1: Clerk
- **Pros:** Better UX components, built-in email confirmation flow, password reset, social login, user management dashboard
- **Cons:** Additional cost at scale, another vendor, migration needed later if outgrow free tier

#### Option 2: NextAuth.js (Auth.js)
- **Pros:** Framework-agnostic, many providers, self-hosted
- **Cons:** More complex setup with Next.js App Router, no built-in database (need adapter), session handling more manual

#### Option 3: Supabase Auth (Selected)
- **Pros:** Integrated with existing Supabase PostgreSQL, free tier generous, `@supabase/ssr` handles cookies/SSR automatically, RLS policies work natively with `auth.uid()`, single vendor
- **Cons:** Email confirmation flow requires custom callback route (gap identified), no built-in password reset UI, less polished pre-built components

### Consequences

**Positive:**
- Single source of truth for user identity (auth.users ↔ profiles via trigger)
- RLS policies enforce data access at database level
- No additional infrastructure cost
- Type-safe user IDs shared across auth and data

**Negative:**
- Email confirmation UX gap (no `/auth/callback` route)
- No password reset implementation
- Limited social login configuration vs Clerk
- Vercel preview deployments break email redirects (fixed by `emailRedirectTo`)

**Risks:**
- Vendor lock-in to Supabase — Mitigation: Abstract auth behind `lib/auth.ts` interface
- Supabase Auth API changes — Mitigation: Pin `@supabase/ssr` version, test on upgrades

### Implementation Notes

- `lib/auth.ts` exports `useUser()`, `signUp()`, `signIn()`, `signOut()` — all components use this
- `middleware.ts` refreshes session on every request
- `lib/adminAuth.ts` provides `requireUser()`/`requireAdmin()` for API routes
- Migration `on_auth_user_created` trigger creates `profiles` row

### Related ADRs

- ADR-002: Use Zustand for cart state
- ADR-005: Use Razorpay for payments (Indian market)

### References

- [Supabase SSR Docs](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js App Router Auth Patterns](https://nextjs.org/docs/app/building-your-application/authentication)