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
		onclick={() => isExpanded = !isExpanded}
		class="w-full rounded-lg bg-slate-200 px-4 py-3 text-slate-700
			transition-colors duration-200
			hover:bg-slate-300 dark:bg-slate-800
			dark:text-slate-300 dark:hover:bg-slate-700"
		class:ring-2={!isExpanded}
		class:ring-emerald-500={!isExpanded}
		aria-expanded={isExpanded}
		aria-label="Timer preset selector"
		tabindex="0"
	>
		{selectedPreset} min
	</button>

	{#if isExpanded}
		<div
			transition:slide={{ duration: 200 }}
			class="absolute left-0 right-0 top-full z-10 mt-2 grid grid-cols-2 gap-4 rounded-lg bg-white p-4 shadow-lg dark:bg-slate-900 sm:grid-cols-4"
		>
			{#each presets as preset}
				<button
					onclick={() => handlePresetClick(preset)}
					onkeydown={e => handleKeyDown(e, preset)}
					class="rounded-lg bg-slate-200 px-4 py-3 text-slate-700
						transition-colors duration-200
						hover:bg-slate-300 dark:bg-slate-800
						dark:text-slate-300 dark:hover:bg-slate-700"
					class:ring-2={duration === preset * 60}
					class:ring-emerald-500={duration === preset * 60}
					aria-label="Set timer to {preset} minutes"
					tabindex="0"
				>
					{preset} min
				</button>
			{/each}
		</div>
	{/if}
</div>
