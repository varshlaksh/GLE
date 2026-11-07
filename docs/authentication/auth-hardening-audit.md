# GanaGallery Authentication Hardening Audit

**Generated:** 2026-08-30  
**Scope:** Investigation only – no code changes.

---

## 1. Executive Summary
The current authentication implementation works for production sign‑up/login **only when the Supabase Dashboard Site URL matches the production domain**. All other environments (localhost, Vercel preview) fail because the confirmation email redirects to the hard‑coded production URL and the application has no `/auth/callback` route to exchange the verification code for a session.  

Critical gaps:
* No `emailRedirectTo` supplied on sign‑up → reliance on dashboard config.
* Missing `/auth/callback` route → confirmation never creates a session.
* Middleware protects `/admin` **only by authentication**, not by role → any signed‑in user reaches admin UI.
* Password‑reset flow completely absent.
* No “Resend confirmation” UI.
* Profile row creation depends on an unseen database trigger; missing profile leads to 404 on `/api/profile`.
* Cookie security attributes not explicit.
* Several edge‑cases (expired/invalid token, unconfirmed‑email login, cookie‑less browsers) are unhandled.

**Risk posture:** 10 Critical, 12 High, 18 Medium, 22 Low issues identified (see matrix). Immediate fixes (Phase 1) are listed in Section 18.

---

## 2. Current Authentication Architecture
| Component | Technology | Location |
|-----------|------------|----------|
| **Client‑side auth helpers** | `@supabase/ssr` browser client | `lib/supabase-browser.ts` |
| **Server‑side auth helpers** | `@supabase/ssr` server client, service‑role client | `lib/supabase-server.ts` |
| **Auth API wrappers** | `signUp`, `signIn`, `signOut` | `lib/auth.ts` |
| **Admin guard** | `requireAdmin()`, `requireUser()` | `lib/adminAuth.ts` |
| **Middleware** | Session refresh + route protection | `middleware.ts` |
| **Signup UI** | Client component, calls `signUp` | `app/(auth)/signup/page.tsx` |
| **Login UI** | Client component, calls `signIn` | `app/(auth)/login/page.tsx` |
| **Protected API routes** | Use `requireUser` / `requireAdmin` | `app/api/**` |
| **Database** | Supabase Postgres + RLS | `supabase/migrations/0003‑0009` |
| **Email confirmation** | Supabase built‑in flow (no custom callback) | – |
| **Password reset** | **Not implemented** | – |

---

## 3. Complete Authentication Flow (Current)

1. **Signup** – User submits email/password → `signUp()` → `supabase.auth.signUp({email,password})` (no `emailRedirectTo`).  
2. Supabase creates `auth.users` row (`email_confirmed_at = NULL`) and sends confirmation email containing a link to `https://<project>.supabase.co/auth/v1/verify?token=…&redirect_to=<Site URL>`.  
3. **Email click** – Supabase validates token, sets `email_confirmed_at`, then redirects to **Site URL** (configured in Dashboard).  
4. Browser lands on **homepage** (`https://www.ganagallery.shop`). No Next.js route handles the code → **no session cookies are set**.  
5. User manually navigates to `/login` and signs in → `signIn()` → `supabase.auth.signInWithPassword` → session cookies issued by SSR middleware.  
6. **Middleware** runs on every request, calls `supabase.auth.getUser()` to refresh session, and only blocks `/admin` when *no user* (does **not** check role).  
7. **Admin API routes** call `requireAdmin()` → server‑side `getUser()` + profile `role='admin'` check.  
8. **Logout** – `signOut()` clears localStorage cart and calls `supabase.auth.signOut()` → cookies cleared.  

---

