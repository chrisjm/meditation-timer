<script lang="ts">
	import Hls from 'hls.js';
	import { onDestroy } from 'svelte';
	import TimeSlider, { type Segment } from './audio/TimeSlider.svelte';
	import PlayPauseButton from './audio/PlayPauseButton.svelte';
	import VolumeControl from './audio/VolumeControl.svelte';
	import { audioControl } from '$lib/stores/audioControl';
	import { timerSettings } from '$lib/stores/timerSettings';
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
	let isMuted = $state(!$timerSettings.backgroundMusicEnabled);
	let volume = $state($timerSettings.backgroundMusicVolume);

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

		// Toggle mute state
		isMuted = !isMuted;

		// Update audio element
		setVolume(audioElement, isMuted ? 0 : volume);
		audioElement.muted = isMuted;

		// Update settings to reflect that background music is enabled when NOT muted
		timerSettings.update((settings) => ({
			...settings,
			backgroundMusicEnabled: !isMuted
		}));
	};

	const handleSeek = (seconds: number) => {
		if (!audioElement) return;
		audioElement.currentTime = seconds;
	};

	const handleVolumeChange = (newVolume: number) => {
		if (!audioElement) return;
		audioElement.volume = newVolume;
		volume = newVolume;
		timerSettings.update((settings) => ({
			...settings,
			backgroundMusicVolume: newVolume
		}));
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

<div class="w-full max-w-2xl sm:rounded-full rounded-lg bg-slate-100 sm:px-12 px-6 py-4 shadow-inner dark:bg-slate-950">
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
