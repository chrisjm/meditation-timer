<script lang="ts">
	let { progress, size = 256, strokeWidth = 4, color = 'currentColor' } = $props();

	// Calculate circle properties
	let radius = $derived(size / 2);
	let center = $derived(radius);
	let circumference = $derived(2 * Math.PI * (radius - strokeWidth / 2));
	let strokeDasharray = $derived(circumference);
	let strokeDashoffset = $derived(circumference * (1 - progress));
</script>

<svg class="-rotate-90 transform" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
	<!-- Background circle -->
	<circle
		class="text-slate-200 dark:text-slate-800"
		stroke="currentColor"
		fill="none"
		stroke-linecap="round"
		stroke-width={strokeWidth}
		cx={center}
		cy={center}
		r={radius - strokeWidth / 2}
	/>

	<!-- Progress circle -->
	<circle
		stroke="currentColor"
		class="text-slate-900 dark:text-slate-100"
		fill="none"
		stroke-linecap="round"
		stroke-width={strokeWidth}
		cx={center}
		cy={center}
		r={radius - strokeWidth / 2}
		style={`
            stroke-dasharray: ${strokeDasharray};
            stroke-dashoffset: ${strokeDashoffset};
            transition: stroke-dashoffset 0.5s ease;
        `}
	/>
</svg>