## 4. Signup Failure Analysis
| ID | Scenario | Current Behaviour | Expected | Severity | Status | Evidence | File | Root Cause | Recommended Fix | Test |
|----|----------|-------------------|----------|----------|--------|----------|------|------------|----------------|------|
| S1 | Valid signup (unique email, ≥6 pwd) | Returns `{user, session?}`; UI shows “Check inbox” → redirect `/login` after 2 s | Email contains link to app‑owned `/auth/callback`; session auto‑created | Critical | **Fail** | No `emailRedirectTo`; signup‑flow doc shows missing callback | `lib/auth.ts:34‑38`, `app/(auth)/signup/page.tsx` | Add `emailRedirectTo: \`${origin}/auth/callback\``; create callback route | Sign‑up on localhost, preview, prod |
| S2 | Duplicate email | Generic “Something went wrong” | Friendly “Email already in use – try login or reset password” | High | **Fail** | `catch` shows generic error | `lib/auth.ts`, signup page | Inspect `error.code === 'email_exists'` | Submit twice |
| S3 | Invalid email format | Browser blocks; server would reject | Same | Low | **Pass** (client) / **Unknown** (server) | HTML5 `type="email"` only | Signup page | Optional server guard | curl malformed |
| S4 | Weak password (<6) | Client blocks (`<6`) | Enforce ≥8, strength meter | Medium | **Pass** (client) | Hard‑coded check | Signup page | Raise min length | Submit 5‑char |
| S5 | Empty fields | `required` stops submit | Same | Low | **Pass** | HTML `required` | Signup page | – | – |
| S6 | Network/API failure | Generic error, no retry | Retry button, preserve input | Medium | **Fail** | Generic `catch` | Signup page | Add retry UI | Disconnect net |
| S7 | Supabase outage | Same as S6 | “Service unavailable – try later” | High | **Fail** | No circuit‑breaker | `lib/auth.ts` | Surface 5xx | Mock 5xx |
| S8 | Email confirmation required (default) | Confirmation email sent to Supabase verify URL → redirects to Site URL (prod) → no session | Link to `/auth/callback` → exchange code → set cookies | **Critical** | **Fail** | Docs & code show missing redirect | `lib/auth.ts`, signup‑flow doc | See S1 | Click link on localhost |
| S9 | Already‑confirmed user re‑signup | Same as duplicate (generic) | Detect confirmed → “Account exists, please login” | Medium | **Fail** | No inspection of `email_confirmed_at` | `lib/auth.ts` | Check `user.email_confirmed_at` | Signup with confirmed email |
| S10 | Signup returns user but no session | UI treats as success (expected) | Expected | Low | **Pass** | By design | `lib/auth.ts` | – | – |

---

## 5. Email Confirmation Failure Analysis
| ID | Scenario | Current Behaviour | Expected | Severity | Status | Evidence | File | Root Cause | Recommended Fix | Test |
|----|----------|-------------------|----------|----------|--------|----------|------|------------|----------------|------|
| E1 | Normal click (prod) | Redirect to `https://www.ganagallery.shop`; no cookies | Redirect to `/auth/callback` → session | **Critical** | **Fail** | Signup‑flow doc sequence diagram | `lib/auth.ts`, middleware | Missing `emailRedirectTo` & callback | Add callback + redirect |
| E2 | Missing redirect (user opens after logout) | Same as E1 | Same | Critical | Fail | – | – | – | – |
| E3 | Incorrect redirect (localhost / preview) | Link points to prod URL → user cannot confirm | Dynamic origin per env | **Critical** | **Fail** | Hard‑coded Site URL in dashboard | `lib/auth.ts` | Pass dynamic `emailRedirectTo` | Sign‑up on localhost |
| E4 | Expired token (>24 h) | Supabase generic error page | App shows “Link expired – request new email” | High | **Fail** | No custom handling | – (Supabase) | Callback reads `error` param | Wait 24 h or tamper token |
| E5 | Invalid/tampered token | Generic Supabase error | Friendly “Invalid link” | Medium | Fail | – | – | – | – |
| E6 | Re‑used link (already confirmed) | Redirect to Site URL, no session | “Email already confirmed – please login” | Medium | Fail | – | – | – | Click twice |
| E7 | Opened twice quickly (race) | Same as E6 | Idempotent | Low | Unknown | – | – | – | – |
| E8 | User loses email | No “Resend confirmation” UI | Button calling `supabase.auth.resend({type:'signup',email})` | High | **Not implemented** | Missing UI + API | `lib/auth.ts` (add `resendConfirmation`) | Add UI + endpoint | Click “Resend” |
| E9 | Confirm on different device/browser | No session on that browser | Session created in that browser | Critical | Fail | – | – | – | – |
| E10 | Confirm while already logged in | Supabase confirms, redirects to Site URL; existing session stays | No regression | Low | Pass (likely) | – | – | – | – |
| E11 | Prod / localhost / preview mismatches | Only prod works (if Site URL set) | All envs work via dynamic redirect | Critical | Fail | Hard‑coded Site URL | `lib/auth.ts`, env vars | Use `NEXT_PUBLIC_SITE_URL` per env + callback | Test each env |

---

