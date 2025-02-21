<script lang="ts">
    import { timerSettings } from '$lib/stores/timerSettings';
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    const handleToggleTheme = () => {
        console.log('Theme toggle clicked');
        timerSettings.update(settings => {
            const newTheme = settings.theme === 'light' ? 'dark' : 'light';
            console.log('Updating theme to:', newTheme);
            return {
                ...settings,
                theme: newTheme
            };
        });
    };

    // Apply theme class to document (only in browser)
    const applyTheme = (theme: 'light' | 'dark') => {
        if (!browser) return;
        console.log('Applying theme:', theme);

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            console.log('Added dark class to documentElement');
        } else {
            document.documentElement.classList.remove('dark');
            console.log('Removed dark class from documentElement');
        }
    };

    // Handle system theme changes
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        console.log('System theme changed:', e.matches ? 'dark' : 'light');
        // Get current store value
        const currentSettings = $timerSettings;
        console.log('Current store settings:', currentSettings);
        
        // Only update if theme is still the default value
        if (currentSettings.theme === 'light') {
            console.log('Using system preference as no user preference is set');
            timerSettings.update(settings => {
                const newTheme = e.matches ? 'dark' : 'light';
                console.log('Updating theme to system preference:', newTheme);
                return {
                    ...settings,
                    theme: newTheme
                };
            });
        } else {
            console.log('Keeping user preference:', currentSettings.theme);
        }
    };

    // Initialize theme and system theme listener
    onMount(() => {
        console.log('Component mounted');
        console.log('Initial theme:', $timerSettings.theme);
        applyTheme($timerSettings.theme);

        // Watch for system theme changes
        if (browser) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            console.log('Initial system theme:', mediaQuery.matches ? 'dark' : 'light');
            mediaQuery.addEventListener('change', handleSystemThemeChange);

            return () => {
                mediaQuery.removeEventListener('change', handleSystemThemeChange);
            };
        }
    });

    // Watch for theme changes
    $: if (browser) {
        console.log('Theme changed to:', $timerSettings.theme);
        applyTheme($timerSettings.theme);
    }
</script>
<div class="absolute top-2 left-2 z-10">
    <button
        type="button"
        class="rounded-lg p-2.5 text-sm hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
        on:click={handleToggleTheme}
        aria-label="Toggle dark mode"
    >
        {#if $timerSettings.theme === 'light'}
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
            </svg>
        {:else}
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"></path>
            </svg>
        {/if}
    </button>
</div>
