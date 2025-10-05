import { test, expect } from '@playwright/test';

test.describe('Meditation Timer - Basic Flow', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
	});

	test('should load the page', async ({ page }) => {
		await expect(page.locator('h1')).toContainText('Meditation Timer');
	});

	test('should have start button visible', async ({ page }) => {
		await expect(page.getByText('Start')).toBeVisible();
	});
});