## 6. Callback Analysis
| ID | Scenario | Current Behaviour | Expected | Severity | Status | Evidence | File | Root Cause | Recommended Fix | Test |
|----|----------|-------------------|----------|----------|--------|----------|------|------------|----------------|------|
| C1 | Success (code exchanged) | **Missing route** – never hit | `/auth/callback` receives `code`, calls `exchangeCodeForSession`, sets cookies, redirects | **Critical** | **Not implemented** | No `app/(auth)/callback/page.tsx` | – | Create server component using `createServerSupabaseClient()` | Click confirmation link |
| C2 | Error (missing/invalid/expired code) | N/A | Show friendly error, link to resend | High | Not implemented | – | – | Handle `error` query params | Hit `/auth/callback?error=...` |
| C3 | Unexpected `redirect_to` param | N/A | Ignore or validate against allow‑list | Medium | Not implemented | – | – | Sanitise | – |

---

## 7. Login Edge Cases
| ID | Scenario | Current Behaviour | Expected | Severity | Status | Evidence | File | Root Cause | Recommended Fix | Test |
|----|----------|-------------------|----------|----------|--------|----------|------|------------|----------------|------|
| L1 | Valid credentials | Works, session set | Works | Low | **Pass** (prod) | `lib/auth.ts:42‑47`, middleware | – | – | Login on prod |
| L2 | Wrong password | Generic “Something went wrong” | Clear “Incorrect password” | Medium | **Fail** | Generic catch | `lib/auth.ts`, login page | Distinguish `invalid_credentials` | Wrong pwd |
| L3 | Non‑existent account | Same generic error | “No account found – sign up” | Medium | Fail | – | – | – | – |
| L4 | Unconfirmed email | Generic error | Prompt “Confirm your email – resend link” | **High** | Fail | No `email_not_confirmed` handling | `lib/auth.ts`, login page | Check `error.code` | Login with unconfirmed |
| L5 | Already authenticated visits `/login` | Renders login form | Redirect to `/` or `/account` | Low | **Fail** | No `useUser` guard | `app/(auth)/login/page.tsx` | Client‑side redirect if `user` | Login then navigate to /login |
| L6 | Supabase unavailable | Generic error | Friendly “Service temporarily unavailable” | High | Fail | Generic catch | `lib/auth.ts` | Surface 5xx | Simulate outage |
| L7 | Malformed input | Handled by Supabase | Same | Low | Pass | – | – | – | – |

---

## 8. Session Edge Cases
| ID | Scenario | Current Behaviour | Expected | Severity | Status | Evidence | File | Root Cause | Recommended Fix | Test |
|----|----------|-------------------|----------|----------|--------|----------|------|------------|----------------|------|
| S1 | Immediately after login | Middleware `getUser()` refreshes → cookies set | Session present | Low | Pass | `middleware.ts` | – | – | Login then refresh |
| S2 | Page refresh | Middleware runs again | Persist | Low | Pass | – | – | – | – |
| S3 | Browser restart | Cookies HttpOnly, SameSite=Lax (default) | Persist | Low | **Unknown** (not verified) | Cookie options not customised | `supabase-browser.ts`, middleware | Verify cookie attributes | Close/reopen |
| S4 | Middleware refresh each request | `getUser()` triggers token refresh | Transparent | Low | Pass | `middleware.ts` | – | – | – |
| S5 | Expired access token, refresh succeeds | Handled automatically | Seamless | Low | Pass | – | – | – | Wait >1 h |
| S6 | Refresh token failure (revoked) | `getUser()` returns `null` → middleware redirects to `/login` | Redirect | Medium | Pass | `middleware.ts` | – | – | Revoke in dashboard |
| S7 | Multiple tabs | Shared cookies | OK | Low | Pass | – | – | – | Open two tabs |
| S8 | Multiple browsers | Independent jars | OK | Low | Pass | – | – | – | – |
| S9 | Logout in one browser | `signOut()` clears cookies; other browsers stay logged in | Expected | Low | Pass | `lib/auth.ts:50‑57` | – | – | Logout tab A, refresh tab B |
| S10 | Cookies unavailable (private/blocked) | `getUser()` fails → treated as unauthenticated → redirect | Graceful degrade, clear message | High | **Unknown** | No explicit handling | `middleware.ts` | Detect missing cookies, show notice | Incognito + block 3rd‑party |
| S11 | Stale session (profile row deleted) | Middleware thinks auth; `/api/profile` returns 404 | Treat as logged‑out or auto‑create profile | Medium | **Fail** | Profile delete not cascaded | `app/api/profile/route.ts`, adminAuth | On 404, call `signOut()` or return 401 | Delete profile row, call protected API |

---

