<script lang="ts">
	import { timerSettings } from '$lib/stores/timerSettings.svelte';
	import { onMount } from 'svelte';
	import { Sun, Moon, SunMoon } from 'lucide-svelte';

	// Handle theme toggle - cycles through light -> dark -> auto
	const handleToggleTheme = () => {
		timerSettings.update((settings) => ({
			...settings,
			theme: settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'auto' : 'light'
		}));
	};

	const isBrowser = typeof window !== 'undefined';

	// Get system theme preference
	const getSystemTheme = (): 'light' | 'dark' => {
		if (!isBrowser) return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	};

	// Apply theme class to document (only in browser)
	const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
		if (!isBrowser) return;
		const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;
		if (effectiveTheme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	};

	// Handle system theme changes
	const handleSystemThemeChange = () => {
		const currentSettings = $timerSettings;
		// Only update if theme is set to auto
		if (currentSettings.theme === 'auto') {
			applyTheme('auto');
		}
	};

	// Initialize theme and system theme listener
	onMount(() => {
		applyTheme($timerSettings.theme);

		// Watch for system theme changes
		if (isBrowser) {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			mediaQuery.addEventListener('change', handleSystemThemeChange);

			return () => {
				mediaQuery.removeEventListener('change', handleSystemThemeChange);
			};
		}
	});

	// Watch for theme changes
	$: if (isBrowser) {
		applyTheme($timerSettings.theme);
	}
</script>

<button
	type="button"
	class="fixed top-4 left-4 z-10 cursor-pointer rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700"
	onclick={handleToggleTheme}
	onkeydown={(event) => {
		if (event.key === 'Enter') {
			handleToggleTheme();
		}
	}}
	aria-label="Toggle theme mode"
	tabindex="0"
>
	{#if $timerSettings.theme === 'light'}
		<Sun class="h-6 w-6 text-gray-600 dark:text-gray-300" />
	{:else if $timerSettings.theme === 'dark'}
		<Moon class="h-6 w-6 text-gray-600 dark:text-gray-300" />
	{:else}
		<SunMoon class="h-6 w-6 text-gray-600 dark:text-gray-300" />
	{/if}
</button>
