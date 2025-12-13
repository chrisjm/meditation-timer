<script lang="ts">
	import { X } from 'lucide-svelte';
	import { timerSettings } from '$lib/stores/timerSettings.svelte';
	import ToggleSwitch from './ToggleSwitch.svelte';
	import VolumeSlider from './VolumeSlider.svelte';
	import IntervalTimeInput from './IntervalTimeInput.svelte';

	let { isOpen, onClose } = $props();

	const handleCloseClick = (): void => {
		onClose();
	};

	const handleCloseKeyDown = (event: KeyboardEvent): void => {
		if (event.key !== 'Escape') {
			return;
		}

		onClose();
	};

	const handleDebugModeChange = (event: Event): void => {
		const value = (event.target as HTMLInputElement).checked;
		timerSettings.update((settings) => ({
			...settings,
			isDebugMode: value
		}));
	};

	const handleIntervalTimeChange = (event: Event): void => {
		const value = parseInt((event.target as HTMLInputElement).value);
		timerSettings.update((settings) => ({
			...settings,
			intervalTime: value
		}));
	};

	const handleStartStopBellChange = (event: Event): void => {
		const value = (event.target as HTMLInputElement).checked;
		timerSettings.update((settings) => ({
			...settings,
			startStopBellEnabled: value
		}));
	};

	const handleIntervalBellChange = (event: Event): void => {
		const value = (event.target as HTMLInputElement).checked;
		timerSettings.update((settings) => ({
			...settings,
			intervalBellEnabled: value
		}));
	};

	const handleStartStopVolumeChange = (event: Event): void => {
		const value = parseFloat((event.target as HTMLInputElement).value);
		timerSettings.update((settings) => ({
			...settings,
			startStopBellVolume: value
		}));
	};

	const handleIntervalVolumeChange = (event: Event): void => {
		const value = parseFloat((event.target as HTMLInputElement).value);
		timerSettings.update((settings) => ({
			...settings,
			intervalBellVolume: value
		}));
	};
</script>

{#if isOpen}
	<div
		id="settings-panel"
		role="dialog"
		aria-label="Settings panel"
		class="fixed top-0 right-0 z-50 h-full w-80 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-slate-800"
	>
		<div class="relative p-6">
			<button
				onclick={handleCloseClick}
				onkeydown={handleCloseKeyDown}
				class="absolute top-4 right-4 cursor-pointer rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-slate-700"
				aria-label="Close settings panel"
				tabindex="0"
			>
				<X class="h-5 w-5 text-gray-600 dark:text-gray-300" />
			</button>
			<h2 class="mb-6 text-2xl font-semibold dark:text-white">Settings</h2>

			<div class="space-y-6">
				<IntervalTimeInput
					value={$timerSettings.intervalTime}
					onChange={handleIntervalTimeChange}
				/>

				<div class="space-y-4">
					<div class="space-y-2">
						<ToggleSwitch
							id="startStopBell"
							checked={$timerSettings.startStopBellEnabled}
							onChange={handleStartStopBellChange}
							label="Start/Stop Bell"
						/>
						<VolumeSlider
							id="startStopVolume"
							value={$timerSettings.startStopBellVolume}
							changeVolume={handleStartStopVolumeChange}
							isEnabled={$timerSettings.startStopBellEnabled}
						/>
					</div>

					<div class="space-y-2">
						<ToggleSwitch
							id="intervalBell"
							checked={$timerSettings.intervalBellEnabled}
							onChange={handleIntervalBellChange}
							label="Interval Bell"
						/>
						<VolumeSlider
							id="intervalVolume"
							value={$timerSettings.intervalBellVolume}
							changeVolume={handleIntervalVolumeChange}
							isEnabled={$timerSettings.intervalBellEnabled}
						/>
					</div>
				</div>

				{#if import.meta.env.DEV}
					<div class="mt-8 border-t border-gray-200 pt-4 dark:border-gray-700">
						<div class="space-y-4">
							<ToggleSwitch
								id="debugMode"
								checked={$timerSettings.isDebugMode}
								onChange={handleDebugModeChange}
								label="Debug Logging"
							/>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
