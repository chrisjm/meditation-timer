<script lang="ts">
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import SEO from '$lib/components/SEO.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import NotificationContainer from '$lib/components/NotificationContainer.svelte';

	let { children } = $props();

	injectAnalytics({ mode: dev ? 'development' : 'production' });
	injectSpeedInsights();
</script>

<div class="safe-top safe-bottom safe-left safe-right min-h-screen bg-white dark:bg-slate-900">
	<ThemeToggle />
	<SEO />
	<NotificationContainer />
	{@render children()}
</div>
