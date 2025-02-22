<script lang="ts">
	import { timerSettings } from '$lib/stores/timerSettings';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// Handle theme toggle - cycles through light -> dark -> auto
	const handleToggleTheme = () => {
		timerSettings.update((settings) => ({
			...settings,
			theme: settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'auto' : 'light'
		}));
	};

	// Get system theme preference
	const getSystemTheme = (): 'light' | 'dark' => {
		if (!browser) return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	};

	// Apply theme class to document (only in browser)
	const applyTheme = (theme: 'light' | 'dark' | 'auto') => {
		if (!browser) return;
		const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;
		effectiveTheme === 'dark'
			? document.documentElement.classList.add('dark')
			: document.documentElement.classList.remove('dark');
	};

	// Handle system theme changes
	const handleSystemThemeChange = (e: MediaQueryListEvent) => {
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

<div class="absolute top-4 left-4 z-10">
	<button
		type="button"
		class="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
		onclick={handleToggleTheme}
		onkeydown={(e) => e.key === 'Enter' && handleToggleTheme()}
		aria-label="Toggle theme mode"
		tabindex="0"
	>
		{#if $timerSettings.theme === 'light'}
			<!-- Sun icon for light mode -->
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
		{:else if $timerSettings.theme === 'dark'}
			<!-- Moon icon for dark mode -->
			<svg
				class="h-5 w-5"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
			</svg>
		{:else}
			<!-- Computer icon for auto mode -->
			<svg
				class="h-5 w-5"
				fill="currentColor"
				viewBox="0 0 20 20"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path
					d="M13 7H7v6h6V7z"
				></path>
				<path
					fill-rule="evenodd"
					d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm6 2H7v12h6V4z"
					clip-rule="evenodd"
				></path>
			</svg>
		{/if}
	</button>
</div>
