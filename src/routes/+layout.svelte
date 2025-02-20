<script lang="ts">
	import '../app.css';
	import SEO from '$lib/components/SEO.svelte';
	import AudioUnlock from '$lib/components/AudioUnlock.svelte';
	let { children } = $props();
</script>

<SEO />
<AudioUnlock />
{@render children()}
