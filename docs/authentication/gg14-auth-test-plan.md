# GLE Store — Authentication GG14 Test Plan

**Generated:** 2026-09-17  
**Branch:** `audit/authentication-gg14`  
**Scope:** Comprehensive test cases for authentication flows. Tests marked with 🔐 require dedicated Supabase test project.

---

## Test Environment Requirements

| Requirement | Local Dev | CI/Preview | Production |
|-------------|-----------|------------|------------|
| Supabase Project | Local or dedicated test project | Dedicated test project | Production project |
| `NEXT_PUBLIC_SUPABASE_URL` | `http://localhost:54321` (local) or test project | Test project URL | Production URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Test anon key | Test anon key | Production anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Test service key | Test service key | Production service key |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://<preview>.vercel.app` | `https://www.ganagallery.shop` |
| Email confirmation | Supabase local email (Inbucket) or test project | Test project email | Production email |
| Redirect URLs in Dashboard | `http://localhost:3000/auth/callback` | `https://<preview>.vercel.app/auth/callback` | `https://www.ganagallery.shop/auth/callback` |

**Execution Rule:** Tests requiring Supabase credentials MUST clearly skip or report as BLOCKED when credentials unavailable. Never silently claim they passed.

---

## Test Case Format

Each test case includes:
- **ID**: Unique identifier
- **Preconditions**: Required state before test
- **Steps**: Exact actions to perform
- **Expected Result**: Observable outcome
- **Execution Status**: PASS / FAIL / BLOCKED / NOT RUN
- **Evidence**: Screenshot, log, or assertion detail
- **Requires Test Project**: 🔐 Yes / No

---

## 1. Sign-Up Tests

### SU-01: Valid Registration
- **ID:** SU-01
- **Preconditions:** Clean browser state; test Supabase project running; `/auth/callback` route exists (after fix)
- **Steps:**
  1. Navigate to `/signup`
  2. Enter valid email `test+su01@example.com`
  3. Enter password `SecurePass123` (confirm same)
  4. Click "Create account"
  5. Wait for success message
  6. Click confirmation email link (or visit `/auth/callback?code=...` directly)
- **Expected Result:** 
  - Step 5: "Check your inbox" message shown
  - Step 6: Session established, redirected to `/` or `/profile`
  - `auth.users` row created with `email_confirmed_at` set
  - `profiles` row created with `role='customer'`
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SU-02: Invalid Email Format
- **ID:** SU-02
- **Preconditions:** Clean browser state
- **Steps:**
  1. Navigate to `/signup`
  2. Enter `not-an-email`
  3. Enter valid password
  4. Click "Create account"
- **Expected Result:** Browser HTML5 validation blocks submit (type="email")
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

### SU-03: Password Too Short (< 6 chars currently, < 8 after fix)
- **ID:** SU-03
- **Preconditions:** Clean browser state
- **Steps:**
  1. Navigate to `/signup`
  2. Enter valid email
  3. Enter password `12345` (5 chars)
  4. Click "Create account"
- **Expected Result:** Client-side validation shows "Password must be at least 6 characters" (current) or "at least 8" (after fix)
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

### SU-04: Password Mismatch
- **ID:** SU-04
- **Preconditions:** Clean browser state
- **Steps:**
  1. Navigate to `/signup`
  2. Enter valid email
  3. Enter password `SecurePass123`
  4. Enter confirm password `DifferentPass123`
  5. Click "Create account"
- **Expected Result:** Client-side validation shows "Passwords do not match"
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

### SU-05: Duplicate Email (Unconfirmed)
- **ID:** SU-05
- **Preconditions:** User `test+su05@example.com` exists but unconfirmed
- **Steps:**
  1. Navigate to `/signup`
  2. Enter same email
  4. Enter valid password
  5. Click "Create account"
