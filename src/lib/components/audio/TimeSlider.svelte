<script lang="ts">
	export interface Segment {
		color: string;
		length: number;
		tooltip: string;
		startTime?: number; // Calculated internally
	}

	const { currentTime, duration, seek, segments } = $props<{
		currentTime: number;
		duration: number;
		seek: (seconds: number) => void;
		segments?: Segment[];
	}>();

	// Calculate segment positions
	let processedSegments = $derived(
		segments.map((segment: Segment, index: number) => ({
			...segment,
			color: segment.color,
			startTime: segments
				.slice(0, index)
				.reduce((acc: number, curr: Segment) => acc + curr.length, 0)
		}))
	);

	function formatTime(seconds: number): string {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.floor(seconds % 60);
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	function handleSliderChange(e: Event) {
		const target = e.target as HTMLInputElement;
		seek(Number(target.value));
	}

	function getSegmentWidth(length: number): string {
		return `${(length / duration) * 100}%`;
	}

	function getCurrentSegment(): Segment | undefined {
		return processedSegments.find(
			(segment: Segment) =>
				currentTime >= segment.startTime! && currentTime < segment.startTime! + segment.length
		);
	}

	$effect(() => {
		const currentSegment = getCurrentSegment();
		if (currentSegment) {
			console.log(`Current segment: ${currentSegment.tooltip}`);
		}
	});
</script>

<div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
	<span class="w-10">{formatTime(currentTime)}</span>
	<div class="relative flex-1">
		<!-- Segments bar -->
		<div
			class="absolute top-1/3 left-0 h-2 w-full -translate-y-1/3 overflow-hidden rounded-lg"
			role="presentation"
		>
			<div class="flex h-full w-full">
				{#each processedSegments as segment}
					<div
						class="group relative h-full"
						style="width: {getSegmentWidth(segment.length)}; background-color: {segment.color}"
					>
						<!-- Tooltip -->
						<div
							class="pointer-events-none absolute bottom-full left-1/3 mb-2 -translate-x-1/3 rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-700"
						>
							{segment.tooltip}
						</div>
					</div>
				{/each}
			</div>
		</div>
		<!-- Slider input -->
		<input
			type="range"
			min="0"
			max={duration || 100}
			value={currentTime}
			oninput={handleSliderChange}
			class="relative h-2 w-full cursor-pointer appearance-none bg-transparent"
			aria-label="Time slider"
			tabindex="0"
		/>
	</div>
	<span class="w-10">{formatTime(duration || 0)}</span>
</div>

<style>
	/* Custom slider styling */
	input[type='range'] {
		-webkit-appearance: none;
	}

	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		transition: background 0.2s;
	}

	input[type='range']::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: #3b82f6;
		cursor: pointer;
		transition: background 0.2s;
		border: none;
	}

	/* Dark mode support */
	:global(.dark) input[type='range']::-webkit-slider-thumb {
		background: #60a5fa;
	}

	:global(.dark) input[type='range']::-moz-range-thumb {
		background: #60a5fa;
	}
</style>
