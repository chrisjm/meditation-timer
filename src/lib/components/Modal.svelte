<script lang="ts">
	import { fade, scale } from 'svelte/transition';

	let { isOpen, title, close, children } = $props();
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		transition:fade={{ duration: 200 }}
		role="dialog"
		aria-modal="true"
		aria-labelledby={title ? 'modal-title' : undefined}
	>
		<!-- Overlay -->
		<div class="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true"></div>

		<!-- Modal -->
		<div
			class="relative mx-4 flex max-h-[calc(100vh-6rem)] w-full max-w-md flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			{#if title}
				<h2 id="modal-title" class="px-4 pt-4 text-xl font-semibold text-gray-900 dark:text-white">
					{title}
				</h2>
			{/if}

			<!-- Close button -->
			<button
				type="button"
				class="absolute top-4 right-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-900 focus:ring-2 focus:ring-gray-300 focus:outline-none dark:hover:bg-gray-600 dark:hover:text-white"
				onclick={close}
				aria-label="Close modal"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					></path>
				</svg>
			</button>

			<!-- Modal content -->
			<div class="flex-1 overflow-y-auto p-4">
				{@render children()}
			</div>
		</div>
	</div>
{/if}
