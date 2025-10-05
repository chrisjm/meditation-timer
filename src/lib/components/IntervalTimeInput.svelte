<script lang="ts">
	export let value: number;
	export let onChange: (event: Event) => void;

	const intervals = [
		{ value: 0, label: 'Off' },
		{ value: 30, label: '30s' },
		{ value: 60, label: '1m' },
		{ value: 90, label: '90s' },
		{ value: 120, label: '2m' }
	];

	const handleInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		const newValue = parseInt(target.value);
		const closestInterval = intervals.reduce((prev, curr) => {
			return Math.abs(curr.value - newValue) < Math.abs(prev.value - newValue) ? curr : prev;
		});
		target.value = closestInterval.value.toString();
		onChange(event);
	};

	const getFormattedTime = (seconds: number): string => {
		return intervals.find((interval) => interval.value === seconds)?.label || 'Off';
	};
</script>

<div class="space-y-2">
	<div class="flex items-center justify-between">
		<label for="intervalTime" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
			Interval Bell Time
		</label>
		<span class="text-sm font-medium text-gray-700 dark:text-gray-300">
			{getFormattedTime(value)}
		</span>
	</div>

	<div class="relative">
		<input
			type="range"
			id="intervalTime"
			min="0"
			max="120"
			step="30"
			{value}
			on:input={handleInput}
			class="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 dark:bg-gray-700"
			aria-label="Interval time slider"
		/>
		<div class="mt-1 flex justify-between">
			{#each intervals as interval}
				<div class="flex flex-col items-center">
					<div class="mb-1 h-1 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
					<span class="text-xs text-gray-500 dark:text-gray-400">{interval.label}</span>
				</div>
			{/each}
		</div>
	</div>
</div>
