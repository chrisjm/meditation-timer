import { writable, derived, get } from 'svelte/store';
import { timerSettings } from './timerSettings';

interface TimerState {
    currentTime: number;
    isRunning: boolean;
    isPaused: boolean;
}

function createMasterTimer() {
    const { subscribe, set, update } = writable<TimerState>({
        currentTime: get(timerSettings).duration ?? 0,
        isRunning: false,
        isPaused: false
    });

    let interval: ReturnType<typeof setInterval> | null = null;

    return {
        subscribe,
        start: (duration: number) => {
            set({ currentTime: duration, isRunning: true, isPaused: false });
            interval = setInterval(() => {
                update(state => {
                    if (!state.isPaused && state.currentTime > 0) {
                        return { ...state, currentTime: state.currentTime - 1 };
                    }
                    if (state.currentTime === 0) {
                        if (interval) clearInterval(interval);
                        return { ...state, isRunning: false };
                    }
                    return state;
                });
            }, 1000);
        },
        pause: () => {
            update(state => ({ ...state, isPaused: !state.isPaused }));
        },
        reset: () => {
            if (interval) clearInterval(interval);
            set({ currentTime: get(timerSettings).duration, isRunning: false, isPaused: false });
        },
        stop: () => {
            if (interval) clearInterval(interval);
            set({ currentTime: get(timerSettings).duration, isRunning: false, isPaused: false });
        }
    };
}

export const masterTimer = createMasterTimer();

// Derived store for progress
export const progress = derived(
    [masterTimer, timerSettings],
    ([$timer, $settings]) => {
        return ($settings.duration - $timer.currentTime) / $settings.duration;
    }
);
