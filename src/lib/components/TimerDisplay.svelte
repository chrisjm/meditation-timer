<script lang="ts">
	import Progress from './Progress.svelte';

	export let progress: number;
	export let time: number;
	export let isPrepping: boolean;

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
			color={isPrepping ? 'rgb(234 179 8)' : 'rgb(16 185 129)'}
		/>
	</div>
	<div class="absolute inset-0 flex items-center justify-center">
		<span class="font-mono text-5xl text-slate-700 dark:text-slate-300">
			{formatTime(time)}
		</span>
	</div>
</div>
