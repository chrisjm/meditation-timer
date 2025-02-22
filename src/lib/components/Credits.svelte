<script lang="ts">
	import Modal from './Modal.svelte';
	import credits from '$lib/content/credits.md?raw';
	import { marked } from 'marked';

	let isOpen = $state(false);
	const parsedCredits = marked(credits);

	const handleOpen = () => {
		isOpen = true;
	};

	const handleClose = () => {
		isOpen = false;
	};
</script>

<div class="flex flex-col items-center justify-center gap-2">
	<p class="text-xs text-gray-500 dark:text-gray-400">
		Built by
		<a
			href="https://chrisjmears.com"
			target="_blank"
			class="hover:text-gray-700 dark:hover:text-gray-200"
		>
			Chris J Mears
		</a>
	</p>
	<button
		type="button"
		class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
		onclick={handleOpen}
		onkeydown={(e) => e.key === 'Enter' && handleOpen()}
	>
		Credits
	</button>
</div>

<Modal {isOpen} title="Credits" close={handleClose}>
	<div
		class="prose prose-sm dark:prose-invert max-w-none dark:text-gray-300 dark:[&_a]:text-indigo-400 dark:[&_a:hover]:text-indigo-300 [&_h2]:mb-6 dark:[&_h2]:text-gray-200 [&_p]:mb-4 [&_p]:leading-relaxed"
	>
		{@html parsedCredits}
	</div>
</Modal>
