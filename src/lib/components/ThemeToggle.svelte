<script lang="ts">
	import { timerSettings } from '$lib/stores/timerSettings';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Sun, Moon, SunMoon } from 'lucide-svelte';

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
		class="cursor-pointer rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700"
		onclick={handleToggleTheme}
		onkeydown={(e) => e.key === 'Enter' && handleToggleTheme()}
		aria-label="Toggle theme mode"
		tabindex="0"
	>
		{#if $timerSettings.theme === 'light'}
			<Sun class="h-5 w-5" />
		{:else if $timerSettings.theme === 'dark'}
			<Moon class="h-5 w-5" />
		{:else}
			<SunMoon class="h-5 w-5" />
		{/if}
	</button>
</div>
