import { test, expect } from '../utils/auth-helpers';

test.describe('Recovery & Callback Flows — RC-01 to RC-07', () => {
  test('RC-04: Callback error handling shows friendly message', async ({ page }) => {
    await page.goto('/auth/callback?error=expired_token');
    await expect(page.locator('text=Confirmation failed')).toBeVisible({ timeout: 5000 });
    
    await page.goto('/auth/callback?error=invalid_token');
    await expect(page.locator('text=Confirmation failed')).toBeVisible({ timeout: 5000 });
  });

  test('RC-05: Unsafe redirect_to parameter ignored (stays on callback page)', async ({ page }) => {
    await page.goto('/auth/callback?code=valid&redirect_to=https://evil.com');
    // Should not navigate to evil.com; remain on callback path
    await expect(page).toHaveURL(/.*\/auth\/callback/);
  });
});