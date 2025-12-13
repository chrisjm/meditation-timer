<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import { modalState, openModal, closeModal } from '$lib/stores/modal.svelte';
	import TimerDisplay from '$lib/components/TimerDisplay.svelte';
	import TimerControls from '$lib/components/TimerControls.svelte';
	import TimerPresets from '$lib/components/TimerPresets.svelte';
	import AudioElements from '$lib/components/AudioElements.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import { Cog } from 'lucide-svelte';
	import HLSAudioPlayer from '$lib/components/HLSAudioPlayer.svelte';
	import { timerSettings, updateTimerSettings } from '$lib/stores/timerSettings.svelte';
	import { masterTimer, progress, isRunning, isPaused } from '$lib/stores/masterTimer.svelte';
	import { shouldPlayInterval } from '$lib/stores/intervalHandler.svelte';
	import { audio } from '$lib/stores/audio.svelte';
	import Credits from '$lib/components/Credits.svelte';
	import { Confetti } from 'svelte-confetti';
	import { useWakeLock } from '$lib/composables/useWakeLock.svelte';
	import { useMeditationAudio } from '$lib/composables/useMeditationAudio.svelte';
	import { AUDIO_CONFIG } from '$lib/config/audio';
	import { getAudioUnlocked, isMobile } from '$lib/utils/mobileAudioManager';

	const wakeLock = useWakeLock();
	const meditationAudio = useMeditationAudio();
	const isMobileDevice = isMobile();

	let isBellPlaying = $derived($audio.bells.activeAudio.size > 0);
	let isSettingsOpen = $state(false);
	let showConfetti = $state(false);
	let hasInitializedIdleDuration = $state(false);
	let isMobileEnableOverlayOpen = $state(false);
	let isMobileEnableOverlayLoading = $state(false);

	$effect(() => {
		if ($timerSettings.isDebugMode) {
			console.debug('[page] updating start bell volume', {
				volume: $timerSettings.startStopBellVolume
			});
		}

		meditationAudio.updateStartBellVolume($timerSettings.startStopBellVolume);
	});

	$effect(() => {
		if ($timerSettings.isDebugMode) {
			console.debug('[page] updating interval bell volume', {
				volume: $timerSettings.intervalBellVolume
			});
		}

		meditationAudio.updateIntervalBellVolume($timerSettings.intervalBellVolume);
	});

	$effect(() => {
		const intervalIndex = $shouldPlayInterval;
		if (typeof intervalIndex !== 'number' || !$timerSettings.intervalBellEnabled) {
			return;
		}

		if (isBellPlaying) {
			if ($timerSettings.isDebugMode) {
				console.debug('[page] skipping interval bell because a bell is already playing', {
					isBellPlaying,
					intervalIndex,
					currentTime: $masterTimer.currentTime,
					initialDuration: $masterTimer.initialDuration,
					progress: $progress
				});
			}
			return;
		}

		if ($timerSettings.isDebugMode) {
			console.debug('[page] interval effect triggered', {
				intervalIndex,
				intervalBellEnabled: $timerSettings.intervalBellEnabled,
				currentTime: $masterTimer.currentTime,
				initialDuration: $masterTimer.initialDuration,
				progress: $progress
			});
		}

		meditationAudio.playIntervalBell();
	});

	$effect(() => {
		if (hasInitializedIdleDuration) {
			return;
		}

		if ($masterTimer.initialDuration === 0 && $timerSettings.duration > 0) {
			if ($timerSettings.isDebugMode) {
				console.debug('[page] initializing idle duration from settings', {
					settingsDuration: $timerSettings.duration
				});
			}

			masterTimer.setIdleDuration($timerSettings.duration);
			hasInitializedIdleDuration = true;
		}
	});

	async function handleMeditationComplete() {
		if ($timerSettings.isDebugMode) {
			console.debug('[page] handleMeditationComplete invoked', {
				currentTime: $masterTimer.currentTime,
				initialDuration: $masterTimer.initialDuration
			});
		}

		await meditationAudio.stopAll();

		if ($timerSettings.startStopBellEnabled) {
			await meditationAudio.playStartBell();
		}

		if (isMobileDevice) {
			await wakeLock.release();
		}
		masterTimer.reset();
		showConfetti = true;
		openModal("Great job! You've completed your meditation session.");
	}

	async function handleMeditationStop() {
		if ($timerSettings.isDebugMode) {
			console.debug('[page] handleMeditationStop invoked', {
				currentTime: $masterTimer.currentTime,
				initialDuration: $masterTimer.initialDuration
			});
		}

		await meditationAudio.stopAll();
		if (isMobileDevice) {
			await wakeLock.release();
		}
		masterTimer.reset();
	}

	$effect(() => {
		if ($isRunning && $masterTimer.currentTime === 0) {
			if ($timerSettings.isDebugMode) {
				console.debug('[page] completion effect triggered', {
					isRunning: $isRunning,
					currentTime: $masterTimer.currentTime,
					initialDuration: $masterTimer.initialDuration
				});
			}

			handleMeditationComplete();
		}
	});

	const closeMobileEnableOverlay = () => {
		if (isMobileEnableOverlayLoading) {
			return;
		}
		isMobileEnableOverlayOpen = false;
	};

	const handleMobileEnableOverlayKeyDown = (event: KeyboardEvent) => {
		if (event.key !== 'Escape') {
			return;
		}
		closeMobileEnableOverlay();
	};

	const startMeditationCore = async () => {
		if ($timerSettings.startStopBellEnabled) {
			if ($timerSettings.isDebugMode) {
				console.debug('[page] playing start bell on start');
			}

			await meditationAudio.playStartBell();
		}

		masterTimer.start($timerSettings.duration);
	};

	const handleEnableMobileAndStart = async () => {
		if (isMobileEnableOverlayLoading) {
			return;
		}

		isMobileEnableOverlayLoading = true;
		audio.hls.setPlayingAndSyncElement(true);
		const audioInitPromise = meditationAudio.initializeMobileAudio();
		const wakeLockPromise = wakeLock.acquire();
		await Promise.all([audioInitPromise, wakeLockPromise]);
		isMobileEnableOverlayOpen = false;
		isMobileEnableOverlayLoading = false;
		await startMeditationCore();
	};

	async function startMeditation() {
		if ($isRunning) {
			return;
		}

		if ($timerSettings.isDebugMode) {
			console.debug('[page] startMeditation invoked', {
				currentTime: $masterTimer.currentTime,
				initialDuration: $masterTimer.initialDuration,
				settingsDuration: $timerSettings.duration,
				isDebugMode: $timerSettings.isDebugMode,
				isMobileDevice
			});
		}

		if (isMobileDevice && (!getAudioUnlocked() || !$audio.hls.isPlaying)) {
			isMobileEnableOverlayOpen = true;
			return;
		}

		if (isMobileDevice) {
			await wakeLock.acquire();
		}

		await startMeditationCore();
	}

	async function pauseMeditation() {
		const wasPaused = $isPaused;
		if ($timerSettings.isDebugMode) {
			console.debug('[page] pauseMeditation invoked', {
				wasPaused,
				isRunning: $isRunning,
				currentTime: $masterTimer.currentTime
			});
		}

		masterTimer.pause();

		// If we just paused (was running, now paused), stop audio and release wake lock
		if (!wasPaused && $isPaused) {
			if ($timerSettings.isDebugMode) {
				console.debug(
					'[page] pause detected (running -> paused), stopping audio and releasing wake lock'
				);
			}

			await meditationAudio.stopAll();
			if (isMobileDevice) {
				await wakeLock.release();
			}
		}
		// If we just resumed (was paused, now running), reacquire wake lock
		else if (wasPaused && !$isPaused) {
			if ($timerSettings.isDebugMode) {
				console.debug('[page] resume detected (paused -> running), acquiring wake lock');
			}

			if (isMobileDevice) {
				await wakeLock.acquire();
			}
		}
	}

	async function resetMeditation() {
		if ($timerSettings.isDebugMode) {
			console.debug('[page] resetMeditation invoked');
		}

		await handleMeditationStop();
	}

	function setDuration(minutes: number) {
		if ($isRunning) {
			return;
		}

		const newDurationInSeconds = minutes * 60;

		updateTimerSettings((settings) => ({
			...settings,
			duration: newDurationInSeconds
		}));
		masterTimer.setIdleDuration(newDurationInSeconds);
	}

	const handleCloseModal = async () => {
		if ($audio.hls.isPlaying) {
			audio.hls.setPlayingAndSyncElement(false);
		}
		showConfetti = false;
		closeModal();
	};
