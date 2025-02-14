<script lang="ts">
	import TimerDisplay from '$lib/components/TimerDisplay.svelte';
	import TimerControls from '$lib/components/TimerControls.svelte';
	import TimerPresets from '$lib/components/TimerPresets.svelte';
	import AudioElements from '$lib/components/AudioElements.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { Cog } from 'lucide-svelte';

	// Settings state
	let isSettingsOpen = $state(false);
	let backgroundMusicEnabled = $state(true);
	let bellSoundEnabled = $state(true);

	// Audio elements
	let startBell = $state<HTMLAudioElement | undefined>();
	let intervalBell = $state<HTMLAudioElement | undefined>();
	let backgroundMusic = $state<HTMLAudioElement | undefined>();

	// State using Svelte 5's $state decorator
	let duration = $state(600); // 10 minutes in seconds
	let intervalTime = $state(120); // 2 minutes in seconds for interval bell
	let currentTime = $state(600);
	let isRunning = $state(false);
	let isPaused = $state(false);
	let isPrepping = $state(false);
	let prepTime = $state(10); // 10 seconds prep time
	let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);
	let lastIntervalTime = $state(0); // Track last interval bell time

	// Computed values
	let progress = $derived(isPrepping ? (10 - prepTime) / 10 : (duration - currentTime) / duration);

	// Timer controls
	function startMeditation() {
		if (!isRunning) {
			isPrepping = true;
			// Start prep countdown
			const prepInterval = setInterval(() => {
				prepTime--;
				if (prepTime === 0) {
					clearInterval(prepInterval);
					isPrepping = false;
					isRunning = true;
					isPaused = false;
					if (bellSoundEnabled) startBell?.play();
					if (backgroundMusicEnabled) backgroundMusic?.play();
					startTimer();
				}
			}, 1000);
		}
	}

	function startTimer() {
		lastIntervalTime = currentTime;
		timerInterval = setInterval(() => {
			if (!isPaused) {
				currentTime--;
				// Play interval bell every intervalTime seconds
				if (lastIntervalTime - currentTime >= intervalTime) {
					if (bellSoundEnabled) intervalBell?.play();
					lastIntervalTime = currentTime;
				}
				if (currentTime === 0) {
					if (timerInterval) clearInterval(timerInterval);
					isRunning = false;
					if (bellSoundEnabled) startBell?.play(); // Use start bell as completion sound
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
			backgroundMusic?.pause();
		} else {
			if (backgroundMusicEnabled) backgroundMusic?.play();
		}
	}

	function resetMeditation() {
		if (timerInterval) clearInterval(timerInterval);
		isRunning = false;
		isPaused = false;
		isPrepping = false;
		prepTime = 10;
		currentTime = duration;
		timerInterval = null;
		if (backgroundMusic) {
			backgroundMusic.pause();
			backgroundMusic.currentTime = 0;
		}
	}

	function setDuration(minutes: number) {
		if (!isRunning && !isPrepping) {
			duration = minutes * 60;
			currentTime = duration;
		}
	}
</script>

<div class="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-900 relative">
	<!-- Settings Button -->
	<button
		on:click={() => isSettingsOpen = !isSettingsOpen}
		class="fixed top-4 right-4 p-2 rounded-full bg-white dark:bg-slate-800 shadow-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
		<Cog class="w-6 h-6 text-gray-600 dark:text-gray-300" />
	</button>
	<AudioElements bind:startBell bind:intervalBell bind:backgroundMusic />
	<SettingsPanel
		bind:isOpen={isSettingsOpen}
		bind:prepTime
		bind:intervalTime
		bind:backgroundMusicEnabled
		bind:bellSoundEnabled
		on:close={() => isSettingsOpen = false}
	/>
	<main class="mx-auto max-w-3xl text-center">
		<!-- Header -->
		<h1 class="mb-8 text-4xl font-bold text-slate-800 dark:text-slate-100">Meditation Timer</h1>

		<TimerDisplay
			{progress}
			time={isPrepping ? prepTime : currentTime}
			{isPrepping}
		/>

		<TimerControls
			{isRunning}
			{isPrepping}
			{isPaused}
			onStart={startMeditation}
			onPause={pauseMeditation}
			onReset={resetMeditation}
		/>

		<TimerPresets
			{duration}
			onSetDuration={setDuration}
		/>
	</main>
</div>
