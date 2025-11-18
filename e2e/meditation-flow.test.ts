import { test, expect } from '@playwright/test';

test('meditation page loads with start control', async ({ page }) => {
	await page.goto('/');

	await expect(
		page.getByRole('heading', { level: 1, name: 'Meditation Timer' })
	).toBeVisible();

	await expect(
		page.getByRole('button', { name: 'Start meditation' })
	).toBeVisible();
});
