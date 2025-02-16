<script lang="ts">
	import Progress from './Progress.svelte';
	import { Bell } from 'lucide-svelte';

	export let progress: number;
	export let time: number;
	export let isBellPlaying = false;

	// Format time helper
	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}
</script>

<div class="relative mx-auto mb-8 h-64 w-64">
	<div class="absolute inset-0">
		<Progress
			{progress}
			size={256}
			strokeWidth={8}
		/>
	</div>
	<div class="absolute inset-0 flex flex-col items-center justify-center gap-2">
		<span class="font-mono text-5xl text-slate-700 dark:text-slate-300">
			{formatTime(time)}
		</span>
		{#if isBellPlaying}
			<div 
				class="transition-opacity duration-300 animate-pulse"
				role="status"
				aria-label="Bell is ringing"
			>
				<Bell
					size={24}
					class="text-slate-600 dark:text-slate-400"
				/>
			</div>
		{/if}
	</div>
</div>
