<script lang="ts">
	import TimerDisplay from '$lib/components/TimerDisplay.svelte';
	import TimerControls from '$lib/components/TimerControls.svelte';
	import TimerPresets from '$lib/components/TimerPresets.svelte';
	import AudioElements from '$lib/components/AudioElements.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { Cog } from 'lucide-svelte';
	import { timerSettings } from '$lib/stores/timerSettings';

	// Screen wake lock
	let wakeLock = $state<WakeLockSentinel | null>(null);

	// UI state
	let isSettingsOpen = $state(false);

	// Audio elements
	let startBell = $state<HTMLAudioElement | undefined>();
	let intervalBell = $state<HTMLAudioElement | undefined>();
	let backgroundMusic = $state<HTMLAudioElement | undefined>();

	// Timer runtime state using Svelte 5's $state decorator
	let currentTime = $state($timerSettings.duration);
	let isRunning = $state(false);
	let isPaused = $state(false);
	let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);
	let lastIntervalTime = $state(0); // Track last interval bell time

	// Computed values
	let progress = $derived(($timerSettings.duration - currentTime) / $timerSettings.duration);

	// Timer controls
	async function startMeditation() {
		if (!isRunning) {
			isRunning = true;
			isPaused = false;

			// Request wake lock to keep screen on
			try {
				wakeLock = await navigator.wakeLock?.request('screen');
			} catch (err) {
				console.log(`Failed to request wake lock: ${err}`)
			}

			if ($timerSettings.bellSoundEnabled) startBell?.play();
			if ($timerSettings.backgroundMusicEnabled) backgroundMusic?.play();
			startTimer();
		}
	}

	function startTimer() {
		lastIntervalTime = currentTime;
		timerInterval = setInterval(() => {
			if (!isPaused) {
				currentTime--;
				// Play interval bell every intervalTime seconds
				if (lastIntervalTime - currentTime >= $timerSettings.intervalTime) {
					if ($timerSettings.bellSoundEnabled) intervalBell?.play();
					lastIntervalTime = currentTime;
				}
				if (currentTime === 0) {
					if (timerInterval) clearInterval(timerInterval);
					isRunning = false;
					if ($timerSettings.bellSoundEnabled) startBell?.play(); // Use start bell as completion sound
					if (backgroundMusic) {
						backgroundMusic.pause();
						backgroundMusic.currentTime = 0;
					}
				}
			}
		}, 1000);
	}

	function pauseMeditation() {
		isPaused = !isPaused;
		if (isPaused) {
			// Pause background music
			backgroundMusic?.pause();
			// Stop any currently playing bell sounds
			if (startBell) {
				startBell.pause();
				startBell.currentTime = 0;
			}
			if (intervalBell) {
				intervalBell.pause();
				intervalBell.currentTime = 0;
			}
		} else {
			// Resume background music if enabled
			if ($timerSettings.backgroundMusicEnabled) backgroundMusic?.play();
		}
	}

	function resetMeditation() {
		if (timerInterval) clearInterval(timerInterval);
		isRunning = false;
		isPaused = false;

		currentTime = $timerSettings.duration;
		timerInterval = null;
		if (backgroundMusic) {
			backgroundMusic.pause();
			backgroundMusic.currentTime = 0;
		}

		// Release wake lock
		wakeLock?.release()
			.then(() => {
				wakeLock = null;
			})
			.catch((err) => {
				console.log(`Failed to release wake lock: ${err}`);
			});
	}

	function setDuration(minutes: number) {
		if (!isRunning) {
			$timerSettings.duration = minutes * 60;
			currentTime = $timerSettings.duration;
		}
	}
</script>

<div class="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-900 relative">
	<!-- Settings Button -->
	<button
		onclick={() => isSettingsOpen = !isSettingsOpen}
		class="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
		<Cog class="w-6 h-6 text-gray-600 dark:text-gray-300" />
	</button>
	<AudioElements bind:startBell bind:intervalBell bind:backgroundMusic />
	<SettingsPanel
		bind:isOpen={isSettingsOpen}
		intervalTime={$timerSettings.intervalTime}
		backgroundMusicEnabled={$timerSettings.backgroundMusicEnabled}
		bellSoundEnabled={$timerSettings.bellSoundEnabled}
		{backgroundMusic}
		{isRunning}
		on:close={() => isSettingsOpen = false}
		on:intervalChange={(e) => $timerSettings.intervalTime = e.detail}
		on:backgroundMusicChange={(e) => $timerSettings.backgroundMusicEnabled = e.detail}
		on:bellSoundChange={(e) => $timerSettings.bellSoundEnabled = e.detail}
	/>
	<main class="mx-auto max-w-3xl text-center">
		<!-- Header -->
		<h1 class="mb-8 text-4xl font-bold text-slate-800 dark:text-slate-100">Meditation Timer</h1>

		<TimerDisplay
			{progress}
			time={currentTime}
		/>

		<TimerControls
			{isRunning}
			{isPaused}
			onStart={startMeditation}
			onPause={pauseMeditation}
			onReset={resetMeditation}
		/>

		<TimerPresets
			duration={$timerSettings.duration}
			onSetDuration={setDuration}
		/>
	</main>
</div>
