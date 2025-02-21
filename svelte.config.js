import vercel from '@sveltejs/adapter-vercel';
import cloudflare from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

// Choose adapter based on environment variable
const adapter = process.env.ADAPTER === 'cloudflare' ? cloudflare : vercel;

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex({ extensions: ['.md'] })],

	kit: {
		adapter: adapter()
	}
};

export default config;
