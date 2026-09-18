import { test, expect } from '../utils/auth-helpers';

test.describe('UX & Reliability — UX-01 to UX-08', () => {
  test('UX-02: Loading states during auth requests', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[id="email"]', `test+ux-${Date.now()}@example.com`);
    await page.fill('input[id="password"]', 'SecurePass123');
    await page.fill('input[id="confirmPassword"]', 'SecurePass123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('button[type="submit"]:disabled')).toBeVisible();
    await expect(page.locator('button[type="submit"]:has-text("Creating account...")')).toBeVisible();
  });

  test('UX-03: Keyboard navigation and form usability', async ({ page }) => {
    await page.goto('/login');
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[id="email"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[id="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test('UX-06: No console errors on auth pages', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/signup');
    await page.goto('/login');
    
    const authErrors = errors.filter(e => 
      !e.includes('favicon') && 
      !e.includes('Extension') &&
      !e.includes('Content Security Policy')
    );
    expect(authErrors).toHaveLength(0);
  });

  test('UX-08: Cookies blocked shows graceful handling', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/login');
    await page.fill('input[id="email"]', 'test@example.com');
    await page.fill('input[id="password"]', 'password');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Something went wrong')).toBeVisible({ timeout: 10000 });
  });
});