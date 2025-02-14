<script lang="ts">
	export let isRunning: boolean;
	export let isPrepping: boolean;
	export let isPaused: boolean;
	export let onStart: () => void;
	export let onPause: () => void;
	export let onReset: () => void;
</script>

<div class="mb-8 space-x-4">
	{#if !isRunning && !isPrepping}
		<button
			on:click={onStart}
			class="rounded-lg bg-emerald-500 px-6 py-2 font-medium text-white
				transition-colors duration-200 hover:bg-emerald-600"
		>
			Start
		</button>
	{:else}
		<button
			on:click={onPause}
			class="rounded-lg bg-amber-500 px-6 py-2 font-medium text-white
				transition-colors duration-200 hover:bg-amber-600"
		>
			{isPaused ? 'Resume' : 'Pause'}
		</button>
		<button
			on:click={onReset}
			class="rounded-lg bg-rose-500 px-6 py-2 font-medium text-white
				transition-colors duration-200 hover:bg-rose-600"
		>
			Reset
		</button>
	{/if}
</div>