- **Expected Result:** 
  - Current: Generic "Something went wrong"
  - After fix: "Email already registered — try login or resend confirmation"
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SU-06: Duplicate Email (Confirmed)
- **ID:** SU-06
- **Preconditions:** User `test+su06@example.com` exists and confirmed
- **Steps:** Same as SU-05
- **Expected Result:** 
  - Current: Generic "Something went wrong"
  - After fix: "Account exists — please sign in"
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SU-07: Empty Required Fields
- **ID:** SU-07
- **Preconditions:** Clean browser state
- **Steps:**
  1. Navigate to `/signup`
  2. Leave all fields empty
  3. Click "Create account"
- **Expected Result:** HTML5 `required` attribute blocks submit
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

### SU-08: Network Failure During Signup
- **ID:** SU-08
- **Preconditions:** Clean browser state; network throttled to offline
- **Steps:**
  1. Navigate to `/signup`
  2. Enter valid credentials
  3. Click "Create account"
  4. Observe error handling
- **Expected Result:** 
  - Current: Generic "Something went wrong", no retry button
  - After fix: Friendly error with "Retry" button preserving input
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No (can simulate offline)

### SU-09: Supabase API Error (5xx)
- **ID:** SU-09
- **Preconditions:** Clean browser state; mock Supabase to return 500
- **Steps:** Attempt signup
- **Expected Result:** Friendly "Service temporarily unavailable" message
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No (can mock)

### SU-10: Redirect Validation (Unsafe redirectTo)
- **ID:** SU-10
- **Preconditions:** Clean browser state; `redirectTo` param supported (future)
- **Steps:**
  1. Navigate to `/signup?redirectTo=https://evil.com`
  2. Complete signup
  3. Observe redirect
- **Expected Result:** Redirect ignored or validated against allow-list; lands on `/login` or `/`
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

### SU-11: Email Confirmation Enabled/Disabled Behavior
- **ID:** SU-11
- **Preconditions:** Test Supabase project with email confirmation ON vs OFF
- **Steps:** Sign up in both configurations
- **Expected Result:** 
  - Confirmation ON: Email sent, session only after callback
  - Confirmation OFF: Session created immediately, no email
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SU-12: Repeated Submission (Double-click)
- **ID:** SU-12
- **Preconditions:** Clean browser state
- **Steps:**
  1. Navigate to `/signup`
  2. Enter valid credentials
  3. Rapidly click "Create account" twice
- **Expected Result:** Button disabled on first click (`loading` state); only one request sent
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

---

## 2. Sign-In Tests

### SI-01: Valid Credentials
- **ID:** SI-01
- **Preconditions:** Confirmed user exists (`test+si01@example.com` / `SecurePass123`)
- **Steps:**
  1. Navigate to `/login`
  2. Enter credentials
  3. Click "Sign in"
- **Expected Result:** Session established, redirected to `/` (or `redirectTo` after fix)
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SI-02: Incorrect Password
- **ID:** SI-02
- **Preconditions:** Confirmed user exists
- **Steps:**
  1. Navigate to `/login`
  2. Enter correct email, wrong password
  3. Click "Sign in"
- **Expected Result:** 
  - Current: Generic "Something went wrong"
  - After fix: "Incorrect password"
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SI-03: Unknown Email
- **ID:** SI-03
- **Preconditions:** No user with `unknown@example.com`
- **Steps:** Attempt login with unknown email
- **Expected Result:** 
  - Current: Generic error
  - After fix: "No account found — sign up"
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SI-04: Unconfirmed Email Login
- **ID:** SI-04
- **Preconditions:** User exists but `email_confirmed_at` is NULL
- **Steps:** Attempt login
- **Expected Result:** 
  - Current: Generic error
  - After fix: "Please confirm your email — [Resend link]"
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SI-05: Empty/Malformed Inputs
- **ID:** SI-05
- **Preconditions:** Clean browser state
- **Steps:** Submit empty form; submit malformed email
- **Expected Result:** HTML5 validation blocks; Supabase validates server-side
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

