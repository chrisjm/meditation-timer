<script lang="ts">
	export interface Segment {
		color: string;
		length: number;
		description: string;
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
</script>

<div class="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
	<div class="flex items-center gap-2">
		<span class="w-10">{formatTime(currentTime)}</span>
		<div class="relative flex-1">
			<!-- Segments bar -->
			<div
				class="absolute top-1.5 left-0 h-2 w-full overflow-hidden rounded-lg"
				role="presentation"
			>
				<div class="flex h-full w-full">
					{#each processedSegments as segment, index (index)}
						<div
							class="relative h-full"
							style="width: {getSegmentWidth(segment.length)}; background-color: {segment.color}"
						></div>
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
				class="range relative h-2 w-full cursor-pointer appearance-none bg-transparent accent-slate-300 hover:accent-slate-600"
				aria-label="Time slider"
				tabindex="0"
			/>
		</div>
		<span class="w-10">{formatTime(duration || 0)}</span>
	</div>
	<!-- Current segment description -->
	{#if getCurrentSegment()}
		<p class="text-center text-xs">{getCurrentSegment()?.description}</p>
	{/if}
</div>
