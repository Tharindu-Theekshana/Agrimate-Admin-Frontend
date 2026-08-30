import { expect, test } from '@playwright/test';


const DIR = 'C:/Users/Tharidu/Desktop/projects/Agrimate/testing/evidence/admin/screenshots';

test('capture: Login page with Forgot password link', async ({ page }) => {
  await page.goto('/login');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/01_login.png` });
});

test('capture: Forgot Password page', async ({ page }) => {
  await page.goto('/forgot-password');
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/02_forgot_password.png` });
});

test('capture: Reset Password page after hand-off', async ({ page }) => {
  const email = `evidence-${Date.now()}@example.com`;
  await page.goto('/forgot-password');
  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByRole('button', { name: 'Send verification code' }).click();
  await expect(page).toHaveURL(/\/reset-password$/, { timeout: 10_000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/03_reset_password.png` });
});

test('capture: dashboard account menu with Change password', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('admin').fill('admin');
  await page.getByPlaceholder('••••••••').fill('admin123');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('http://localhost:5173/', { timeout: 10_000 });
  await page.getByRole('button', { name: /admin/i }).first().click();
  await expect(page.getByText('Change password')).toBeVisible();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${DIR}/04_account_menu_change_password.png` });
});
