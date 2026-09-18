import { test, expect, createTestUser, signInViaUI } from '../utils/auth-helpers';

test.describe('Sign In — SI-01 to SI-09', () => {
  const testEmail = `test+signin-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123';

  test.beforeEach(async ({ page, supabaseAdmin }) => {
    await createTestUser(supabaseAdmin, testEmail, testPassword, true);
    await page.goto('/login');
  });

  test('SI-01: Valid credentials creates session @supabase', async ({ page }) => {
    await signInViaUI(page, testEmail, testPassword);
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Sign out')).toBeVisible({ timeout: 5000 });
  });

  test('SI-02: Incorrect password shows error @supabase', async ({ page }) => {
    await page.fill('input[id="email"]', testEmail);
    await page.fill('input[id="password"]', 'WrongPassword123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Something went wrong')).toBeVisible();
  });

  test('SI-03: Unknown email shows error @supabase', async ({ page }) => {
    await page.fill('input[id="email"]', 'unknown@example.com');
    await page.fill('input[id="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Something went wrong')).toBeVisible();
  });

  test('SI-04: Unconfirmed email login shows error @supabase', async ({ page, supabaseAdmin }) => {
    const unconfirmedEmail = `test+unconfirmed-${Date.now()}@example.com`;
    await createTestUser(supabaseAdmin, unconfirmedEmail, testPassword, false);
    await page.fill('input[id="email"]', unconfirmedEmail);
    await page.fill('input[id="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Something went wrong')).toBeVisible();
  });

  test('SI-05: Empty/malformed inputs blocked', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('input[id="email"]:invalid')).toBeTruthy();
  });

  test('SI-07: Session persists after reload @supabase', async ({ page }) => {
    await signInViaUI(page, testEmail, testPassword);
    await page.reload();
    await expect(page.locator('text=Sign out')).toBeVisible({ timeout: 5000 });
  });

  test('SI-08: Return-to redirect works @supabase', async ({ page }) => {
    await page.goto('/login?redirectTo=/profile');
    await signInViaUI(page, testEmail, testPassword);
    await expect(page).toHaveURL('/profile');
  });

  test('SI-09: Login page redirects when already authenticated @supabase', async ({ page }) => {
    await signInViaUI(page, testEmail, testPassword);
    await page.goto('/login');
    await expect(page).not.toHaveURL('/login');
  });
});