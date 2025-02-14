<script lang="ts">
	export let duration: number;
	export let onSetDuration: (minutes: number) => void;

	const presets = [5, 10, 15, 20];
</script>

<div class="mx-auto grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
	{#each presets as preset}
		<button
			on:click={() => onSetDuration(preset)}
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
