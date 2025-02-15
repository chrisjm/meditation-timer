<script lang="ts">
	import TimerDisplay from '$lib/components/TimerDisplay.svelte';
	import TimerControls from '$lib/components/TimerControls.svelte';
	import TimerPresets from '$lib/components/TimerPresets.svelte';
	import AudioElements from '$lib/components/AudioElements.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { Cog } from 'lucide-svelte';
	import { timerSettings } from '$lib/stores/timerSettings';
	import { masterTimer, progress } from '$lib/stores/masterTimer';
	import { shouldPlayInterval } from '$lib/stores/intervalHandler';

	// Screen wake lock
	let wakeLock = $state<WakeLockSentinel | null>(null);

	// UI state
	let isSettingsOpen = $state(false);

	// Audio elements
	let startBell = $state<HTMLAudioElement | undefined>();
	let intervalBell = $state<HTMLAudioElement | undefined>();
	let backgroundMusic = $state<HTMLAudioElement | undefined>();

	// Subscribe to interval changes
	$effect(() => {
		if ($shouldPlayInterval && $timerSettings.bellSoundEnabled && intervalBell) {
			// Reset the audio before playing
			intervalBell.currentTime = 0;
			intervalBell.play().catch(err => {
				console.error('Failed to play interval bell:', err);
			});
		}
	});

	// Subscribe to timer completion
	$effect(() => {
		if ($masterTimer.isRunning && $masterTimer.currentTime === 0) {
			if ($timerSettings.bellSoundEnabled) startBell?.play();
			stopAudio();
		}
	});

	// Timer controls
	async function startMeditation() {
		if (!$masterTimer.isRunning) {
			// Request wake lock to keep screen on
			try {
				wakeLock = await navigator.wakeLock?.request('screen');
			} catch (err) {
				console.log(`Failed to request wake lock: ${err}`);
			}

			if ($timerSettings.bellSoundEnabled) startBell?.play();
			if ($timerSettings.backgroundMusicEnabled) backgroundMusic?.play();
			masterTimer.start($timerSettings.duration);
		}
	}

	function stopAudio() {
		if (startBell) {
			startBell.pause();
			startBell.currentTime = 0;
		}
		if (intervalBell) {
			intervalBell.pause();
			intervalBell.currentTime = 0;
		}
		if (backgroundMusic) {
			backgroundMusic.pause();
			backgroundMusic.currentTime = 0;
		}
	}

	function pauseMeditation() {
		masterTimer.pause();
		if ($masterTimer.isPaused) {
			stopAudio();
		} else {
			if ($timerSettings.backgroundMusicEnabled) backgroundMusic?.play();
		}
	}

	function resetMeditation() {
		masterTimer.reset();
		stopAudio();

		// Release wake lock
		wakeLock
			?.release()
			.then(() => {
				wakeLock = null;
			})
			.catch((err) => {
				console.log(`Failed to release wake lock: ${err}`);
			});
	}

	function setDuration(minutes: number) {
		if (!$masterTimer.isRunning) {
			$timerSettings.duration = minutes * 60;
			masterTimer.reset();
		}
	}
</script>

<div class="relative min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-900">
	<!-- Settings Button -->
	<button
		onclick={() => (isSettingsOpen = !isSettingsOpen)}
		class="fixed top-4 right-4 rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700"
	>
		<Cog class="h-6 w-6 text-gray-600 dark:text-gray-300" />
	</button>
	<AudioElements bind:startBell bind:intervalBell bind:backgroundMusic />
	<SettingsPanel
		bind:isOpen={isSettingsOpen}
		{backgroundMusic}
		isRunning={$masterTimer.isRunning}
		on:close={() => (isSettingsOpen = false)}
		on:intervalChange={(e) => ($timerSettings.intervalTime = e.detail)}
		on:backgroundMusicChange={(e) => ($timerSettings.backgroundMusicEnabled = e.detail)}
		on:bellSoundChange={(e) => ($timerSettings.bellSoundEnabled = e.detail)}
	/>
	<main class="mx-auto max-w-3xl text-center">
		<!-- Header -->
		<h1 class="mb-8 text-4xl font-bold text-slate-800 dark:text-slate-100">Meditation Timer</h1>

		<TimerDisplay progress={$progress} time={$masterTimer.currentTime} />

		<TimerControls
			isRunning={$masterTimer.isRunning}
			isPaused={$masterTimer.isPaused}
			onStart={startMeditation}
			onPause={pauseMeditation}
			onReset={resetMeditation}
		/>

		<TimerPresets duration={$timerSettings.duration} onSetDuration={setDuration} />
	</main>
</div>
