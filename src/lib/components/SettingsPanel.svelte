<script lang="ts">
	import { X } from 'lucide-svelte';
	import { timerSettings } from '$lib/stores/timerSettings';
	import ToggleSwitch from './ToggleSwitch.svelte';
	import IntervalTimeInput from './IntervalTimeInput.svelte';
	import StoreDebugInfo from './StoreDebugInfo.svelte';

	export let isOpen = false;
	export let bellSound: HTMLAudioElement | undefined;
	export let isRunning = false;

	function handleDebugModeChange(event: Event) {
		const value = (event.target as HTMLInputElement).checked;
		timerSettings.update((settings) => ({
			...settings,
			isDebugMode: value
		}));
	}

	function handleIntervalTimeChange(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		timerSettings.update((settings) => ({
			...settings,
			intervalTime: value
		}));
	}

	function handleBackgroundMusicChange(event: Event) {
		const value = (event.target as HTMLInputElement).checked;
		timerSettings.update((settings) => ({
			...settings,
			backgroundMusicEnabled: value
		}));
	}

	function handleBellSoundChange(event: Event) {
		const value = (event.target as HTMLInputElement).checked;
		timerSettings.update((settings) => ({
			...settings,
			bellSoundEnabled: value
		}));

		// Dynamically control background music if meditation is running
		if (bellSound && isRunning) {
			if (value) {
				bellSound.play();
			} else {
				bellSound.pause();
				bellSound.currentTime = 0;
			}
		}
	}
</script>

{#if isOpen}
	<div
		class="fixed top-0 right-0 z-50 h-full w-80 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-slate-800"
	>
		<div class="relative p-6">
			<button
				on:click={() => (isOpen = false)}
				class="absolute top-4 right-4 rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
			>
				<X class="h-5 w-5 text-gray-600 dark:text-gray-300" />
			</button>
			<h2 class="mb-6 text-2xl font-semibold dark:text-white">Settings</h2>

			<div class="space-y-6">
				<IntervalTimeInput
					value={$timerSettings.intervalTime}
					onChange={handleIntervalTimeChange}
				/>

				<ToggleSwitch
					id="bellSound"
					checked={$timerSettings.bellSoundEnabled}
					onChange={handleBellSoundChange}
					label="Bell Sounds"
				/>

				{#if import.meta.env.DEV}
					<div class="mt-8 border-t border-gray-200 pt-4 dark:border-gray-700">
						<ToggleSwitch
							id="debugMode"
							checked={$timerSettings.isDebugMode}
							onChange={handleDebugModeChange}
							label="Debug Mode (10x faster)"
						/>
					</div>
					<StoreDebugInfo />
				{/if}
			</div>
		</div>
	</div>
{/if}
