import { test, expect } from '@playwright/test';

test('homepage loads and displays categories', async ({ page }) => {
  await page.goto('/');

  // Check if title is correct (Hero section contains this)
  await expect(page.locator('h1').first()).toContainText('Modern healthcare');

  // Check if Categories sidebar rendered
  const categoriesHeader = page.locator('h3', { hasText: 'Categories' }).first();
  await expect(categoriesHeader).toBeVisible();

  // Check if search bar exists
  const searchInput = page.getByPlaceholder('Search for medicines, health products...').first();
  await expect(searchInput).toBeVisible();
});