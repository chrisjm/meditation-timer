<script lang="ts">
	import { timerSettings } from '$lib/stores/timerSettings';
	import { masterTimer } from '$lib/stores/masterTimer';
	import { audio } from '$lib/stores/audio';
	import { modalStore } from '$lib/stores/modal';

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

<div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
	<button
		type="button"
		class="flex w-full cursor-pointer items-center justify-between rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
		on:click={handleToggle}
		on:keydown={handleKeyDown}
		aria-expanded={isExpanded}
		aria-controls="debug-content"
		tabindex="0"
	>
		<span class="text-sm font-medium text-gray-700 dark:text-gray-300">Debug</span>
		<svg
			class="h-5 w-5 transform text-gray-700 transition-transform duration-200 dark:text-gray-300 {isExpanded
				? 'rotate-180'
				: ''}"
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
			class="scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent mt-4 max-h-[30vh] space-y-4 overflow-y-auto rounded-lg bg-gray-100 p-4 font-mono text-sm dark:bg-gray-900"
		>
			<div>
				<h4 class="font-semibold text-emerald-600 dark:text-emerald-400">Timer Settings:</h4>
				<pre
					class="mt-2 break-all whitespace-pre-wrap text-slate-700 dark:text-slate-300">{JSON.stringify(
						$timerSettings,
						null,
						2
					)}</pre>
			</div>

			<div>
				<h4 class="font-semibold text-emerald-600 dark:text-emerald-400">Master Timer:</h4>
				<pre
					class="mt-2 break-all whitespace-pre-wrap text-slate-700 dark:text-slate-300">{JSON.stringify(
						$masterTimer,
						null,
						2
					)}</pre>
			</div>

			<div>
				<h4 class="font-semibold text-emerald-600 dark:text-emerald-400">Audio Store (HLS):</h4>
				<pre
					class="mt-2 break-all whitespace-pre-wrap text-slate-700 dark:text-slate-300">{JSON.stringify(
						{
							...$audio.hls,
							audioElement: $audio.hls.audioElement ? '[HTMLAudioElement]' : undefined
						},
						null,
						2
					)}</pre>
			</div>

			<div>
				<h4 class="font-semibold text-emerald-600 dark:text-emerald-400">Audio Store (Bells):</h4>
				<pre
					class="mt-2 break-all whitespace-pre-wrap text-slate-700 dark:text-slate-300">{JSON.stringify(
						{ activeAudio: Array.from($audio.bells.activeAudio).map(() => '[HTMLAudioElement]') },
						null,
						2
					)}</pre>
			</div>

			<div>
				<h4 class="font-semibold text-emerald-600 dark:text-emerald-400">Modal Store:</h4>
				<pre
					class="mt-2 break-all whitespace-pre-wrap text-slate-700 dark:text-slate-300">{JSON.stringify(
						$modalStore,
						null,
						2
					)}</pre>
			</div>
		</div>
	{/if}
</div>
