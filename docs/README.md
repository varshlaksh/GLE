# Documentation Index

## Overview

This directory contains comprehensive technical documentation for TheGanaGallery application. Documentation is organized by domain and maintained alongside the codebase.

## Structure

```
docs/
├── architecture/         # System architecture & design
│   ├── overview.md       # High-level system diagram + component map
│   ├── data-flow.md      # Request lifecycle diagrams (SSR, API, client)
│   ├── routing.md        # Route groups, middleware, layouts
│   └── security-model.md # RLS policies, auth boundaries, admin checks
├── authentication/       # Supabase Auth implementation
│   ├── overview.md       # Supabase Auth + SSR flow
│   ├── signup-flow.md    # Email confirmation, current gaps, planned fix
│   ├── session-management.md # Cookies, middleware, token refresh
│   ├── admin-access.md   # Role-based access, profile.role
│   └── migration-to-clerk.md # Future migration plan
├── environment/          # Configuration management
│   ├── variables.md      # All env vars with descriptions
│   ├── secrets.md        # Vercel/GitHub secrets management
│   └── environments.md   # Dev vs preview vs production differences
├── development/          # Developer workflow
│   ├── setup.md          # Local dev environment, prerequisites
│   ├── workflow.md       # Branching, PR process, commit conventions
│   ├── debugging.md      # Common issues, logging, Supabase dashboard
│   └── database-local.md # Local Supabase CLI, migration workflow
├── database/             # Database schema & operations
│   ├── schema.md         # Tables, columns, relationships
│   ├── migrations.md     # Migration history, how to add new
│   ├── rls-policies.md   # Policy reference by table (THIS IS COMPLETE)
│   ├── triggers.md       # Auth triggers, slug generation
│   └── seed-data.md      # Sample data, review seeds
├── api/                  # API reference
│   ├── overview.md       # REST conventions, response format
│   ├── auth-guards.md    # requireUser, requireAdmin usage
│   ├── endpoints/        # Per-endpoint docs
│   └── error-handling.md # Error codes, retry logic
├── integrations/         # Third-party services
│   ├── supabase.md       # Client patterns, SSR vs build-time
│   ├── razorpay.md       # Order flow, webhook (missing), testing
│   ├── cloudinary.md     # Upload flow, folders, transformations
│   └── dicebear.md       # Avatar placeholders
├── testing/              # Testing strategy
│   ├── strategy.md       # Unit, integration, e2e approach
│   ├── setup.md          # Test runner selection (Vitest/Playwright)
│   ├── auth-testing.md   # Mocking Supabase auth
│   └── api-testing.md    # Testing API routes
├── deployment/           # Deployment procedures
│   ├── vercel.md         # Vercel config, build settings, domains
│   ├── supabase.md       # Production Supabase project setup
│   ├── environment-promotion.md # Dev → preview → production
│   ├── rollback.md       # Rollback procedures
│   └── dns-ssl.md        # Custom domain, SSL
├── operations/           # Operational procedures
│   ├── monitoring.md     # Logs, errors, performance
│   ├── backups.md        # Supabase backups, PITR
│   ├── admin-tasks.md    # Common admin operations
│   └── incident-response.md # Runbooks for common failures
├── troubleshooting/      # Problem resolution
│   ├── common-errors.md  # Build errors, runtime errors, auth issues
│   ├── auth-issues.md    # Session loss, email confirmation, redirects
│   ├── database-issues.md # RLS, migration failures
│   ├── payment-issues.md # Razorpay failures, signature verification
│   └── upload-issues.md  # Cloudinary errors
├── decisions/            # Architecture Decision Records
│   ├── ADR-template.md   # Template for new ADRs
│   ├── 001-supabase-auth.md
│   ├── 002-zustand-cart.md
│   ├── 003-tailwind-v4.md
│   ├── 004-app-router.md
│   └── 005-razorpay.md
└── changelog/
    └── CHANGELOG.md      # Version history, breaking changes
```

## Documentation Principles

1. **Source of truth** — Documentation reflects actual code, not aspirations
2. **Verifiable** — Every claim traceable to source files
3. **Current-state** — Documents what exists; marks gaps as "Not Implemented" or "Planned"
4. **Maintainable** — Update docs when code changes; outdated docs are worse than none
5. **Practical** — Focus on what developers need to know to work effectively

## Contributing to Documentation

- Update relevant docs when adding/modifying features
- Add new ADRs for significant architectural decisions
- Keep `CHANGELOG.md` updated with releases
- Fix inaccuracies immediately when discovered

## Cross-References

| Document | Primary Audience | Update Frequency |
|----------|------------------|------------------|
| `architecture/overview.md` | All developers | On architectural changes |
| `authentication/signup-flow.md` | Frontend/Backend | On auth changes |
| `environment/variables.md` | All developers | On new env vars |
| `development/setup.md` | New team members | On setup changes |
| `database/rls-policies.md` | Backend/Fullstack | On schema/policy changes |
| `decisions/*.md` | Architects/Leads | On major decisions |

## Related Files (Outside docs/)

| File | Purpose |
|------|---------|
| `README.md` | Project overview, quick start, tech stack |
| `AGENTS.md` | Team coordination, phase tracking, conventions |
| `CLAUDE.md` | AI agent instructions (delegates to AGENTS.md) |
| `supabase/migrations/*.sql` | Database schema source of truth |
| `types/index.ts` | Shared TypeScript types |
| `lib/*.ts` | Core utilities (auth, clients, cart, payments) |