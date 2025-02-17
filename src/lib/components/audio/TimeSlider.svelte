<script lang="ts">
	const { currentTime, duration, seek } = $props<{
		currentTime: number;
		duration: number;
		seek: (seconds: number) => void;
	}>();

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}
</script>

<div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
	<span class="w-10">{formatTime(currentTime)}</span>
	<input
		type="range"
		min="0"
		max={duration || 100}
		value={currentTime}
		oninput={(e) => seek(Number((e.target as HTMLInputElement).value))}
		class="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 dark:bg-slate-700"
	/>
	<span class="w-10">{formatTime(duration || 0)}</span>
</div>
