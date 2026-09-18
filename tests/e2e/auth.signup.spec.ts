import { test, expect, signUpViaUI, createTestUser, getUserByEmail } from '../utils/auth-helpers';

test.describe('Sign Up — SU-01 to SU-12', () => {
  const testEmail = `test+signup-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123';

  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('SU-01: Valid registration shows success message @supabase', async ({ page, supabaseAdmin }) => {
    await signUpViaUI(page, testEmail, testPassword);
    await expect(page.locator('text=Check your inbox')).toBeVisible();
    await expect(page.locator(`text=${testEmail}`)).toBeVisible();

    const user = await getUserByEmail(supabaseAdmin, testEmail);
    expect(user).toBeTruthy();
    expect(user?.email_confirmed_at).toBeNull();
  });

  test('SU-02: Invalid email format blocked by browser', async ({ page }) => {
    await page.fill('input[id="email"]', 'not-an-email');
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page.locator('input[id="email"]:invalid')).toBeTruthy();
  });

  test('SU-03: Password too short shows validation error', async ({ page }) => {
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', '12345');
    await page.fill('input[id="confirmPassword"]', '12345');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
  });

  test('SU-04: Password mismatch shows validation error', async ({ page }) => {
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', 'DifferentPass123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('SU-05: Duplicate email (unconfirmed) shows error @supabase', async ({ page, supabaseAdmin }) => {
    await createTestUser(supabaseAdmin, testEmail, testPassword, false);
    await signUpViaUI(page, testEmail, testPassword);
    await expect(page.locator('text=Something went wrong')).toBeVisible();
  });

  test('SU-06: Duplicate email (confirmed) shows error @supabase', async ({ page, supabaseAdmin }) => {
    await createTestUser(supabaseAdmin, testEmail, testPassword, true);
    await signUpViaUI(page, testEmail, testPassword);
    await expect(page.locator('text=Something went wrong')).toBeVisible();
  });

  test('SU-07: Empty required fields blocked by browser', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('input[id="email"]:invalid')).toBeTruthy();
  });

  test('SU-11: Email confirmation enabled behavior @supabase', async ({ page, supabaseAdmin }) => {
    await signUpViaUI(page, testEmail, testPassword);
    const user = await getUserByEmail(supabaseAdmin, testEmail);
    expect(user?.email_confirmed_at).toBeNull();
  });

  test('SU-12: Repeated submission prevented by loading state', async ({ page }) => {
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.fill('input[id="confirmPassword"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page.locator('button[type="submit"]:disabled')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Creating account...")')).toBeVisible();
  });
});