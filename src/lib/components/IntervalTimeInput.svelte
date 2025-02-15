<script lang="ts">
	export let value: number;
	export let onChange: (event: Event) => void;
</script>

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
		{value}
		on:input={onChange}
		class="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
	/>
</div>
