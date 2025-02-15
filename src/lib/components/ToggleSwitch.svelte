<script lang="ts">
	export let id: string;
	export let checked: boolean;
	export let onChange: (event: Event) => void;
	export let label: string;
</script>

<div class="flex items-center justify-between">
	<label for={id} class="text-sm font-medium text-gray-700 dark:text-gray-300">
		{label}
	</label>
	<label class="relative inline-flex cursor-pointer items-center">
		<input
			type="checkbox"
			{id}
			{checked}
			on:change={onChange}
			on:keydown={(e) => e.key === 'Enter' && onChange(e)}
			class="peer sr-only"
			role="switch"
			aria-checked={checked}
			tabindex="0"
		/>
		<div
			class="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-4 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-blue-800"
		></div>
	</label>
</div>
