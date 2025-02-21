<script lang="ts">
	import '../app.css';
	import SEO from '$lib/components/SEO.svelte';
	import AudioUnlock from '$lib/components/AudioUnlock.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	let { children } = $props();
</script>

<div>
	<ThemeToggle />
	<SEO />
	<AudioUnlock />
	{@render children()}
</div>
