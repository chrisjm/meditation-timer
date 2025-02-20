<script lang="ts">
	import { Volume2, VolumeX } from 'lucide-svelte';
	import { isIOS } from '$lib/utils/mobileAudioManager';

	const { volume, isMuted, volumeChange, muteToggle } = $props<{
		volume: number;
		isMuted: boolean;
		volumeChange: (volume: number) => void;
		muteToggle: () => void;
	}>();
</script>

<div class="flex items-center gap-2">
	<button
		onclick={muteToggle}
		class="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
		aria-label={isMuted ? 'Unmute' : 'Mute'}
	>
		{#if isMuted}
			<VolumeX class="h-6 w-6 text-slate-700 dark:text-slate-200" />
		{:else}
			<Volume2 class="h-6 w-6 text-slate-700 dark:text-slate-200" />
		{/if}
	</button>
	{#if !isIOS()}
		<input
			type="range"
			min="0"
			max="1"
			step="0.1"
			value={volume}
			oninput={(e) => volumeChange(Number((e.target as HTMLInputElement).value))}
			class="h-2 w-24 cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700"
		/>
	{:else}
		<div class="text-sm text-slate-500 dark:text-slate-400">Use device volume</div>
	{/if}
</div>
