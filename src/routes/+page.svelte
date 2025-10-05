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
	import { masterTimer, progress, isRunning, isPaused } from '$lib/stores/masterTimer';
	import { shouldPlayInterval } from '$lib/stores/intervalHandler';
	import { audio } from '$lib/stores/audio';
	import Credits from '$lib/components/Credits.svelte';
	import { Confetti } from 'svelte-confetti';
	import { useWakeLock } from '$lib/composables/useWakeLock.svelte';
	import { useMeditationAudio } from '$lib/composables/useMeditationAudio.svelte';
	import { AUDIO_CONFIG } from '$lib/config/audio';

	const wakeLock = useWakeLock();
	const meditationAudio = useMeditationAudio();

	let isBellPlaying = $derived($audio.bells.activeAudio.size > 0);
	let isSettingsOpen = $state(false);
	let showConfetti = $state(false);

	$effect(() => {
		meditationAudio.updateStartBellVolume($timerSettings.startStopBellVolume);
	});

	$effect(() => {
		meditationAudio.updateIntervalBellVolume($timerSettings.intervalBellVolume);
	});

	$effect(() => {
		if ($shouldPlayInterval && $timerSettings.intervalBellEnabled) {
			meditationAudio.playIntervalBell();
		}
	});

	async function handleMeditationComplete() {
		await meditationAudio.stopAll();

		if ($timerSettings.startStopBellEnabled) {
			await meditationAudio.playStartBell();
		}

		await wakeLock.release();
		masterTimer.reset();
		showConfetti = true;
		modalStore.open("Great job! You've completed your meditation session.");
	}

	async function handleMeditationStop() {
		await meditationAudio.stopAll();
		await wakeLock.release();
		masterTimer.reset();
	}

	$effect(() => {
		if ($isRunning && $masterTimer.currentTime === 0) {
			handleMeditationComplete();
		}
	});

	async function startMeditation() {
		if (!$isRunning) {
			await meditationAudio.initializeMobileAudio();
			await wakeLock.acquire();

			if ($timerSettings.startStopBellEnabled) {
				await meditationAudio.playStartBell();
			}

			masterTimer.start($timerSettings.duration, $timerSettings.isDebugMode);
		}
	}

	async function pauseMeditation() {
		masterTimer.pause();
		if ($isPaused) {
			await meditationAudio.stopAll();
			await wakeLock.release();
		}
	}

	async function resetMeditation() {
		await handleMeditationStop();
	}

	function setDuration(minutes: number) {
		if (!$isRunning) {
			$timerSettings.duration = minutes * 60;
			masterTimer.reset();
		}
	}

	const handleCloseModal = async () => {
		if ($audio.hls.isPlaying) {
			audio.hls.setPlaying(false);
		}
		showConfetti = false;
		modalStore.close();
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
