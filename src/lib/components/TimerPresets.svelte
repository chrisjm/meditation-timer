<script lang="ts">
	import { slide } from 'svelte/transition';

	let { duration, onSetDuration } = $props<{
		duration: number;
		onSetDuration: (minutes: number) => void;
	}>();

	const presets = [5, 10, 15, 20];
	let isExpanded = $state(false);

	let selectedPreset = $derived(Math.floor(duration / 60));

	function handlePresetClick(preset: number) {
		if (duration === preset * 60 && isExpanded) {
			isExpanded = false;
			return;
		}
		onSetDuration(preset);
		isExpanded = false;
	}

	function handleKeyDown(event: KeyboardEvent, preset: number) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handlePresetClick(preset);
		}
	}
</script>

<div class="relative mx-auto max-w-lg">
	<button
		onclick={() => (isExpanded = !isExpanded)}
		class="w-full cursor-pointer rounded-full bg-slate-200/30 px-4 py-3 text-slate-700
			transition-colors duration-200
			hover:bg-slate-300/50 dark:bg-slate-800/50
			dark:text-slate-300 dark:hover:bg-slate-700"
		class:ring-1={!isExpanded}
		class:ring-emerald-400={!isExpanded}
		aria-expanded={isExpanded}
		aria-label="Timer preset selector"
		tabindex="0"
	>
		{selectedPreset} min
	</button>

	{#if isExpanded}
		<div
			transition:slide={{ duration: 200 }}
			class="absolute top-full right-0 left-0 z-10 mt-2 grid grid-cols-2 gap-4 rounded-lg bg-white p-4 shadow-lg sm:grid-cols-4 dark:bg-slate-900"
		>
			{#each presets as preset (preset)}
				<button
					onclick={() => handlePresetClick(preset)}
					onkeydown={(e) => handleKeyDown(e, preset)}
					class="rounded-full bg-slate-100 px-4 py-3 text-sm text-slate-700
						transition-colors duration-200
						hover:bg-slate-200 dark:bg-slate-800
						dark:text-slate-300 dark:hover:bg-slate-700"
					class:ring-1={duration === preset * 60}
					class:ring-emerald-400={duration === preset * 60}
					aria-label="Set timer to {preset} minutes"
					tabindex="0"
				>
					{preset} min
				</button>
			{/each}
		</div>
	{/if}
</div>
