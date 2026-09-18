import { test, expect, createTestUser, signInViaUI, signOutViaUI } from '../utils/auth-helpers';

test.describe('Session & Authorization — SA-01 to SA-12', () => {
  const testEmail = `test+session-${Date.now()}@example.com`;
  const testPassword = 'SecurePass123';

  test('SA-01: Protected routes redirect to login when signed out', async ({ page }) => {
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
    
    await page.goto('/orders');
    await expect(page).toHaveURL(/\/login/);
    
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/login/);
    
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('SA-02: Protected routes accessible when signed in @supabase', async ({ page, supabaseAdmin }) => {
    await createTestUser(supabaseAdmin, testEmail, testPassword, true);
    await signInViaUI(page, testEmail, testPassword);
    
    await page.goto('/profile');
    await expect(page.locator('text=My profile')).toBeVisible({ timeout: 10000 });
    
    await page.goto('/orders');
    await expect(page.locator('text=Order history')).toBeVisible({ timeout: 10000 });
  });

  test('SA-03: Direct navigation to protected URLs works @supabase', async ({ page, supabaseAdmin }) => {
    await createTestUser(supabaseAdmin, testEmail, testPassword, true);
    await signInViaUI(page, testEmail, testPassword);
    
    await page.goto('/profile');
    await expect(page.locator('text=My profile')).toBeVisible();
    
    await page.goto('/orders');
    await expect(page.locator('text=Order history')).toBeVisible();
  });

  test('SA-04: Expired/invalid session redirects to login @supabase', async ({ page, supabaseAdmin }) => {
    await createTestUser(supabaseAdmin, testEmail, testPassword, true);
    await signInViaUI(page, testEmail, testPassword);
    
    await page.context().clearCookies();
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('SA-05: Logout followed by protected route redirects @supabase', async ({ page, supabaseAdmin }) => {
    await createTestUser(supabaseAdmin, testEmail, testPassword, true);
    await signInViaUI(page, testEmail, testPassword);
    await signOutViaUI(page);
    
    await page.goto('/profile');
    await expect(page).toHaveURL(/\/login/);
  });

  test('SA-06: Admin API returns 403 for regular user @supabase', async ({ page, supabaseAdmin }) => {
    await createTestUser(supabaseAdmin, testEmail, testPassword, true);
    await signInViaUI(page, testEmail, testPassword);
    
    const response = await page.request.get('/api/admin/users');
    expect(response.status()).toBe(403);
  });

  test('SA-07: User cannot access other user records @supabase', async ({ page, supabaseAdmin }) => {
    const userA = `test+usera-${Date.now()}@example.com`;
    const userB = `test+userb-${Date.now()}@example.com`;
    
    await createTestUser(supabaseAdmin, userA, testPassword, true);
    await createTestUser(supabaseAdmin, userB, testPassword, true);
    
    await signInViaUI(page, userA, testPassword);
    const response = await page.request.get('/api/orders');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.data).toEqual([]);
  });

  test('SA-10: Non-admin user cannot access /admin UI @supabase', async ({ page, supabaseAdmin }) => {
    await createTestUser(supabaseAdmin, testEmail, testPassword, true);
    await signInViaUI(page, testEmail, testPassword);
    
    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/admin/);
    await expect(page.locator('text=TheGanaGallery')).toBeVisible();
  });

  test('SA-11: Admin API returns 403 for non-admin @supabase', async ({ page, supabaseAdmin }) => {
    await createTestUser(supabaseAdmin, testEmail, testPassword, true);
    await signInViaUI(page, testEmail, testPassword);
    
    const response = await page.request.get('/api/admin/products');
    expect(response.status()).toBe(403);
  });
});