<script lang="ts">
	import { Play, Pause, Loader2 } from 'lucide-svelte';

	const {
		isPlaying,
		playToggle,
		isDisabled = false
	} = $props<{
		isPlaying: boolean;
		playToggle: () => void;
		isDisabled?: boolean;
	}>();
</script>

<button
	onclick={playToggle}
	disabled={isDisabled}
	class="rounded-full p-2 transition-colors"
	class:cursor-pointer={!isDisabled}
	class:hover:bg-slate-100={!isDisabled}
	class:dark:hover:bg-slate-700={!isDisabled}
	class:opacity-50={isDisabled}
	class:cursor-not-allowed={isDisabled}
	aria-label={isDisabled ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
>
	{#if isDisabled}
		<Loader2 class="h-6 w-6 animate-spin text-slate-700 dark:text-slate-200" />
	{:else if isPlaying}
		<Pause class="h-6 w-6 text-slate-700 dark:text-slate-200" />
	{:else}
		<Play class="h-6 w-6 text-slate-700 dark:text-slate-200" />
	{/if}
</button>