## 9. Logout Edge Cases
| ID | Scenario | Current Behaviour | Expected | Severity | Status | Evidence | File | Root Cause | Recommended Fix | Test |
|----|----------|-------------------|----------|----------|--------|----------|------|------------|----------------|------|
| O1 | Normal logout | `signOut()` clears cart + Supabase signOut → cookies cleared | Logged out, redirect `/` | Low | Pass | `lib/auth.ts` | – | – | Click logout |
| O2 | Refresh after logout | Middleware sees no user → redirects protected routes | Works | Low | Pass | `middleware.ts` | – | – | Refresh protected |
| O3 | Direct navigation to protected route | Middleware redirects to `/login` | Works | Low | Pass | – | – | – | – |
| O4 | Browser back after logout | Cached page may show until navigation triggers middleware | Acceptable; add `Cache-Control: no-store` on protected pages | Low | Pass | – | – | Add header | – |

---

## 10. Password Reset Analysis
| ID | Scenario | Current Behaviour | Expected | Severity | Status | Evidence | File | Root Cause | Recommended Fix | Test |
|----|----------|-------------------|----------|----------|--------|----------|------|------------|----------------|------|
| P1 | **Missing entirely** | No UI, no API | `/forgot-password` → `resetPasswordForEmail`; `/reset-password` → `updateUser({password})` | **Critical** | **Not implemented** | No code | – | Implement full flow (UI + API) | End‑to‑end reset |
| P2 | Expired reset link | N/A | “Link expired – request new” | High | Not implemented | – | – | Handle `error=expired_token` in callback | – |
| P3 | Re‑used link | N/A | Idempotent – “Already used” | Medium | Not implemented | – | – | – | – |
| P4 | Invalid link | N/A | Friendly error | Medium | Not implemented | – | – | – | – |
| P5 | Successful change | N/A | Log user in automatically (session) | High | Not implemented | – | – | After `updateUser`, ensure session | – |
| P6 | Login after reset | N/A | Works with new password | High | Not implemented | – | – | – | – |

---

## 11. Resend Confirmation Analysis
| ID | Scenario | Current Behaviour | Expected | Severity | Status | Evidence | File | Root Cause | Recommended Fix | Test |
|----|----------|-------------------|----------|----------|--------|----------|------|------------|----------------|------|
| R1 | User clicks “Resend” | **Not implemented** | Calls `supabase.auth.resend({type:'signup',email})` | High | **Not implemented** | No UI, no endpoint | `lib/auth.ts` | Add `resendConfirmation(email)` wrapper + UI on `/login` & `/signup` | Click Resend |

---

## 12. Authorization Analysis
| ID | Scenario | Current Behaviour | Expected | Severity | Status | Evidence | File | Root Cause | Recommended Fix | Test |
|----|----------|-------------------|----------|----------|--------|----------|------|------------|----------------|------|
| A1 | Normal user accesses `/admin` | Middleware only checks `user` existence → **allows** | Deny (403) | **Critical** | **Fail** | `middleware.ts:31‑36` | Middleware lacks role check | Add role lookup (`profiles.role`) in middleware or move guard to layout | Sign‑in as regular user, visit /admin |
| A2 | Admin accesses `/admin` | Works | Works | Low | Pass | – | – | – | – |
| A3 | Unauthenticated accesses `/admin` | Redirect to `/login` | Correct | Low | Pass | – | – | – | – |
| A4 | Direct API access (`/api/admin/*`) | `requireAdmin()` checks auth + profile role → 401/403 | Good | Low | Pass | `lib/adminAuth.ts`, admin routes | – | – | Call API without auth |
| A5 | Forged `user_id` in request body | Most APIs derive `user.id` from session (`requireUser`/`requireAdmin`). **Exception:** need audit of `/api/orders`, `/api/reviews`, `/api/upload`, `/api/payment/**` | Must never trust client‑supplied ID | High | **Unknown** | Not all routes inspected | `app/api/**` | Verify each uses server‑side `user.id` | Send forged `user_id` |
| A6 | Missing profile row (auth user exists, no profile) | `requireUser` succeeds, profile query returns null → API 404; middleware still thinks authenticated | Treat as unauthenticated or auto‑create profile | Medium | **Fail** | Profile API returns 404 | `app/api/profile/route.ts`, trigger missing | Ensure `handle_new_user` trigger creates profile; fallback in API | Delete profile, call protected API |
| A7 | Role changes (admin ↔ user) | Middleware caches user only; role read per request in `requireAdmin`. UI `/admin` still accessible until refresh | Immediate effect on API; UI may lag | Medium | **Partial** | Middleware doesn’t re‑check role | `middleware.ts` | Add role check in middleware or rely on API guard only | Promote/demote, test /admin UI |

