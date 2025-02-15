<script lang="ts">
	import { timerSettings } from '$lib/stores/timerSettings';
	import { masterTimer } from '$lib/stores/masterTimer';
</script>

<div class="mt-8 border-t border-slate-200 pt-4 dark:border-slate-700">
	<h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Store Debug Info</h3>
	
	<div class="space-y-4 rounded-lg bg-slate-100 p-4 font-mono text-sm dark:bg-slate-900">
		<div>
			<h4 class="font-semibold text-emerald-600 dark:text-emerald-400">Timer Settings:</h4>
			<pre class="mt-2 whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300">{JSON.stringify($timerSettings, null, 2)}</pre>
		</div>

		<div>
			<h4 class="font-semibold text-emerald-600 dark:text-emerald-400">Master Timer:</h4>
			<pre class="mt-2 whitespace-pre-wrap break-all text-slate-700 dark:text-slate-300">{JSON.stringify($masterTimer, null, 2)}</pre>
		</div>
	</div>
</div>
