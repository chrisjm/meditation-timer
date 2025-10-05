<script lang="ts">
	interface AudioElementsProps {
		onStartBellReady?: (element: HTMLAudioElement) => void;
		onIntervalBellReady?: (element: HTMLAudioElement) => void;
	}

	const { onStartBellReady, onIntervalBellReady }: AudioElementsProps = $props();

	let startBell = $state<HTMLAudioElement | undefined>();
	let intervalBell = $state<HTMLAudioElement | undefined>();

	$effect(() => {
		if (startBell && onStartBellReady) {
			onStartBellReady(startBell);
		}
	});

	$effect(() => {
		if (intervalBell && onIntervalBellReady) {
			onIntervalBellReady(intervalBell);
		}
	});
</script>

<audio
	bind:this={startBell}
	src="https://wanderingleafstudios.s3.us-west-1.amazonaws.com/audio/tibetan-bell-ding-b-note.mp3"
	preload="auto"
></audio>
<audio
	bind:this={intervalBell}
	src="https://wanderingleafstudios.s3.us-west-1.amazonaws.com/audio/meditation-bell.mp3"
	preload="auto"
></audio>
