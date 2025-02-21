<script lang="ts">
	import { isIOS } from '$lib/utils/mobileAudioManager';
	import { VolumeX, Volume2 } from 'lucide-svelte';
	let {
		id,
		value = 0.5,
		label,
		changeVolume,
		isEnabled
	} = $props<{
		id: string;
		value: number;
		label?: string;
		changeVolume: (event: Event) => void;
		isEnabled: boolean;
	}>();

	const handleInput = (event: Event) => {
		changeVolume(event);
	};
</script>

<div class="flex flex-col space-y-2">
	{#if isEnabled}
		<label for={id} class="text-sm font-medium text-gray-700 dark:text-gray-300">
			{label}
		</label>
		{#if !isIOS()}
			<div class="flex items-center space-x-2">
				<VolumeX class="h-5 w-5 text-gray-500 dark:text-gray-400" aria-label="Mute" />
				<input
					{id}
					type="range"
					min="0"
					max="1"
					step="0.1"
					{value}
					oninput={handleInput}
					class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600 dark:bg-gray-700"
					aria-label={`${label} volume control`}
				/>
				<Volume2 class="h-5 w-5 text-gray-500 dark:text-gray-400" aria-label="Max Volume" />
			</div>
			<div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
				<span>0%</span>
				<span class="pl-6">{Math.round(value * 100)}%</span>
				<span>100%</span>
			</div>
		{/if}
	{/if}
</div>
