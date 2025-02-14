<!-- SettingsPanel.svelte -->
<script lang="ts">
	import { X } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
    
	const dispatch = createEventDispatcher();
	
	export let isOpen = false;
	export let intervalTime = 120;
	export let backgroundMusicEnabled = true;
	export let bellSoundEnabled = true;

	function handleIntervalTimeChange(event: Event) {
		const value = parseInt((event.target as HTMLInputElement).value);
		dispatch('intervalChange', value);
	}

	function handleBackgroundMusicChange(event: Event) {
		const value = (event.target as HTMLInputElement).checked;
		dispatch('backgroundMusicChange', value);
	}

	function handleBellSoundChange(event: Event) {
		const value = (event.target as HTMLInputElement).checked;
		dispatch('bellSoundChange', value);
	}
</script>

{#if isOpen}
	<div
		class="fixed top-0 right-0 h-full w-80 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-slate-800"
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
				<!-- Interval Time -->
				<div>
					<label
						for="intervalTime"
						class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>
						Interval Bell Time (seconds)
					</label>
					<input
						type="number"
						id="intervalTime"
						min="0"
						step="30"
						value={intervalTime}
						on:input={handleIntervalTimeChange}
						class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
					/>
				</div>

				<!-- Background Music Toggle -->
				<div class="flex items-center justify-between">
					<label for="bgMusic" class="text-sm font-medium text-gray-700 dark:text-gray-300">
						Background Music
					</label>
					<label class="relative inline-flex cursor-pointer items-center">
						<input
							type="checkbox"
							id="bgMusic"
							checked={backgroundMusicEnabled}
							on:change={handleBackgroundMusicChange}
							class="peer sr-only"
						/>
						<div
							class="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
						></div>
					</label>
				</div>

				<!-- Bell Sound Toggle -->
				<div class="flex items-center justify-between">
					<label for="bellSound" class="text-sm font-medium text-gray-700 dark:text-gray-300">
						Bell Sounds
					</label>
					<label class="relative inline-flex cursor-pointer items-center">
						<input
							type="checkbox"
							id="bellSound"
							checked={bellSoundEnabled}
							on:change={handleBellSoundChange}
							class="peer sr-only"
						/>
						<div
							class="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
						></div>
					</label>
				</div>
			</div>
		</div>
	</div>
{/if}
