import { test, expect } from '@playwright/test';

test.describe('Norix web app', () => {
  test('landing page loads and shows primary heading', async ({ page }) => {
    await page.goto('/?view=landing');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({ timeout: 15_000 });
  });

  test('app shell loads from view=app', async ({ page }) => {
    await page.goto('/?view=app');
    await expect(page.getByText('Norix', { exact: true }).first()).toBeVisible({ timeout: 20_000 });
  });
});
