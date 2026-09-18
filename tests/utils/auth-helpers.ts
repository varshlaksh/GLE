import { test as base, type Page } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AdminSupabaseClient = SupabaseClient<any, 'public', any>;

export const test = base.extend<{
  supabaseAdmin: AdminSupabaseClient;
  authPage: Page;
}>({
  supabaseAdmin: async ({}, applyFixture) => {
    if (!serviceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not set — cannot create admin client');
    }
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    await applyFixture(admin);
  },
  authPage: async ({ page }, applyFixture) => {
    await page.goto('/login');
    await applyFixture(page);
  },
});

export { expect } from '@playwright/test';

export async function signUpViaUI(page: Page, email: string, password: string) {
  await page.goto('/signup');
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.fill('input[id="confirmPassword"]', password);
  await page.click('button[type="submit"]');
  await page.waitForSelector('text=Check your inbox', { timeout: 10000 });
}

export async function signInViaUI(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.fill('input[id="email"]', email);
  await page.fill('input[id="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 10000 });
}

export async function signOutViaUI(page: Page) {
  await page.click('button:has-text("Sign out")');
  await page.waitForURL('/login', { timeout: 5000 });
}

export async function createTestUser(supabaseAdmin: AdminSupabaseClient, email: string, password: string, confirm = true) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: confirm,
    user_metadata: { full_name: 'Test User' },
  });
  if (error) throw error;
  return data.user;
}

export async function deleteTestUser(supabaseAdmin: AdminSupabaseClient, userId: string) {
  await supabaseAdmin.auth.admin.deleteUser(userId);
}

export async function getUserByEmail(supabaseAdmin: AdminSupabaseClient, email: string) {
  const { data } = await supabaseAdmin.auth.admin.listUsers();
  return data.users.find((u) => u.email === email);
}