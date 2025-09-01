<script lang="ts">
	import { Play, Pause } from 'lucide-svelte';

	const { isPlaying, playToggle } = $props<{
		isPlaying: boolean;
		playToggle: () => void;
	}>();
</script>

<button
	onclick={playToggle}
	class="cursor-pointer rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 plausible-event-name={isPlaying
		? 'Meditation+Pause'
		: 'Meditation+Start'}"
	aria-label={isPlaying ? 'Pause' : 'Play'}
>
	{#if isPlaying}
		<Pause class="h-6 w-6 text-slate-700 dark:text-slate-200" />
	{:else}
		<Play class="h-6 w-6 text-slate-700 dark:text-slate-200" />
	{/if}
</button>