### SI-06: Rate Limiting / Abuse Controls
- **ID:** SI-06
- **Preconditions:** Test Supabase project with rate limiting configured
- **Steps:** Rapid failed login attempts (10+)
- **Expected Result:** Temporary lockout or challenge (Supabase default) OR custom rate limit response
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SI-07: Session Persistence After Reload
- **ID:** SI-07
- **Preconditions:** Signed in as valid user
- **Steps:**
  1. Sign in
  2. Refresh page (F5)
  3. Navigate to `/profile`
- **Expected Result:** User remains authenticated; profile loads
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SI-08: Safe Return-To Redirect
- **ID:** SI-08
- **Preconditions:** Clean browser state; `redirectTo` supported (after fix)
- **Steps:**
  1. Navigate to `/checkout` (protected)
  2. Redirected to `/login?redirectTo=/checkout`
  3. Sign in
- **Expected Result:** Redirected to `/checkout` after login
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No (can test redirect logic without Supabase)

### SI-09: Login Page When Already Authenticated
- **ID:** SI-09
- **Preconditions:** Signed in as valid user
- **Steps:** Navigate to `/login`
- **Expected Result:** 
  - Current: Login form renders
  - After fix: Redirected to `/` or `/profile`
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

---

## 3. Session & Authorization Tests

### SA-01: Protected Route While Signed Out
- **ID:** SA-01
- **Preconditions:** Clean browser state (no session)
- **Steps:**
  1. Navigate to `/profile`
  2. Navigate to `/orders`
  3. Navigate to `/checkout`
  4. Navigate to `/admin`
- **Expected Result:** All redirect to `/login` (or `/` for `/admin` via middleware)
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No (middleware runs without Supabase)

### SA-02: Protected Route While Signed In
- **ID:** SA-02
- **Preconditions:** Signed in as regular user
- **Steps:** Visit `/profile`, `/orders`, `/checkout`
- **Expected Result:** Pages load with user data
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SA-03: Direct Navigation to Protected URLs
- **ID:** SA-03
- **Preconditions:** Signed in
- **Steps:** Type `/profile` in address bar; type `/orders/123`
- **Expected Result:** Pages load (no middleware redirect loop)
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SA-04: Expired/Invalid Session
- **ID:** SA-04
- **Preconditions:** Signed in; manipulate cookie to expire or corrupt
- **Steps:**
  1. Sign in
  2. In DevTools, delete/modify `sb-*-auth-token` cookies
  3. Navigate to `/profile`
- **Expected Result:** Middleware `getUser()` returns null → redirect to `/login`
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SA-05: Logout Followed by Protected Route Access
- **ID:** SA-05
- **Preconditions:** Signed in
- **Steps:**
  1. Click "Sign out" in Navbar
  2. Navigate to `/profile`