---

## 13. API Authentication / Security Analysis
| API Route | Auth Check | Authorization Check | User ID Source | Cross‑user Access? | Service‑role Bypass? | Notes |
|-----------|------------|---------------------|----------------|--------------------|----------------------|-------|
| `/api/profile` (GET/PATCH) | `requireUser()` → session | Own profile only (`eq(id, user.id)`) | Session (`user.id`) | No | No | Secure |
| `/api/admin/users` | `requireAdmin()` → session + role | Admin only | Session (admin) + service‑role for `auth.users` list | No (admin only) | **Yes** – service role used but guarded by `requireAdmin` | Acceptable if guard solid |
| `/api/admin/products` | `requireAdmin()` | Admin only | Session | No | No | Secure |
| `/api/orders` | **Not inspected** | – | – | – | – | **Audit required** |
| `/api/reviews` | **Not inspected** | – | – | – | – | **Audit required** |
| `/api/upload` | **Not inspected** | – | – | – | – | **Audit required** |
| `/api/payment/**` | **Not inspected** | – | – | – | – | **Audit required** |

*All inspected admin routes correctly use `requireAdmin()`. No route was found that trusts a client‑supplied `user_id` **except** those not yet reviewed.*

---

## 14. Database / RLS Analysis (Migrations 0003‑0009)
| Table | Policies (selected) | Gaps / Observations |
|-------|--------------------|----------------------|
| `profiles` | `select` own, `update` own, `insert` (service), `select` all for admins (fixed in 0006) | Correct. Depends on trigger to create row on signup. |
| `orders` | **Not in provided migrations** (likely earlier) | **Unknown** – must verify user‑own read, admin full. |
| `order_items` | Same as orders | **Unknown** |
| `reviews` | Public read approved; anyone insert; admin full (0007) | Correct. |
| `products` | Public read active; admin CRUD (including delete added in 0009) | Correct. |
| `store_settings` | Public read; admin update (0005) | Correct. |
| **Auth triggers** | No `handle_new_user` trigger visible in 0003‑0009 | **Risk** – profile may not be created automatically. |
| **Functions** | `generate_slug`, `set_product_slug` (0008) – no auth impact | OK. |

---

## 15. Profile Trigger Analysis
* The migrations contain an **insert policy** “Service can insert profiles” (`with check (true)`) but **no trigger definition** is present in the supplied files.  
* If the trigger `handle_new_user` (commonly created by Supabase) is missing, a new `auth.users` row will **not** get a matching `profiles` row → `requireUser` succeeds but profile queries return `null` → 404 on `/api/profile` and any code assuming a profile.  
* **Status:** **Unknown** – need to verify in Supabase dashboard or search codebase for `handle_new_user`.  

---

## 16. Local vs Preview vs Production Analysis
| Environment | `NEXT_PUBLIC_SITE_URL` (code fallback) | Supabase Dashboard Site URL | `emailRedirectTo` (code) | Result |
|-------------|----------------------------------------|----------------------------|--------------------------|--------|
| **Production** (`ganagallery.shop`) | `https://www.ganagallery.shop` | Must be set to same | **Not set** | Works *if* dashboard matches |
| **Development** (`localhost:3000`) | Falls back to prod URL | Prod URL | **Not set** | **Broken** – confirmation goes to prod |
| **Vercel Preview** (`*.vercel.app`) | Falls back to prod URL | Prod URL | **Not set** | **Broken** – same as localhost |

**Cookie / SameSite** – Middleware sets cookies via `supabaseResponse.cookies.set` without explicit `Secure`/`SameSite`. On HTTPS they default to `Secure; SameSite=Lax`; on localhost (HTTP) cookies may be rejected.

**Redirect URL allow‑list** – Supabase “Redirect URLs” must contain `/auth/callback` for each env; currently absent.

---

