<script lang="ts">
	import '../app.css';
	import SEO from '$lib/components/SEO.svelte';
	import AudioUnlock from '$lib/components/AudioUnlock.svelte';
	let { children } = $props();

	const handleUnlockClick = () => {
		// The actual unlock logic is handled in the AudioUnlock component
	};

	const handleUnlockKeydown = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			handleUnlockClick();
		}
	};
</script>

<SEO />
<AudioUnlock onclick={handleUnlockClick} onkeydown={handleUnlockKeydown} />
{@render children()}
