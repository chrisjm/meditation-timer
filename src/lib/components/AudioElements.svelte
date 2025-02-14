<script lang="ts">
	export let startBell: HTMLAudioElement | undefined;
	export let intervalBell: HTMLAudioElement | undefined;
	export let backgroundMusic: HTMLAudioElement | undefined;
</script>

<audio bind:this={startBell} src="/tibetan-bell-ding-b-note.mp3" preload="auto"></audio>
<audio bind:this={intervalBell} src="/meditation-bell.mp3" preload="auto"></audio>
<!-- <audio bind:this={backgroundMusic} src="/meditation-opus.ogg" preload="auto" loop></audio> -->
