<script lang="ts">
	import TimerDisplay from '$lib/components/TimerDisplay.svelte';
	import TimerControls from '$lib/components/TimerControls.svelte';
	import TimerPresets from '$lib/components/TimerPresets.svelte';
	import AudioElements from '$lib/components/AudioElements.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { Cog } from 'lucide-svelte';
	import HLSAudioPlayer from '$lib/components/HLSAudioPlayer.svelte';
	import { timerSettings } from '$lib/stores/timerSettings';
	import { masterTimer, progress } from '$lib/stores/masterTimer';
	import { shouldPlayInterval } from '$lib/stores/intervalHandler';
	import { audioState } from '$lib/stores/audioState';

	// Computed state for bell playing status
	let isBellPlaying = $derived($audioState.activeAudio.size > 0);

	// Screen wake lock
	let wakeLock = $state<WakeLockSentinel | null>(null);

	// UI state
	let isSettingsOpen = $state(false);

	// Audio elements
	let startBell = $state<HTMLAudioElement | undefined>();
	let intervalBell = $state<HTMLAudioElement | undefined>();

	// Initialize audio event listeners
	$effect(() => {
		if (startBell) {
			startBell.addEventListener('ended', () => audioState.trackAudio(startBell, false));
			startBell.addEventListener('play', () => audioState.trackAudio(startBell, true));
		}
		if (intervalBell) {
			intervalBell.addEventListener('ended', () => audioState.trackAudio(intervalBell, false));
			intervalBell.addEventListener('play', () => audioState.trackAudio(intervalBell, true));
		}
	});

	// Subscribe to interval changes
	$effect(() => {
		if ($shouldPlayInterval && $timerSettings.bellSoundEnabled && intervalBell) {
			// Reset and play the interval bell
			intervalBell.currentTime = 0;

			// Create a promise that resolves when the audio is ready
			const playWhenReady = async () => {
				try {
					// First try to load the audio
					await intervalBell?.load();
					// Then try to play it
					await intervalBell?.play();
				} catch (err) {
					console.error('Failed to play interval bell:', err);
					audioState.trackAudio(intervalBell, false);
				}
			};

			playWhenReady();
		}
	});

	// Handle meditation completion with final bell
	async function handleMeditationComplete() {
		await handleAudio('stop');

		// Play the final bell if enabled
		if ($timerSettings.bellSoundEnabled && startBell) {
			try {
				startBell.currentTime = 0;
				await startBell.play();
			} catch (err) {
				console.error('Failed to play final bell:', err);
				audioState.trackAudio(startBell, false);
			}
		}

		await handleWakeLock('release');
		masterTimer.reset();
	}

	// Handle meditation stop without final bell
	async function handleMeditationStop() {
		await handleAudio('stop');
		await handleWakeLock('release');
		masterTimer.reset();
	}

	// Subscribe to timer completion
	$effect(() => {
		if ($masterTimer.isRunning && $masterTimer.currentTime === 0) {
			handleMeditationComplete();
		}
	});

	// Timer controls
	async function startMeditation() {
		if (!$masterTimer.isRunning) {
			await handleWakeLock('acquire');

			// Play start bell first if enabled
			if ($timerSettings.bellSoundEnabled && startBell) {
				try {
					// First try to load the audio
					await startBell.load();
					startBell.currentTime = 0;
					await startBell.play();
				} catch (err) {
					console.error('Failed to play start bell:', err);
					audioState.trackAudio(startBell, false);
					// Continue with meditation even if bell fails
				}
			}

			masterTimer.start($timerSettings.duration, $timerSettings.isDebugMode);
		}
	}

	async function handleAudio(action: 'stop' | 'resume') {
		const audioElements = [startBell, intervalBell].filter(
			(audio): audio is HTMLAudioElement => audio !== undefined
		);

		if (action === 'stop') {
			await Promise.all(
				audioElements.map(async (audio) => {
					await audio.pause();
					audio.currentTime = 0;
					audioState.trackAudio(audio, false);
				})
			);
		} else if (action === 'resume' && !$masterTimer.isPaused) {
			// Do nothing
		}
	}

	async function handleWakeLock(action: 'acquire' | 'release') {
		if (action === 'acquire' && !wakeLock) {
			try {
				wakeLock = await navigator.wakeLock?.request('screen');
			} catch (err) {
				console.log(`Failed to request wake lock: ${err}`);
			}
		} else if (action === 'release' && wakeLock) {
			try {
				await wakeLock.release();
				wakeLock = null;
			} catch (err) {
				console.log(`Failed to release wake lock: ${err}`);
			}
		}
	}

	async function pauseMeditation() {
		masterTimer.pause();
		if ($masterTimer.isPaused) {
			await handleAudio('stop');
			await handleWakeLock('release');
		} else {
			await handleAudio('resume');
		}
	}

	async function resetMeditation() {
		await handleMeditationStop();
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
	<AudioElements bind:startBell bind:intervalBell />
	<SettingsPanel
		bind:isOpen={isSettingsOpen}
		isRunning={$masterTimer.isRunning}
		bellSound={intervalBell}
		on:close={() => (isSettingsOpen = false)}
		on:intervalChange={(e) => ($timerSettings.intervalTime = e.detail)}
		on:bellSoundChange={(e) => ($timerSettings.bellSoundEnabled = e.detail)}
	/>
	<main class="mx-auto max-w-3xl text-center">
		<!-- Header -->
		<h1 class="mb-8 text-4xl font-bold text-slate-800 dark:text-slate-100">Meditation Timer</h1>

		<TimerDisplay progress={$progress} time={$masterTimer.currentTime} {isBellPlaying} />

		<TimerControls
			isRunning={$masterTimer.isRunning}
			isPaused={$masterTimer.isPaused}
			onStart={startMeditation}
			onPause={pauseMeditation}
			onReset={resetMeditation}
		/>

		<TimerPresets duration={$timerSettings.duration} onSetDuration={setDuration} />
	</main>
	<div class="mx-auto mt-8 max-w-lg">
		<HLSAudioPlayer
			src="https://wanderingleafstudios.s3.us-west-1.amazonaws.com/audio/meditation-opus/meditation-opus.m3u8"
			segments={[
				{ color: '#FF0000', length: 540, description: '174 Hz - Comfort and Security' },
				{ color: '#FF4500', length: 540, description: '285 Hz - Healing and Rejuvenation' },
				{ color: '#FFA500', length: 540, description: '396 Hz - Liberating Guilt and Fear' },
				{
					color: '#FFD700',
					length: 540,
					description: '417 Hz - Undoing Situations and Facilitating Change'
				},
				{
					color: '#32CD32',
					length: 540,
					description: '528 Hz - Transformation and Miracles (DNA Repair)'
				},
				{ color: '#4169E1', length: 540, description: '639 Hz - Connecting/Relationships' },
				{ color: '#4B0082', length: 540, description: '741 Hz - Expression/Solutions' },
				{ color: '#8A2BE2', length: 540, description: '852 Hz – Returning to Spiritual Order' },
				{ color: '#9932CC', length: 540, description: '963 Hz – Intuitive Awakening' }
			]}
		/>
	</div>
</div>
