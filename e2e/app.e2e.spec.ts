import { test, expect } from '@playwright/test';

test('landing page shows key navigation and title', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Atlas To-Do Studio' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Overview' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Projects' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Focus' })).toBeVisible();
});
