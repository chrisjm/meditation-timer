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

<div class="flex flex-col items-center justify-center gap-2.5 pb-4">
	<p class="text-xs text-gray-500 dark:text-gray-400">
		Built by
		<a
			href="https://chrisjmears.com"
			target="_blank"
			class="underline decoration-slate-400 underline-offset-2 hover:text-gray-700 hover:decoration-gray-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none md:no-underline md:decoration-transparent md:hover:underline dark:hover:text-gray-200"
		>
			Chris J Mears
		</a>
	</p>
	<p class="text-xs text-gray-500 dark:text-gray-400">
		✨ Check out the <a
			href="https://www.kirtan-kriya-timer.com/"
			target="_blank"
			class="underline decoration-slate-400 underline-offset-2 hover:text-gray-700 hover:decoration-gray-500 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none md:no-underline md:decoration-transparent md:hover:underline dark:hover:text-gray-200"
			>Kirtan Kriya Timer</a
		> 🧘‍♂️
	</p>

	<a
		href="https://discord.gg/nNTssUUMJf"
		target="_blank"
		rel="noopener noreferrer"
		class="group flex items-center gap-2 rounded-full border border-transparent bg-purple-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:bg-purple-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:outline-none md:px-4 md:py-2 md:shadow-md md:hover:shadow-lg dark:bg-purple-500 dark:hover:bg-purple-400"
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
