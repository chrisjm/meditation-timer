<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import SEO from '$lib/components/SEO.svelte';
	import AudioUnlock from '$lib/components/AudioUnlock.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';

	let { children } = $props();

	// Vercel analytics
	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

<div class="min-h-screen safe-top safe-bottom px-safe-left px-safe-right bg-white dark:bg-slate-900">
	<ThemeToggle />
	<SEO />
	<AudioUnlock />
	{@render children()}
</div>
