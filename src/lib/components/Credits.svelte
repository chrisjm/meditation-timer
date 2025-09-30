<script lang="ts">
	import Modal from './Modal.svelte';
	import credits from '$lib/content/credits.md?raw';
	import { marked } from 'marked';
	import { MessageCircle } from 'lucide-svelte';

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
	<p class="text-xs text-gray-500 dark:text-gray-400">
		✨ Check out the <a
			href="https://www.kirtan-kriya-timer.com/"
			target="_blank"
			class="hover:text-gray-700 dark:hover:text-gray-200">Kirtan Kriya Timer</a
		> 🧘‍♂️
	</p>

	<a
		href="https://discord.gg/nNTssUUMJf"
		target="_blank"
		rel="noopener noreferrer"
		class="group flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-medium text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg dark:from-indigo-600 dark:to-purple-700 dark:hover:from-indigo-500 dark:hover:to-purple-600"
		aria-label="Join our Discord community"
		tabindex="0"
	>
		<MessageCircle class="h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
		<span>Join our Discord</span>
	</a>

	<button
		type="button"
		class="cursor-pointer text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
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
