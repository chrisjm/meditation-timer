import { writable, derived } from 'svelte/store';
import { timerSettings } from './timerSettings';

interface TimerState {
    currentTime: number;
    isRunning: boolean;
    isPaused: boolean;
    initialDuration: number;
}

function createMasterTimer() {
    let initialDuration = 0;

    const { subscribe, set, update } = writable<TimerState>({
        currentTime: initialDuration,
        isRunning: false,
        isPaused: false,
        initialDuration
    });

    let interval: ReturnType<typeof setInterval> | null = null;

    const clearTimerInterval = () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    };

    return {
        subscribe,
        start: (duration: number, debug = false) => {
            clearTimerInterval();

            set({ currentTime: duration, isRunning: true, isPaused: false, initialDuration: duration });
            interval = setInterval(() => {
                update(state => {
                    if (!state.isPaused && state.currentTime > 0) {
                        return { ...state, currentTime: state.currentTime - 1 };
                    }
                    if (state.currentTime === 0) {
                        clearTimerInterval();
                        return { ...state, isRunning: false };
                    }
                    return state;
                });
            }, debug ? 100 : 1000);
        },
        pause: () => {
            update(state => ({ ...state, isPaused: !state.isPaused }));
        },
        reset: () => {
            clearTimerInterval();
            set({ currentTime: initialDuration, isRunning: false, isPaused: false, initialDuration });
        },
        stop: () => {
            clearTimerInterval();
            set({ currentTime: initialDuration, isRunning: false, isPaused: false, initialDuration });
        },
        cleanup: () => {
            clearTimerInterval();
        }
    };
}

export const masterTimer = createMasterTimer();

export const progress = derived(
    [masterTimer, timerSettings],
    ([$timer, $settings]) => {
        return ($settings.duration - $timer.currentTime) / $settings.duration;
    }
);
