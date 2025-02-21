<script lang="ts">
	import { timerSettings } from '$lib/stores/timerSettings';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// Handle theme toggle
	const handleToggleTheme = () => {
		timerSettings.update((settings) => ({
			...settings,
			theme: settings.theme === 'light' ? 'dark' : 'light'
		}));
	};

	// Apply theme class to document (only in browser)
	const applyTheme = (theme: 'light' | 'dark') => {
		if (!browser) return;
		theme === 'dark'
			? document.documentElement.classList.add('dark')
			: document.documentElement.classList.remove('dark');
	};

	// Handle system theme changes
	const handleSystemThemeChange = (e: MediaQueryListEvent) => {
		const currentSettings = $timerSettings;

		// Only update if theme is still the default value
		if (currentSettings.theme === 'light') {
			timerSettings.update((settings) => ({
				...settings,
				theme: e.matches ? 'dark' : 'light'
			}));
		}
	};

	// Initialize theme and system theme listener
	onMount(() => {
		applyTheme($timerSettings.theme);

		// Watch for system theme changes
		if (browser) {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			mediaQuery.addEventListener('change', handleSystemThemeChange);

			return () => {
				mediaQuery.removeEventListener('change', handleSystemThemeChange);
			};
		}
	});

	// Watch for theme changes
	$: if (browser) {
		applyTheme($timerSettings.theme);
	}
</script>

<div class="absolute top-2 left-2 z-10">
	<button
		type="button"
		class="rounded-lg p-2.5 text-sm hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
		on:click={handleToggleTheme}
		aria-label="Toggle dark mode"
	>
		{#if $timerSettings.theme === 'light'}
			<svg
				class="h-5 w-5"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
			</svg>
		{:else}
			<svg
				class="h-5 w-5"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
				></path>
			</svg>
		{/if}
	</button>
</div>
