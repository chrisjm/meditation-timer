<script lang="ts">
	import Hls from 'hls.js';
	import { onDestroy } from 'svelte';
	import { Play, Pause, Volume2, VolumeX } from 'lucide-svelte';

	const { src, preload = 'auto', loop = false } = $props<{
		src: string;
		preload?: string;
		loop?: boolean;
	}>();

	let audioElement: HTMLAudioElement | undefined;
	let hls: Hls | undefined;
	let isPlaying = $state(false);
	let isMuted = $state(false);
	let currentTime = $state(0);
	let duration = $state(0);
	let volume = $state(1);

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

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

	function handleSeek(e: Event) {
		if (!audioElement) return;
		const target = e.target as HTMLInputElement;
		audioElement.currentTime = Number(target.value);
	}

	function handleVolumeChange(e: Event) {
		if (!audioElement) return;
		const target = e.target as HTMLInputElement;
		volume = Number(target.value);
		audioElement.volume = volume;
	}

	$effect(() => {
		if (!audioElement) return;
		audioElement.addEventListener('play', () => isPlaying = true);
		audioElement.addEventListener('pause', () => isPlaying = false);
		audioElement.addEventListener('timeupdate', handleTimeUpdate);
		audioElement.addEventListener('durationchange', handleDurationChange);
	});

	onDestroy(() => {
		destroyHls();
		if (audioElement) {
			audioElement.removeEventListener('play', () => isPlaying = true);
			audioElement.removeEventListener('pause', () => isPlaying = false);
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
	<audio
		bind:this={audioElement}
		{preload}
		{loop}
		class="hidden"
	></audio>
	<div class="flex flex-col gap-4">
		<!-- Time slider -->
		<div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
			<span>{formatTime(currentTime)}</span>
			<input
				type="range"
				min="0"
				max={duration || 100}
				value={currentTime}
				oninput={handleSeek}
				class="flex-1 h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700"
			/>
			<span>{formatTime(duration || 0)}</span>
		</div>

		<!-- Controls -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-4">
				<button
					onclick={handlePlayPause}
					class="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
					aria-label={isPlaying ? 'Pause' : 'Play'}
				>
					{#if isPlaying}
						<Pause class="w-6 h-6 text-slate-700 dark:text-slate-200" />
					{:else}
						<Play class="w-6 h-6 text-slate-700 dark:text-slate-200" />
					{/if}
				</button>

				<div class="flex items-center gap-2">
					<button
						onclick={handleVolumeToggle}
						class="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
						aria-label={isMuted ? 'Unmute' : 'Mute'}
					>
						{#if isMuted}
							<VolumeX class="w-6 h-6 text-slate-700 dark:text-slate-200" />
						{:else}
							<Volume2 class="w-6 h-6 text-slate-700 dark:text-slate-200" />
						{/if}
					</button>
					<input
						type="range"
						min="0"
						max="1"
						step="0.1"
						value={volume}
						oninput={handleVolumeChange}
						class="w-24 h-2 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700"
					/>
				</div>
			</div>
		</div>
	</div>
</div>
