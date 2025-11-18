<script lang="ts">
	interface TimerControlsProps {
		isRunning: boolean;
		isPaused: boolean;
		onStart: () => void;
		onPause: () => void;
		onReset: () => void;
	}

	const { isRunning, isPaused, onStart, onPause, onReset }: TimerControlsProps = $props();
</script>

<div class="mb-8 flex min-h-16 justify-center space-x-4 transition-all duration-200">
	{#if !isRunning && !isPaused}
		<button
			onclick={onStart}
			class="cursor-pointer rounded-full border border-emerald-300 bg-gradient-to-b from-emerald-100 to-emerald-200 px-8 py-3 text-2xl font-light text-emerald-900 transition-all transition-all duration-200 hover:from-emerald-200 hover:to-emerald-200
				dark:border-emerald-500 dark:from-emerald-500 dark:to-emerald-600 dark:text-emerald-50 dark:hover:from-emerald-500 dark:hover:to-emerald-500"
			aria-label="Start meditation"
		>
			Start
		</button>
	{:else}
		<div
			class="flex items-center justify-center space-x-4 opacity-75 transition-all duration-200 hover:opacity-100"
		>
			<button
				onclick={onPause}
				class="cursor-pointer rounded-full border border-amber-300 bg-gradient-to-b from-amber-100 to-amber-200 px-8 py-3 text-base font-light text-amber-900 transition-colors duration-200 hover:from-amber-200 hover:to-amber-200
					dark:border-amber-500 dark:from-amber-500 dark:to-amber-600 dark:text-amber-50 dark:hover:from-amber-600 dark:hover:to-amber-600"
				aria-label={isPaused ? 'Resume meditation' : 'Pause meditation'}
			>
				{isPaused ? 'Resume' : 'Pause'}
			</button>
			<button
				onclick={onReset}
				class="cursor-pointer rounded-full border border-rose-300 bg-gradient-to-b from-rose-100 to-rose-200 px-8 py-3 text-base font-light text-rose-900 transition-colors duration-200 hover:from-rose-200 hover:to-rose-200
					dark:border-rose-500 dark:from-rose-500 dark:to-rose-600 dark:text-rose-50 dark:hover:from-rose-600 dark:hover:to-rose-600"
				aria-label="Reset meditation timer"
			>
				Reset
			</button>
		</div>
	{/if}
</div>
