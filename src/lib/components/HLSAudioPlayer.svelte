<script lang="ts">
	import Hls from 'hls.js';
	import { onDestroy } from 'svelte';
	import TimeSlider, { type Segment } from './audio/TimeSlider.svelte';
	import PlayPauseButton from './audio/PlayPauseButton.svelte';
	import VolumeControl from './audio/VolumeControl.svelte';
	import { audioControl } from '$lib/stores/audioControl';
	import { timerSettings } from '$lib/stores/timerSettings';
	import {
		setVolume,
		audioUnlocked,
		initializeAudio,
		isMobile
	} from '$lib/utils/mobileAudioManager';

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
	let isMediaReady = $state(false);
	let isLoading = $state(false);
	let mediaReadyPromise: Promise<void> | null = null;

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

	const handlePlayPause = async () => {
		if (!audioElement) return;

		const element = audioElement;

		if ($audioControl.isPlaying) {
			element.pause();
			return;
		}

		if (!isMediaReady) {
			isLoading = true;
			try {
				if (mediaReadyPromise) {
					await mediaReadyPromise;
				} else {
					console.warn('Media initialization not started');
					isLoading = false;
					return;
				}
			} catch (err) {
				console.error('Failed to load media:', err);
				isLoading = false;
				return;
			}
			isLoading = false;
		}

		if (isMobile() && !$audioUnlocked) {
			try {
				await initializeAudio([]);
			} catch (err) {
				console.error('Failed to initialize audio:', err);
				return;
			}
		}

		try {
			if (isMobile() && element.readyState < 2) {
				console.log('Waiting for audio to be ready...', element.readyState);
				await new Promise<void>((resolve) => {
					const checkReady = () => {
						if (element.readyState >= 2) {
							element.removeEventListener('canplay', checkReady);
							resolve();
						}
					};
					element.addEventListener('canplay', checkReady);
					setTimeout(() => {
						element.removeEventListener('canplay', checkReady);
						resolve();
					}, 5000);
				});
			}
			await element.play();
		} catch (err) {
			console.error('Failed to play audio:', err);
		}
	};

	const handleVolumeToggle = () => {
		if (!audioElement) return;

		isMuted = !isMuted;

		setVolume(audioElement, isMuted ? 0 : volume);
		audioElement.muted = isMuted;

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

	$effect(() => {
		if (!audioElement) return;

		audioControl.setAudioElement(audioElement);
		isMediaReady = false;

		const element = audioElement;
		element.dataset.hlsManaged = 'true';

		if (Hls.isSupported()) {
			const hlsInstance = new Hls({
				enableWorker: true,
				lowLatencyMode: true,
				maxBufferLength: 30,
				maxMaxBufferLength: 600,
				backBufferLength: 90
			});
			hls = hlsInstance;

			mediaReadyPromise = new Promise((resolve, reject) => {
				hlsInstance.attachMedia(element);
				hlsInstance.on(Hls.Events.MEDIA_ATTACHED, () => {
					hlsInstance.loadSource(src);
				});

				hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
					isMediaReady = true;
					resolve();
				});

				hlsInstance.on(Hls.Events.ERROR, (event, data) => {
					console.log('HLS Error:', data.type, data.details, data.fatal);
					if (data.fatal) {
						switch (data.type) {
							case Hls.ErrorTypes.NETWORK_ERROR:
								console.log('fatal network error encountered, trying to recover');
								isMediaReady = false;
								hlsInstance.startLoad();
								break;
							case Hls.ErrorTypes.MEDIA_ERROR:
								console.log('fatal media error encountered, trying to recover');
								isMediaReady = false;
								hlsInstance.recoverMediaError();
								break;
							default:
								console.error('Fatal error, cannot recover');
								isMediaReady = false;
								reject(new Error('Fatal HLS error'));
								break;
						}
					}
				});
			});

			return () => {
				hlsInstance.destroy();
			};
		} else if (element.canPlayType('application/vnd.apple.mpegurl')) {
			mediaReadyPromise = new Promise((resolve) => {
				element.src = src;
				element.addEventListener(
					'loadedmetadata',
					() => {
						isMediaReady = true;
						resolve();
					},
					{ once: true }
				);
			});
		}
	});

	const destroyHls = () => {
		if (hls) {
			hls.destroy();
			hls = undefined;
		}
		isMediaReady = false;
		mediaReadyPromise = null;
	};

	onDestroy(() => {
		destroyHls();
		audioControl.setAudioElement(undefined);
		audioControl.reset();
	});
</script>

<div
	class="w-full max-w-2xl rounded-lg bg-slate-100 px-6 py-4 shadow-inner sm:rounded-full sm:px-12 dark:bg-slate-950"
>
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
				<PlayPauseButton
					isPlaying={$audioControl.isPlaying}
					playToggle={handlePlayPause}
					isDisabled={isLoading}
				/>
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