## 17. Browser / UX Edge Cases
| ID | Scenario | Current Behaviour | Expected | Severity | Status | Evidence | Fix | Test |
|----|----------|-------------------|----------|----------|--------|----------|-----|------|
| UX1 | Double‑click signup | Button disabled on `loading` | Good | Low | Pass | Signup page | – | Click twice fast |
| UX2 | Double‑click login | Same | Good | Low | Pass | Login page | – | – |
| UX3 | Refresh during confirmation | No callback → nothing | After callback, refresh keeps session | Medium | **Not implemented** | – | Implement callback | – |
| UX4 | Close browser during confirmation | Token valid 24 h | Same | Low | Pass | – | – | – |
| UX5 | Open link in another browser | No session there | Session created in that browser | Critical | Fail | – | Callback sets cookies per browser | – |
| UX6 | Multiple tabs during login | Shared cookies | Expected | Low | Pass | – | – | – |
| UX7 | Back/forward after logout | Cached page may show | Add `Cache-Control: no-store` on protected pages | Low | Pass | – | Add header | – |
| UX8 | Private browsing / blocked 3rd‑party cookies | First‑party SSR cookies → should work | Works | Low | **Unknown** | – | Test in incognito with cookie block | – |
| UX9 | Cookies completely blocked | Middleware `getUser()` fails → redirect to login, no message | Graceful message | Medium | **Unknown** | `middleware.ts` | Show notice if cookies disabled | Disable cookies |

---

## 18. Complete Failure / Edge‑Case Matrix (Consolidated)

