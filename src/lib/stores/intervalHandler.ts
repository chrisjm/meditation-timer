import { derived } from 'svelte/store';
import { masterTimer } from './masterTimer';
import { timerSettings } from './timerSettings';

const playedIntervals = new Set<number>();

export const shouldPlayInterval = derived(
    [masterTimer, timerSettings],
    ([$timer, $settings]) => {
        if ($timer.status !== 'running') {
            playedIntervals.clear();
            return false;
        }

        if ($settings.intervalTime <= 0) {
            return false;
        }

        const elapsedTime = $timer.initialDuration - $timer.currentTime;

        if (elapsedTime <= 0 || $timer.currentTime <= 0) {
            return false;
        }

        const currentIntervalIndex = Math.floor(elapsedTime / $settings.intervalTime);

        const shouldPlay = currentIntervalIndex > 0 && !playedIntervals.has(currentIntervalIndex);

        if (shouldPlay) {
            playedIntervals.add(currentIntervalIndex);
        }

        return shouldPlay;
    }
);
