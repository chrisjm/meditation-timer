<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { modalStore } from '$lib/stores/modal';
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
	import { audioControl } from '$lib/stores/audioControl';
	import Credits from '$lib/components/Credits.svelte';
	import { Confetti } from 'svelte-confetti';

	// Computed state for bell playing status
	let isBellPlaying = $derived($audioState.activeAudio.size > 0);

	// Screen wake lock
	let wakeLock = $state<WakeLockSentinel | null>(null);

	// UI state
	let isSettingsOpen = $state(false);
	let showConfetti = $state(false);

	// Audio elements
	let startBell = $state<HTMLAudioElement | undefined>();
	let intervalBell = $state<HTMLAudioElement | undefined>();

	// Initialize audio event listeners and volume settings
	$effect(() => {
		if (startBell) {
			startBell.addEventListener('ended', () => audioState.trackAudio(startBell, false));
			startBell.addEventListener('play', () => audioState.trackAudio(startBell, true));
			startBell.volume = $timerSettings.startStopBellVolume;
		}
		if (intervalBell) {
			intervalBell.addEventListener('ended', () => audioState.trackAudio(intervalBell, false));
			intervalBell.addEventListener('play', () => audioState.trackAudio(intervalBell, true));
			intervalBell.volume = $timerSettings.intervalBellVolume;
		}
	});

	// Update volumes when settings change
	$effect(() => {
		if (startBell) {
			startBell.volume = $timerSettings.startStopBellVolume;
		}
	});

	$effect(() => {
		if (intervalBell) {
			intervalBell.volume = $timerSettings.intervalBellVolume;
		}
	});

	// Subscribe to interval changes
	$effect(() => {
		if ($shouldPlayInterval && $timerSettings.intervalBellEnabled && intervalBell) {
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
		if ($timerSettings.startStopBellEnabled && startBell) {
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

		// Trigger confetti celebration
		showConfetti = true;

		// Show completion modal
		modalStore.open("Great job! You've completed your meditation session.");
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
			if ($timerSettings.startStopBellEnabled && startBell) {
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

	const handleCloseModal = async () => {
		if ($audioControl.isPlaying) {
			audioControl.setPlaying(false);
		}
		showConfetti = false;
		modalStore.close();
	};
</script>

<div
	class="relative flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
>
	<!-- Settings Button -->
	<button
		onclick={() => (isSettingsOpen = !isSettingsOpen)}
		class="fixed top-4 right-4 cursor-pointer rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700"
		aria-label="Toggle settings panel"
		aria-expanded={isSettingsOpen}
		aria-controls="settings-panel"
		tabindex="0"
	>
		<Cog class="h-6 w-6 text-gray-600 dark:text-gray-300" />
	</button>
	<AudioElements bind:startBell bind:intervalBell />
	<SettingsPanel isOpen={isSettingsOpen} onClose={() => (isSettingsOpen = false)} />
	<main class="mx-auto w-full max-w-3xl text-center">
		<!-- Header -->
		<h1 class="mb-8 text-4xl font-light tracking-wide text-slate-800 dark:text-slate-100">
			Meditation Timer
		</h1>

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
	<div class="mx-auto mt-8 w-full max-w-lg">
		<HLSAudioPlayer
			src="https://wanderingleafstudios.s3.us-west-1.amazonaws.com/audio/meditation-opus/meditation-opus.m3u8"
			segments={[
				{ color: '#FF0000', length: 540, description: '174 Hz - Comfort & Security' },
				{ color: '#FF4500', length: 540, description: '285 Hz - Healing & Rejuvenation' },
				{ color: '#FFA500', length: 540, description: '396 Hz - Liberating Guilt & Fear' },
				{
					color: '#FFD700',
					length: 540,
					description: '417 Hz - Undoing Situations & Facilitating Change'
				},
				{
					color: '#32CD32',
					length: 540,
					description: '528 Hz - Transformation & Positivity (DNA Repair)'
				},
				{ color: '#4169E1', length: 540, description: '639 Hz - Connecting & Relationships' },
				{ color: '#4B0082', length: 540, description: '741 Hz - Detox' },
				{ color: '#8A2BE2', length: 540, description: '852 Hz – Raise Energy' },
				{ color: '#9932CC', length: 540, description: '963 Hz – Intuitive Awakening' }
			]}
		/>
	</div>

	<div class="mx-auto pt-8">
		<Credits />
	</div>
</div>

<Modal isOpen={$modalStore.isOpen} title="Meditation Complete" close={handleCloseModal}>
	{#if showConfetti}
		<div
			class="pointer-events-none fixed -top-[50px] left-0 flex h-screen w-screen justify-center overflow-hidden"
		>
			<Confetti
				x={[-5, 5]}
				y={[0, 0.1]}
				delay={[500, 2000]}
				infinite={true}
				duration={5000}
				amount={500}
				fallDistance="100vh"
			/>
		</div>
	{/if}
	<div class="space-y-4 text-center">
		<p class="text-gray-600 dark:text-gray-300">{$modalStore.message}</p>
		<button
			onclick={handleCloseModal}
			class="rounded-lg bg-purple-500 px-6 py-2 font-medium text-white
				transition-colors duration-200 hover:bg-purple-600"
			aria-label="Close meditation complete dialog"
		>
			Finish Meditation
		</button>
	</div>
</Modal>
