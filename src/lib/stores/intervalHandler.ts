import { derived } from 'svelte/store';
import { masterTimer } from './masterTimer';
import { timerSettings } from './timerSettings';

export const shouldPlayInterval = derived(
    [masterTimer, timerSettings],
    ([$timer, $settings]) => {
        if (!$timer.isRunning || $timer.isPaused) return false;

        const elapsedTime = $settings.duration - $timer.currentTime;
        // Check if we're exactly at an interval point
        // Don't play interval bell on the final second
        return elapsedTime > 0 &&
            $timer.currentTime > 0 && // Ensure we're not at the end
            $settings.intervalTime > 0 &&
            elapsedTime % $settings.intervalTime === 0;
    }
);
