import { derived } from 'svelte/store';
import { SvelteSet } from 'svelte/reactivity';
import { masterTimer } from './masterTimer.svelte';
import { timerSettings } from './timerSettings.svelte';

const playedIntervals = new SvelteSet<number>();

export const shouldPlayInterval = derived([masterTimer, timerSettings], ([$timer, $settings]) => {
	if ($timer.status !== 'running') {
		if (playedIntervals.size > 0) {
			console.debug('[interval] clearing playedIntervals because timer is not running', {
				status: $timer.status,
				playedIntervals: Array.from(playedIntervals.values())
			});
		}
		playedIntervals.clear();
		return null;
	}

	if ($settings.intervalTime <= 0) {
		return null;
	}

	const elapsedTime = $timer.initialDuration - $timer.currentTime;

	if (elapsedTime <= 0 || $timer.currentTime <= 0) {
		return null;
	}

	const currentIntervalIndex = Math.floor(elapsedTime / $settings.intervalTime);

	const shouldPlay = currentIntervalIndex > 0 && !playedIntervals.has(currentIntervalIndex);

	if (!shouldPlay) {
		return null;
	}

	playedIntervals.add(currentIntervalIndex);

	console.debug('[interval] shouldPlayInterval', {
		elapsedTime,
		currentTime: $timer.currentTime,
		initialDuration: $timer.initialDuration,
		intervalTime: $settings.intervalTime,
		currentIntervalIndex,
		playedIntervals: Array.from(playedIntervals.values())
	});

	return currentIntervalIndex;
});
