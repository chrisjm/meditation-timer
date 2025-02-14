<script lang="ts">
	import Progress from '$lib/components/Progress.svelte';

	// Audio elements
	let startBell = $state<HTMLAudioElement>();
	let intervalBell = $state<HTMLAudioElement>();
	let backgroundMusic = $state<HTMLAudioElement>();

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
					startBell?.play();
					backgroundMusic?.play();
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
					intervalBell?.play();
					lastIntervalTime = currentTime;
				}
				if (currentTime === 0) {
					if (timerInterval) clearInterval(timerInterval);
					isRunning = false;
					startBell?.play(); // Use start bell as completion sound
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
			backgroundMusic?.play();
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

	// Format time helper
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-900">
	<audio bind:this={startBell} src="/tibetan-bell-ding-b-note.mp3" preload="auto"></audio>
	<audio bind:this={intervalBell} src="/meditation-bell.mp3" preload="auto"></audio>
	<audio bind:this={backgroundMusic} src="/meditation-opus.ogg" preload="auto" loop></audio>
	<main class="mx-auto max-w-3xl text-center">
		<!-- Header -->
		<h1 class="mb-8 text-4xl font-bold text-slate-800 dark:text-slate-100">Meditation Timer</h1>

		<!-- Timer Display -->
		<div class="relative mx-auto mb-8 h-64 w-64">
			<div class="absolute inset-0">
				<Progress
					{progress}
					size={256}
					strokeWidth={8}
					color={isPrepping ? 'rgb(234 179 8)' : 'rgb(16 185 129)'}
				/>
			</div>
			<div class="absolute inset-0 flex items-center justify-center">
				<span class="font-mono text-5xl text-slate-700 dark:text-slate-300">
					{isPrepping ? formatTime(prepTime) : formatTime(currentTime)}
				</span>
			</div>
		</div>

		<!-- Timer Controls -->
		<div class="mb-8 space-x-4">
			{#if !isRunning && !isPrepping}
				<button
					onclick={startMeditation}
					class="rounded-lg bg-emerald-500 px-6 py-2 font-medium text-white
                        transition-colors duration-200 hover:bg-emerald-600"
				>
					Start
				</button>
			{:else}
				<button
					onclick={pauseMeditation}
					class="rounded-lg bg-amber-500 px-6 py-2 font-medium text-white
                        transition-colors duration-200 hover:bg-amber-600"
				>
					{isPaused ? 'Resume' : 'Pause'}
				</button>
				<button
					onclick={resetMeditation}
					class="rounded-lg bg-rose-500 px-6 py-2 font-medium text-white
                        transition-colors duration-200 hover:bg-rose-600"
				>
					Reset
				</button>
			{/if}
		</div>

		<!-- Timer Presets -->
		<div class="mx-auto grid max-w-lg grid-cols-2 gap-4 sm:grid-cols-4">
			{#each [5, 10, 15, 20] as preset}
				<button
					onclick={() => setDuration(preset)}
					class="rounded-lg bg-slate-200 px-4 py-3 text-slate-700
                        transition-colors duration-200
                        hover:bg-slate-300 dark:bg-slate-800
                        dark:text-slate-300 dark:hover:bg-slate-700
                        ${duration === preset * 60 ? 'ring-2 ring-emerald-500' : ''}"
				>
					{preset} min
				</button>
			{/each}
		</div>
	</main>
</div>
