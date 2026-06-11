import { test, expect } from '@playwright/test';

test('homepage loads and displays categories', async ({ page }) => {
  await page.goto('/');

  // Check if title is correct (Hero section contains this)
  await expect(page.locator('h1')).toContainText('Your AI-Powered Pharmacy');

  // Check if Categories sidebar rendered
  const categoriesHeader = page.locator('h3', { hasText: 'Categories' });
  await expect(categoriesHeader).toBeVisible();

  // Check if search bar exists
  const searchInput = page.getByPlaceholder('Search for medicines, diseases, or categories...');
  await expect(searchInput).toBeVisible();
});
