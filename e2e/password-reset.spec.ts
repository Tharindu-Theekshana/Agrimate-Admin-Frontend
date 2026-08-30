import { expect, test } from '@playwright/test';

function uniqueEmail() {
  return `otp-test-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

test.describe('Forgot password (public flow)', () => {
  test('E2E-05: submitting an email requests a code and hands off to Reset Password', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto('/forgot-password');
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByRole('button', { name: 'Send verification code' }).click();

    await expect(page).toHaveURL(/\/reset-password$/, { timeout: 10_000 });
    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText(/Resend code in \d+s/)).toBeVisible();
  });

  test('E2E-06: an empty email is rejected client-side without hitting the backend', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByRole('button', { name: 'Send verification code' }).click();

    await expect(page.getByText('Enter your email address')).toBeVisible();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test('E2E-07: visiting /reset-password directly (no hand-off) bounces back to Forgot Password', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page).toHaveURL(/\/forgot-password$/);
  });
});

test.describe('Change password (authenticated flow)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('http://localhost:5173/', { timeout: 10_000 });
  });

  test('E2E-08: "Change password" in the account menu requests a code for the logged-in admin', async ({ page }) => {
    test.setTimeout(60_000); 

    await page.waitForTimeout(16_000);

    await page.getByRole('button', { name: /admin/i }).first().click();
    await expect(page.getByText('Change password')).toBeVisible();
    await page.getByText('Change password').click();

    await expect(page).toHaveURL(/\/reset-password$/, { timeout: 30_000 });
    await expect(page.getByText('admin@agrimate.lk', { exact: true })).toBeVisible();
  });
});

test.describe('Reset Password form validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByPlaceholder('you@example.com').fill(uniqueEmail());
    await page.getByRole('button', { name: 'Send verification code' }).click();
    await expect(page).toHaveURL(/\/reset-password$/, { timeout: 10_000 });
  });

  test('E2E-09: rejects a code that is not 6 digits', async ({ page }) => {
    await page.getByPlaceholder('123456').fill('123');
    await page.getByPlaceholder('New password', { exact: false }).nth(0);
    const passwordFields = page.getByPlaceholder('••••••••');
    await passwordFields.nth(0).fill('newSecret1');
    await passwordFields.nth(1).fill('newSecret1');
    await page.getByRole('button', { name: 'Set new password' }).click();

    await expect(page.getByText('Enter the 6-digit code sent to your email')).toBeVisible();
  });

  test('E2E-10: rejects mismatched new/confirm passwords', async ({ page }) => {
    await page.getByPlaceholder('123456').fill('111222');
    const passwordFields = page.getByPlaceholder('••••••••');
    await passwordFields.nth(0).fill('secretOne');
    await passwordFields.nth(1).fill('secretTwo');
    await page.getByRole('button', { name: 'Set new password' }).click();

    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });
});