- **Expected Result:** Redirected to `/login`
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SA-06: Server-Side Authorization Checks (API)
- **ID:** SA-06
- **Preconditions:** Signed in as regular user
- **Steps:** Call `GET /api/admin/users` directly (fetch/Postman)
- **Expected Result:** 403 Forbidden (requireAdmin check)
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SA-07: User A Accessing User B's Records
- **ID:** SA-07
- **Preconditions:** Two confirmed users (A and B) with orders
- **Steps:**
  1. Sign in as User A
  2. Call `GET /api/orders` 
  3. Attempt to access User B's order via `/api/orders/<B's-order-id>`
- **Expected Result:** Only User A's orders returned; User B's order returns 404 or empty
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SA-08: RLS Enforcement (Profiles)
- **ID:** SA-08
- **Preconditions:** Two users; direct Supabase client with user A's token
- **Steps:** Attempt `supabase.from('profiles').select().eq('id', userB_id)`
- **Expected Result:** RLS policy "Users can view own profile" blocks; returns empty
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SA-09: RLS Enforcement (Orders)
- **ID:** SA-09
- **Preconditions:** Two users with orders
- **Steps:** Direct Supabase query for other user's orders
- **Expected Result:** RLS blocks cross-user access (policy expected but not in migrations — must verify)
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SA-10: Admin Role Enforcement (Middleware)
- **ID:** SA-10
- **Preconditions:** Regular user (non-admin)
- **Steps:** Navigate to `/admin`
- **Expected Result:** 
  - Current: Middleware passes, layout redirects to `/`
  - After fix: Middleware redirects to `/login` or `/`
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SA-11: Admin Role Enforcement (API)
- **ID:** SA-11
- **Preconditions:** Regular user
- **Steps:** Call `GET /api/admin/products`
- **Expected Result:** 403 Forbidden
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### SA-12: Missing Profile Row Handling
- **ID:** SA-12
- **Preconditions:** Authenticated user with NO `profiles` row (delete via SQL)
- **Steps:** Call `GET /api/profile`
- **Expected Result:** 
  - Current: 404 "Profile not found"
  - After fix: Auto-create profile or 401
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

---

## 4. Recovery & Callback Flow Tests

### RC-01: Password Reset Request
- **ID:** RC-01
- **Preconditions:** `/forgot-password` page exists (after fix); confirmed user exists
- **Steps:**
  1. Navigate to `/forgot-password`
  2. Enter user's email
  3. Submit
  4. Check email for reset link
- **Expected Result:** Reset email sent with link to `/reset-password?code=...`
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### RC-02: Invalid/Expired Recovery Link
- **ID:** RC-02
- **Preconditions:** Reset link > 24h old or tampered
- **Steps:** Visit `/reset-password?code=expired_or_invalid`
- **Expected Result:** Friendly "Link expired — request new reset email" with link to `/forgot-password`
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### RC-03: Successful Password Update
- **ID:** RC-03
- **Preconditions:** Valid reset code from RC-01
- **Steps:**
  1. Visit `/reset-password?code=valid`
  2. Enter new password `NewSecurePass456` (confirm)
  3. Submit
- **Expected Result:** Password updated; session established; redirected to `/profile`
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### RC-04: Callback Error Handling
- **ID:** RC-04
- **Preconditions:** `/auth/callback` route exists (after fix)
- **Steps:** Visit `/auth/callback?error=expired_token` and `/auth/callback?error=invalid_token`
- **Expected Result:** Friendly error page with actionable guidance (resend, retry)
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No (can test route directly)

### RC-05: Unsafe Redirect Parameters in Callback
- **ID:** RC-05
- **Preconditions:** `/auth/callback` route exists
- **Steps:** Visit `/auth/callback?code=valid&redirect_to=https://evil.com`
- **Expected Result:** `redirect_to` ignored or validated; redirect to safe default (`/`)
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

### RC-06: Email Confirmation Callback (Success)
- **ID:** RC-06
- **Preconditions:** `/auth/callback` route exists; unconfirmed user; valid code
- **Steps:** Visit `/auth/callback?code=valid_confirmation_code`
- **Expected Result:** Session created; redirected to `/` or `/profile`
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### RC-07: Resend Confirmation Email
- **ID:** RC-07
- **Preconditions:** Unconfirmed user exists; "Resend" button implemented (after fix)
- **Steps:**
  1. Navigate to `/login` or signup success page
  2. Click "Resend confirmation"
  3. Check email
- **Expected Result:** New confirmation email sent; link works
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

---

## 5. UX & Reliability Tests

### UX-01: Validation Messages Display Correctly
- **ID:** UX-01
- **Preconditions:** Clean browser state
- **Steps:** Trigger each validation error (empty, mismatch, short, duplicate, wrong password, unconfirmed)
- **Expected Result:** Clear, actionable message per error type (after fix)
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes (for server errors)

