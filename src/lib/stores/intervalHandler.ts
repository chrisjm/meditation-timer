import { derived } from 'svelte/store';
import { masterTimer } from './masterTimer';
import { timerSettings } from './timerSettings';

let lastIntervalTime = 0;

export const shouldPlayInterval = derived(
    [masterTimer, timerSettings],
    ([$timer, $settings]) => {
        if ($timer.status !== 'running') {
            lastIntervalTime = 0;
            return false;
        }

        if ($settings.intervalTime === 0) {
            return false;
        }

        const elapsedTime = $settings.duration - $timer.currentTime;

        if (elapsedTime === 0 || $timer.currentTime === 0) {
            return false;
        }
        const currentInterval = Math.floor(elapsedTime / $settings.intervalTime);
        const shouldPlay = currentInterval > 0 && currentInterval !== lastIntervalTime;

        if (shouldPlay) {
            lastIntervalTime = currentInterval;
        }

        return shouldPlay;
    }
);
