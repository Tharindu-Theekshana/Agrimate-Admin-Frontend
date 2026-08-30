import { expect, test } from '@playwright/test';


test.describe('Login', () => {
  test('E2E-01: an unauthenticated visitor is redirected from the dashboard to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'AgriMate Admin' })).toBeVisible();
  });

  test('E2E-02: wrong credentials show an inline error and stay on /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('definitely-wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('E2E-03: the seeded admin account can sign in and reaches the dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('admin').fill('admin');
    await page.getByPlaceholder('••••••••').fill('admin123');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL('http://localhost:5173/', { timeout: 10_000 });
    await expect(page.getByText('Outbreak monitoring & management')).toHaveCount(0); 
  });

  test('E2E-04: the "Forgot password?" link leads to the Forgot Password page', async ({ page }) => {
    await page.goto('/login');
    await page.getByText('Forgot password?').click();

    await expect(page).toHaveURL(/\/forgot-password$/);
    await expect(page.getByRole('heading', { name: 'Forgot password' })).toBeVisible();
  });
});