</script>

<div
	class="relative flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-8 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
>
	<button
		data-testid="settings-button"
		onclick={() => (isSettingsOpen = !isSettingsOpen)}
		class="fixed top-4 right-4 cursor-pointer rounded-full bg-white p-2 shadow-lg transition-colors hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700"
		aria-label="Toggle settings panel"
		aria-expanded={isSettingsOpen}
		aria-controls="settings-panel"
		tabindex="0"
	>
		<Cog class="h-6 w-6 text-gray-600 dark:text-gray-300" />
	</button>
	<AudioElements
		onStartBellReady={meditationAudio.setStartBell}
		onIntervalBellReady={meditationAudio.setIntervalBell}
	/>
	<SettingsPanel isOpen={isSettingsOpen} onClose={() => (isSettingsOpen = false)} />
	{#if isMobileDevice && isMobileEnableOverlayOpen}
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
			role="dialog"
			aria-modal="true"
			aria-label="Enable audio and keep screen awake"
			onkeydown={handleMobileEnableOverlayKeyDown}
			tabindex="0"
		>
			<div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
				<h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">Enable mobile mode</h2>
				<p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
					Mobile browsers may pause timers when the screen locks. This will enable bell audio,
					request Wake Lock (when supported), and start background audio to help the timer stay
					active.
				</p>
				<div class="mt-6 flex flex-col gap-3">
					<button
						onclick={handleEnableMobileAndStart}
						disabled={isMobileEnableOverlayLoading}
						class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-base font-medium text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
						aria-label="Enable audio and start meditation"
					>
						{isMobileEnableOverlayLoading ? 'Enabling…' : 'Enable & Start'}
					</button>
					<button
						onclick={closeMobileEnableOverlay}
						disabled={isMobileEnableOverlayLoading}
						class="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
						aria-label="Cancel enabling mobile mode"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{/if}
	<main class="mx-auto w-full max-w-3xl text-center">
		<h1 class="mb-8 text-4xl font-light tracking-wide text-slate-800 dark:text-slate-100">
			Meditation Timer
		</h1>

		<TimerDisplay progress={$progress} time={$masterTimer.currentTime} {isBellPlaying} />

		<TimerControls
			isRunning={$isRunning}
			isPaused={$isPaused}
			onStart={startMeditation}
			onPause={pauseMeditation}
			onReset={resetMeditation}
		/>

		<TimerPresets duration={$timerSettings.duration} onSetDuration={setDuration} />
	</main>
	<div class="mx-auto mt-8 w-full max-w-lg">
		<HLSAudioPlayer src={AUDIO_CONFIG.hlsUrl} segments={AUDIO_CONFIG.segments} />
	</div>

	<div class="mx-auto pt-8">
		<Credits />
	</div>
</div>

<Modal isOpen={modalState.isOpen} title="Meditation Complete" close={handleCloseModal}>
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
		<p class="text-gray-600 dark:text-gray-300">{modalState.message}</p>
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
