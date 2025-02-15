<script lang="ts">
	import { timerSettings } from '$lib/stores/timerSettings';
	import { masterTimer } from '$lib/stores/masterTimer';

	let isExpanded = false;

	const handleToggle = () => {
		isExpanded = !isExpanded;
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleToggle();
		}
	};
</script>

<div class="mt-8 border-t border-slate-200 pt-4 dark:border-slate-700">
	<button
		type="button"
		class="flex w-full items-center justify-between rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
		on:click={handleToggle}
		on:keydown={handleKeyDown}
		aria-expanded={isExpanded}
		aria-controls="debug-content"
		tabindex="0"
	>
		<h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Debug</h3>
		<svg
			class="h-5 w-5 transform transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
		</svg>
	</button>

	{#if isExpanded}
		<div
			id="debug-content"
			class="mt-4 space-y-4 rounded-lg bg-slate-100 p-4 font-mono text-sm dark:bg-slate-900"
		>
			<div>
				<h4 class="font-semibold text-emerald-600 dark:text-emerald-400">Timer Settings:</h4>
				<pre class="mt-2 whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300">{JSON.stringify($timerSettings, null, 2)}</pre>
			</div>

			<div>
				<h4 class="font-semibold text-emerald-600 dark:text-emerald-400">Master Timer:</h4>
				<pre class="mt-2 whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300">{JSON.stringify($masterTimer, null, 2)}</pre>
			</div>
		</div>
	{/if}
</div>
