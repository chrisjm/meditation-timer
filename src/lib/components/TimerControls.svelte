<script lang="ts">
	export let isRunning: boolean;
	export let isPaused: boolean;
	export let onStart: () => void;
	export let onPause: () => void;
	export let onReset: () => void;
</script>

<div class="mb-8 space-x-4">
	{#if !isRunning}
		<button
			onclick={onStart}
			class="rounded-lg bg-emerald-500 px-6 py-2 font-medium text-white
				transition-colors duration-200 hover:bg-emerald-600"
			aria-label="Start meditation"
		>
			Start
		</button>
	{:else}
		<button
			onclick={onPause}
			class="rounded-lg bg-amber-500 px-6 py-2 font-medium text-white
				transition-colors duration-200 hover:bg-amber-600"
			aria-label={isPaused ? 'Resume meditation' : 'Pause meditation'}
		>
			{isPaused ? 'Resume' : 'Pause'}
		</button>
		<button
			onclick={onReset}
			class="rounded-lg bg-rose-500 px-6 py-2 font-medium text-white
				transition-colors duration-200 hover:bg-rose-600"
			aria-label="Reset meditation timer"
		>
			Reset
		</button>
	{/if}
</div>
