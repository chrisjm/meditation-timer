import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: true,
		timeout: 120000
	},

	testDir: 'e2e',
	
	use: {
		baseURL: 'http://localhost:5173'
	},

	timeout: 30000
});
