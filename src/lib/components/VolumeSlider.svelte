<script lang="ts">
	let { id, value, label, changeVolume } = $props<{
		id: string;
		value: number;
		label?: string;
		changeVolume: (event: Event) => void;
	}>();

	const handleInput = (event: Event) => {
		changeVolume(event);
	};
</script>

<div class="flex flex-col space-y-2">
	<label for={id} class="text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</label>
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
	<div class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
		<span>0%</span>
		<span>{Math.round(value * 100)}%</span>
		<span>100%</span>
	</div>
</div>
