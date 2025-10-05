import { writable, derived } from 'svelte/store';
import { timerSettings } from './timerSettings';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

interface TimerState {
    currentTime: number;
    status: TimerStatus;
    initialDuration: number;
}

function createMasterTimer() {
    let initialDuration = 0;

    const { subscribe, set, update } = writable<TimerState>({
        currentTime: initialDuration,
        status: 'idle',
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

            set({ currentTime: duration, status: 'running', initialDuration: duration });
            interval = setInterval(() => {
                update(state => {
                    if (state.status === 'running' && state.currentTime > 0) {
                        return { ...state, currentTime: state.currentTime - 1 };
                    }
                    if (state.currentTime === 0) {
                        clearTimerInterval();
                        return { ...state, status: 'completed' };
                    }
                    return state;
                });
            }, debug ? 100 : 1000);
        },
        pause: () => {
            update(state => {
                if (state.status === 'running') {
                    return { ...state, status: 'paused' };
                } else if (state.status === 'paused') {
                    return { ...state, status: 'running' };
                }
                return state;
            });
        },
        reset: () => {
            clearTimerInterval();
            set({ currentTime: initialDuration, status: 'idle', initialDuration });
        },
        stop: () => {
            clearTimerInterval();
            set({ currentTime: initialDuration, status: 'idle', initialDuration });
        },
        cleanup: () => {
            clearTimerInterval();
        }
    };
}

export const masterTimer = createMasterTimer();

export const isRunning = derived(masterTimer, ($timer) => $timer.status === 'running');
export const isPaused = derived(masterTimer, ($timer) => $timer.status === 'paused');
export const isIdle = derived(masterTimer, ($timer) => $timer.status === 'idle');
export const isCompleted = derived(masterTimer, ($timer) => $timer.status === 'completed');

export const progress = derived(
    [masterTimer, timerSettings],
    ([$timer, $settings]) => {
        return ($settings.duration - $timer.currentTime) / $settings.duration;
    }
);
