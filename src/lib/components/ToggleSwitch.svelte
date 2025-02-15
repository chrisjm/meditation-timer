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
			class="sr-only"
			role="switch"
			aria-checked={checked}
			tabindex="0"
		/>
		<div
			class="relative h-6 w-11 rounded-full bg-gray-200 transition-colors duration-200 ease-in-out focus-within:ring-4 focus-within:ring-blue-300 dark:bg-gray-700 dark:focus-within:ring-blue-800"
			class:bg-blue-600={checked}
			class:dark:bg-blue-500={checked}
		>
			<div
				class="absolute h-5 w-5 transform rounded-full border bg-white transition-transform duration-200 ease-in-out dark:border-gray-600"
				class:border-gray-300={!checked}
				class:border-blue-600={checked}
				class:dark:border-gray-500={!checked}
				class:dark:border-blue-500={checked}
				style="top: 2px; left: 2px; transform: translateX({checked ? '20px' : '0px'});"
			></div>
		</div>
	</label>
</div>
