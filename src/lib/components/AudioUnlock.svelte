<script lang="ts">
	import { onMount } from 'svelte';
	import { audioUnlocked, initializeAudio, isMobile } from '$lib/utils/mobileAudioManager';

	let audioElements: HTMLAudioElement[] = [];
	let showUnlock = $state(false);

	onMount(() => {
		// Find all audio elements in the document
		audioElements = Array.from(document.getElementsByTagName('audio'));

		// Only show unlock overlay on mobile if audio isn't already unlocked
		showUnlock = isMobile() && !$audioUnlocked;
	});

	const handleUnlock = async () => {
		try {
			await initializeAudio(audioElements);
			showUnlock = false;
		} catch (error) {
			console.error('Failed to unlock audio:', error);
		}
	};

	const handleUnlockKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter' || e.key === ' ') {
			handleUnlock();
		}
	};
</script>

{#if showUnlock}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		onclick={handleUnlock}
		onkeydown={handleUnlockKeydown}
		role="button"
		tabindex="0"
		aria-label="Tap anywhere to enable audio"
	>
		<div class="rounded-lg bg-white/10 p-4 text-center backdrop-blur-md">
			<p class="mb-2 text-lg font-medium text-white">Enable Audio</p>
			<p class="text-sm text-white/80">Tap anywhere to continue</p>
		</div>
	</div>
{/if}
