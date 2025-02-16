<script lang="ts">
	export let startBell: HTMLAudioElement | undefined;
	export let intervalBell: HTMLAudioElement | undefined;
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
