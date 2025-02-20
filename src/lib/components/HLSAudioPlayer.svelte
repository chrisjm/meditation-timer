<script lang="ts">
	import Hls from 'hls.js';
	import { onDestroy } from 'svelte';
	import TimeSlider, { type Segment } from './audio/TimeSlider.svelte';
	import PlayPauseButton from './audio/PlayPauseButton.svelte';
	import VolumeControl from './audio/VolumeControl.svelte';
	import { audioControl } from '$lib/stores/audioControl';
	import { setVolume } from '$lib/utils/mobileAudioManager';

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
	let isMuted = $state(false);
	let volume = $state(1);

	// Handle audio element events
	const handlePlay = () => audioControl.setPlaying(true);
	const handlePause = () => audioControl.setPlaying(false);
	const handleTimeUpdate = () => {
		if (audioElement) {
			audioControl.setTime(audioElement.currentTime);
		}
	};
	const handleDurationChange = () => {
		if (audioElement) {
			audioControl.setDuration(audioElement.duration);
		}
	};

	// Audio control methods
	const handlePlayPause = () => {
		if (!audioElement) return;
		if ($audioControl.isPlaying) {
			audioElement.pause();
		} else {
			audioElement.play();
		}
	};

	const handleVolumeToggle = () => {
		if (!audioElement) return;
		// Use our mobile-aware volume setter
		const newVolume = isMuted ? 1 : 0;
		setVolume(audioElement, newVolume);
		isMuted = !isMuted;
		isMuted = !isMuted;
		audioElement.muted = isMuted;
	};

	const handleSeek = (seconds: number) => {
		if (!audioElement) return;
		audioElement.currentTime = seconds;
	};

	const handleVolumeChange = (newVolume: number) => {
		if (!audioElement) return;
		volume = newVolume;
		audioElement.volume = volume;
	};

	// Initialize HLS
	$effect(() => {
		if (!audioElement) return;

		audioControl.setAudioElement(audioElement);

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
							console.log('fatal network error encountered, trying to recover');
							hls?.startLoad();
							break;
						case Hls.ErrorTypes.MEDIA_ERROR:
							console.log('fatal media error encountered, trying to recover');
							hls?.recoverMediaError();
							break;
						default:
							console.error('Fatal error, destroying HLS instance');
							destroyHls();
							break;
					}
				}
			});
		} else if (audioElement.canPlayType('application/vnd.apple.mpegurl')) {
			audioElement.src = src;
		}
	});

	const destroyHls = () => {
		if (hls) {
			hls.destroy();
			hls = undefined;
		}
	};

	onDestroy(() => {
		destroyHls();
		audioControl.setAudioElement(undefined);
		audioControl.reset();
	});
</script>

<div class="w-full max-w-2xl rounded-lg bg-white p-4 shadow-lg dark:bg-slate-800">
	<audio
		bind:this={audioElement}
		{preload}
		{loop}
		onplay={handlePlay}
		onpause={handlePause}
		ontimeupdate={handleTimeUpdate}
		ondurationchange={handleDurationChange}
		class="hidden"
	></audio>

	<div class="flex flex-col gap-4">
		<TimeSlider
			currentTime={$audioControl.currentTime}
			duration={$audioControl.duration}
			{segments}
			seek={handleSeek}
		/>

		<div class="flex items-center">
			<div class="flex w-full items-center justify-between gap-4">
				<PlayPauseButton isPlaying={$audioControl.isPlaying} playToggle={handlePlayPause} />
				<VolumeControl
					{isMuted}
					{volume}
					muteToggle={handleVolumeToggle}
					volumeChange={handleVolumeChange}
				/>
			</div>
		</div>
	</div>
</div>