### UX-02: Loading States During Auth Requests
- **ID:** UX-02
- **Preconditions:** Clean browser state
- **Steps:** Submit signup/login; observe button state
- **Expected Result:** Button shows "Creating account..." / "Signing in..." and disabled; spinner if applicable
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

### UX-03: Keyboard Navigation & Form Usability
- **ID:** UX-03
- **Preconditions:** Clean browser state
- **Steps:** Tab through signup/login forms; submit with Enter key
- **Expected Result:** Logical tab order; Enter submits form; labels associated with inputs
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

### UX-04: Network Failure Handling
- **ID:** UX-04
- **Preconditions:** Clean browser state; network offline
- **Steps:** Attempt signup/login
- **Expected Result:** Friendly error; retry option; input preserved
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

### UX-05: Browser Refresh & Navigation
- **ID:** UX-05
- **Preconditions:** Signed in
- **Steps:** 
  1. Refresh page (F5)
  2. Back/forward navigation
  3. Close/reopen tab
- **Expected Result:** Session persists; no auth flicker
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### UX-06: Console Errors & Failed Requests
- **ID:** UX-06
- **Preconditions:** DevTools Console open
- **Steps:** Perform all auth flows; observe console
- **Expected Result:** No unhandled errors; no 4xx/5xx from auth endpoints (except expected validation)
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### UX-07: Private Browsing / Blocked Third-Party Cookies
- **ID:** UX-07
- **Preconditions:** Incognito mode with "Block third-party cookies" enabled
- **Steps:** Sign up and sign in
- **Expected Result:** First-party SSR cookies work; session established
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** 🔐 Yes

### UX-08: Cookies Completely Blocked
- **ID:** UX-08
- **Preconditions:** Browser set to block all cookies
- **Steps:** Attempt sign in
- **Expected Result:** 
  - Current: Silent redirect to `/login` (middleware `getUser()` fails)
  - After fix: Graceful message "Cookies required for authentication"
- **Execution Status:** NOT RUN
- **Evidence:** 
- **Requires Test Project:** No

---

## 6. Test Execution Matrix

| Test Category | Total Cases | Local (No Supabase) | Requires Test Project 🔐 |
|---------------|-------------|---------------------|--------------------------|
| Sign-Up | 12 | 6 | 6 |
| Sign-In | 9 | 2 | 7 |
| Session & Authz | 12 | 1 | 11 |
| Recovery & Callback | 7 | 2 | 5 |
| UX & Reliability | 8 | 4 | 4 |
| **Total** | **48** | **15** | **33** |

---

## 7. Playwright Test Organization

```
tests/
├── e2e/
│   ├── auth.signup.spec.ts      # SU-01 through SU-12
│   ├── auth.signin.spec.ts      # SI-01 through SI-09
│   ├── auth.session.spec.ts     # SA-01 through SA-12
│   ├── auth.recovery.spec.ts    # RC-01 through RC-07
│   └── auth.ux.spec.ts          # UX-01 through UX-08
├── fixtures/
│   └── test-users.ts            # Synthetic test account helpers
├── utils/
│   ├── supabase-helpers.ts      # Direct Supabase admin calls for setup/teardown
│   └── auth-helpers.ts          # Page object helpers
└── auth.setup.ts                # Global setup (create test users)
```

**Selectors Strategy:** Use stable `data-testid` attributes where possible; fall back to accessible roles (`role="button"`, `role="textbox"`) and form field labels.

---

## 8. CI/CD Integration

| Pipeline Stage | Tests Run | Condition |
|----------------|-----------|-----------|
| PR Validation | Local-only tests (15) | Always |
| Nightly / Scheduled | Full suite (48) | Test project credentials available |
| Pre-Production | Full suite (48) | Test project credentials available |

**Artifact Collection:** Screenshots on failure, trace.zip, console logs, network HAR.

---

*End of test plan. Tests not yet executed.*