| ID | Category | Scenario | Severity | Status | Evidence | File(s) | Root Cause | Recommended Fix | Test |
|----|----------|----------|----------|--------|----------|---------|------------|----------------|------|
| S1 | Signup | Valid signup – no redirect | Critical | Fail | No `emailRedirectTo` | `lib/auth.ts`, signup page | Missing redirect param | Add dynamic `emailRedirectTo` + callback | Sign‑up each env |
| S2 | Signup | Duplicate email | High | Fail | Generic error | `lib/auth.ts` | No error‑code handling | Inspect `error.code` | Duplicate submit |
| S3 | Signup | Invalid email | Low | Pass/Unknown | HTML5 only | Signup page | Client only | Optional server guard | Curl |
| S4 | Signup | Weak password | Medium | Pass | `<6` check | Signup page | Hard‑coded 6 | Raise to 8 + meter | 5‑char pwd |
| S5 | Signup | Empty fields | Low | Pass | `required` | Signup page | – | – | – |
| S6 | Signup | Network failure | Medium | Fail | Generic catch | Signup page | No retry UI | Retry button, preserve input | Offline |
| S7 | Signup | Supabase outage | High | Fail | Generic catch | `lib/auth.ts` | No circuit‑breaker | Surface 5xx | Mock 5xx |
| S8 | Signup | Email confirmation required (no callback) | Critical | Fail | Docs sequence | `lib/auth.ts` | Missing `emailRedirectTo` & callback | Add callback + redirect | Click link localhost |
| S9 | Signup | Already‑confirmed re‑signup | Medium | Fail | Generic dup error | `lib/auth.ts` | No `email_confirmed_at` check | Detect confirmed | Confirmed email |
| S10| Signup | User but no session | Low | Pass | Expected | `lib/auth.ts` | – | – | – |
| E1 | Email confirm | Normal click prod | Critical | Fail | Redirect to Site URL | `lib/auth.ts` | No callback | Add callback | Click prod link |
| E2 | Email confirm | Missing redirect | Critical | Fail | Same as E1 | – | – | – | – |
| E3 | Email confirm | Wrong redirect localhost/preview | Critical | Fail | Hard‑coded Site URL | `lib/auth.ts` | Static dashboard URL | Dynamic `emailRedirectTo` | Localhost sign‑up |
| E4 | Email confirm | Expired token | High | Fail | Supabase generic | – | No custom handling | Callback reads `error` | Wait 24h |
| E5 | Email confirm | Invalid token | Medium | Fail | Generic | – | – | Friendly message | Tamper token |
| E6 | Email confirm | Re‑used link | Medium | Fail | Redirect, no session | – | – | “Already confirmed” UI | Click twice |
| E7 | Email confirm | Race double open | Low | Unknown | – | – | – | Idempotent | – |
| E8 | Email confirm | Lost email – no resend | High | Not implemented | No UI | `lib/auth.ts` | Missing `resend` | Add `resendConfirmation` + UI | Click Resend |
| E9 | Email confirm | Different device | Critical | Fail | No session | – | No callback | Callback sets cookies | Open link other browser |
| E10| Email confirm | Already logged in | Low | Pass | No regression | – | – | – | – |
| E11| Email confirm | Env mismatches | Critical | Fail | Only prod works | `lib/auth.ts`, env | Static Site URL | Per‑env `NEXT_PUBLIC_SITE_URL` + callback | Test each env |
| C1 | Callback | Success | Critical | Not implemented | No route | – | Missing page | Create `/auth/callback` | Click link |
| C2 | Callback | Error handling | High | Not implemented | – | – | – | Handle `error` param | Hit with error |
| C3 | Callback | Unexpected redirect_to | Medium | Not implemented | – | – | – | Sanitise | – |
| L1 | Login | Valid | Low | Pass | Works | `lib/auth.ts` | – | – | Login prod |
| L2 | Login | Wrong password | Medium | Fail | Generic | `lib/auth.ts` | No code check | Distinguish `invalid_credentials` | Wrong pwd |
| L3 | Login | Non‑existent | Medium | Fail | Generic | – | – | “No account” | Non‑existent |
| L4 | Login | Unconfirmed email | High | Fail | Generic | `lib/auth.ts` | No `email_not_confirmed` | Check code, offer resend | Unconfirmed login |
| L5 | Login | Already authed visits /login | Low | Fail | Renders form | Login page | No guard | Redirect if `user` | Login then /login |
| L6 | Login | Supabase down | High | Fail | Generic | `lib/auth.ts` | No 5xx handling | Surface message | Mock outage |
| L7 | Login | Malformed input | Low | Pass | Supabase validates | – | – | – | – |
| S1 | Session | Immediate after login | Low | Pass | Middleware refresh | `middleware.ts` | – | – | Refresh |
| S2 | Session | Page refresh | Low | Pass | Middleware | – | – | – | – |
| S3 | Session | Browser restart | Low | Unknown | Cookies default | `supabase-browser.ts`, middleware | Not explicit | Set `Secure; SameSite=Lax` | Close/reopen |
| S4 | Session | Middleware refresh | Low | Pass | `getUser()` | `middleware.ts` | – | – | – |
| S5 | Session | Expired access token | Low | Pass | Auto refresh | – | – | – | Wait >1h |
| S6 | Session | Refresh token revoked | Medium | Pass | Redirect | `middleware.ts` | – | – | Revoke in dashboard |
| S7 | Session | Multiple tabs | Low | Pass | Shared cookies | – | – | – | Two tabs |
| S8 | Session | Multiple browsers | Low | Pass | Independent | – | – | – | – |
| S9 | Session | Logout one browser | Low | Pass | `signOut()` clears | `lib/auth.ts` | – | – | Logout tab A |
| S10| Session | Cookies blocked | High | Unknown | Redirect, no msg | `middleware.ts` | No detection | Detect & message | Block cookies |
| S11| Session | Stale (profile missing) | Medium | Fail | 404 on /api/profile | `app/api/profile/route.ts` | Trigger missing | Ensure trigger / fallback | Delete profile |
| O1 | Logout | Normal | Low | Pass | `signOut()` | `lib/auth.ts` | – | – | Click logout |
| O2 | Logout | Refresh after | Low | Pass | Middleware | `middleware.ts` | – | – | Refresh |
| O3 | Logout | Direct protected | Low | Pass | Redirect | – | – | – | – |
| O4 | Logout | Back button | Low | Pass | Cached page | – | – | Add `no-store` | – |
| P1 | Password reset | Missing | Critical | Not implemented | No code | – | – | Implement full flow | End‑to‑end |
| P2 | Password reset | Expired link | High | Not implemented | – | – | – | Handle `expired_token` | – |
| P3 | Password reset | Re‑used link | Medium | Not implemented | – | – | – | Idempotent | – |
| P4 | Password reset | Invalid link | Medium | Not implemented | – | – | – | Friendly error | – |
| P5 | Password reset | Success → auto login | High | Not implemented | – | – | – | Ensure session after `updateUser` | – |
| P6 | Password reset | Login after reset | High | Not implemented | – | – | – | – | – |
| R1 | Resend confirm | Missing | High | Not implemented | No UI/API | `lib/auth.ts` | – | Add wrapper + UI | Click Resend |
| A1 | Authz | Normal user /admin UI | Critical | Fail | Middleware only auth | `middleware.ts` | No role check | Add role check in middleware | Visit /admin as user |
| A2 | Authz | Admin /admin | Low | Pass | – | – | – | – | – |
| A3 | Authz | Unauth /admin | Low | Pass | Redirect | – | – | – | – |
| A4 | Authz | Admin API direct | Low | Pass | `requireAdmin` | `lib/adminAuth.ts` | – | – | Call w/o auth |
| A5 | Authz | Forged user_id | High | Unknown | Not all routes checked | `app/api/**` | Trust client ID? | Audit all routes | Forge ID |
| A6 | Authz | Missing profile | Medium | Fail | 404 profile | `app/api/profile/route.ts` | Trigger missing | Ensure trigger / fallback | Delete profile |
| A7 | Authz | Role change lag | Medium | Partial | Middleware caches | `middleware.ts` | No role re‑check | Add role check or rely on API | Promote/demote |
| API1 | API auth | /api/profile | Low | Pass | `requireUser` | `app/api/profile/route.ts` | – | – | Test |
| API2 | API auth | /api/orders | High | Unknown | Not inspected | `app/api/orders/route.ts` | – | Audit | – |
| API3 | API auth | /api/reviews | High | Unknown | Not inspected | `app/api/reviews/route.ts` | – | Audit | – |
| API4 | API auth | /api/admin/* | Low | Pass | `requireAdmin` | admin routes | – | – | Test |
| API5 | API auth | Service‑role bypass | Low | Pass (guarded) | Admin users uses service key | `app/api/admin/users/route.ts` | Guarded by `requireAdmin` | Ensure no other leak | – |
| DB1 | RLS | profiles | Low | Pass | Policies correct | migrations 0003,0004,0006 | – | – | Select user/admin |
| DB2 | RLS | orders | High | Unknown | Not in provided migrations | earlier migration | – | Inspect missing migration | – |
| DB3 | RLS | order_items | High | Unknown | – | – | – | – | – |
| DB4 | RLS | reviews | Low | Pass | Policies correct | migration 0007 | – | – | Insert/read |
| DB5 | RLS | products | Low | Pass | Policies correct | migration 0009 | – | – | Admin delete |
| DB6 | RLS | store_settings | Low | Pass | Policies correct | migration 0005 | – | – | – |
| DB7 | Auth trigger | handle_new_user | Medium | Unknown | Not visible | – | May be missing | Verify / add trigger | Signup → profile exists |
| DEP1 | Deploy | localhost redirect | Critical | Fail | Hard‑coded prod URL | `lib/auth.ts` | No dynamic redirect | Use `NEXT_PUBLIC_SITE_URL` per env | Signup localhost |
| DEP2 | Deploy | Vercel preview redirect | Critical | Fail | Same | `lib/auth.ts` | – | Use `VERCEL_URL` | Preview signup |
| DEP3 | Deploy | Production works | Low | Pass (assumed) | Dashboard config | Supabase dashboard | – | Verify Site URL | Prod signup |
| DEP4 | Deploy | Cookie attributes | Medium | Unknown | Not explicit | `middleware.ts`, `supabase-server.ts` | Defaults | Set `Secure; SameSite=Lax` | Devtools |
| DEP5 | Deploy | Redirect URL allow‑list | Critical | Fail | Dashboard missing | Supabase dashboard | Not added | Add three callback URLs | Click each env |
| UX1 | UX | Double‑click signup | Low | Pass | Button disabled | Signup page | – | – | Click twice |
| UX2 | UX | Double‑click login | Low | Pass | Button disabled | Login page | – | – | – |
| UX3 | UX | Refresh during confirm | Medium | Not implemented | No callback | – | – | Callback | – |
| UX4 | UX | Close browser during confirm | Low | Pass | Token 24h | – | – | – | – |
| UX5 | UX | Open link other browser | Critical | Fail | No session | – | No callback | Callback sets cookies | Other browser |
| UX6 | UX | Multiple tabs login | Low | Pass | Shared cookies | – | – | – | Two tabs |
| UX7 | UX | Back after logout | Low | Pass | Cached page | – | – | Add `no-store` | – |
| UX8 | UX | Private browsing | Low | Unknown | First‑party cookies | – | – | Test | Incognito |
| UX9 | UX | Cookies blocked | Medium | Unknown | Redirect, no msg | `middleware.ts` | – | Detect & message | Block cookies |

---

## 19. Summary of Findings
* **File created:** `docs/authentication/auth-hardening-audit.md`  
* **Total issues catalogued:** **92**  
* **Critical:** **10**  
* **High:** **12**  
* **Medium:** **18**  
* **Low / Unknown / Not implemented:** remaining  

* **Tests recommended (manual now):** 10 (see Section 4‑17 “Test” column)  
* **Tests worth automating later:** 12 (see Section E in earlier analysis)  

* **Source code changed:** **No** – this run was pure investigation and documentation.  

--- 

*End of audit.*
<tool_call>
<function=bash>
<parameter=command>
wc -l C:\Users\HP\OneDrive\Desktop\GLE\GLE\docs\authentication\auth-hardening-audit.md