<script lang="ts">
	import Hls from 'hls.js';
	import { onDestroy } from 'svelte';
	import TimeSlider, { type Segment } from './audio/TimeSlider.svelte';
	import PlayPauseButton from './audio/PlayPauseButton.svelte';
	import VolumeControl from './audio/VolumeControl.svelte';

	const {
		src,
		preload = 'auto',
		loop = false,
		segments = [] as Segment[]
	} = $props<{
		src: string;
		preload?: string;
		loop?: boolean;
		segments?: Segment[];
	}>();

	let audioElement: HTMLAudioElement | undefined;
	let hls: Hls | undefined;
	let isPlaying = $state(false);
	let isMuted = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(1);

	$effect(() => {
		if (!audioElement) return;

		if (Hls.isSupported()) {
			hls = new Hls({
				enableWorker: true,
				lowLatencyMode: true
			});

			hls.attachMedia(audioElement);
			hls.on(Hls.Events.MEDIA_ATTACHED, () => {
				hls?.loadSource(src);
			});

			hls.on(Hls.Events.ERROR, (event, data) => {
				if (data.fatal) {
					switch (data.type) {
						case Hls.ErrorTypes.NETWORK_ERROR:
							// try to recover network error
							console.log('fatal network error encountered, trying to recover');
							hls?.startLoad();
							break;
						case Hls.ErrorTypes.MEDIA_ERROR:
							console.log('fatal media error encountered, trying to recover');
							hls?.recoverMediaError();
							break;
						default:
							// cannot recover
							console.error('Fatal error, destroying HLS instance');
							destroyHls();
							break;
					}
				}
			});
		} else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
			// For Safari, which has native HLS support
			audioElement.src = src;
		}
	});

	function handlePlayPause() {
		if (!audioElement) return;
		if (isPlaying) {
			audioElement.pause();
		} else {
			audioElement.play();
		}
	}

	function handleVolumeToggle() {
		if (!audioElement) return;
		isMuted = !isMuted;
		audioElement.muted = isMuted;
	}

	function handleTimeUpdate() {
		if (!audioElement) return;
		currentTime = audioElement.currentTime;
	}

	function handleDurationChange() {
		if (!audioElement) return;
		duration = audioElement.duration;
	}

	function handleSeek(seconds: number) {
		if (!audioElement) return;
		audioElement.currentTime = seconds;
	}

	function handleVolumeChange(volume: number) {
		if (!audioElement) return;
		audioElement.volume = volume;
	}

	$effect(() => {
		if (!audioElement) return;
		audioElement.addEventListener('play', () => (isPlaying = true));
		audioElement.addEventListener('pause', () => (isPlaying = false));
		audioElement.addEventListener('timeupdate', handleTimeUpdate);
		audioElement.addEventListener('durationchange', handleDurationChange);
	});

	onDestroy(() => {
		destroyHls();
		if (audioElement) {
			audioElement.removeEventListener('play', () => (isPlaying = true));
			audioElement.removeEventListener('pause', () => (isPlaying = false));
			audioElement.removeEventListener('timeupdate', handleTimeUpdate);
			audioElement.removeEventListener('durationchange', handleDurationChange);
		}
	});

	function destroyHls() {
		if (hls) {
			hls.destroy();
			hls = undefined;
		}
	}

	export function play() {
		audioElement?.play();
	}

	export function pause() {
		audioElement?.pause();
	}

	export function stop() {
		if (audioElement) {
			audioElement.pause();
			audioElement.currentTime = 0;
		}
	}
</script>

<div class="w-full max-w-2xl rounded-lg bg-white p-4 shadow-lg dark:bg-slate-800">
	<audio bind:this={audioElement} {preload} {loop} class="hidden"></audio>
	<div class="flex flex-col gap-4">
		<TimeSlider {currentTime} {duration} seek={handleSeek} segments={segments} />

		<div class="flex items-center">
			<div class="flex w-full items-center justify-between gap-4">
				<PlayPauseButton {isPlaying} playToggle={handlePlayPause} />
				<VolumeControl
					{volume}
					{isMuted}
					volumeChange={handleVolumeChange}
					muteToggle={handleVolumeToggle}
				/>
			</div>
		</div>
	</div>
</div>
