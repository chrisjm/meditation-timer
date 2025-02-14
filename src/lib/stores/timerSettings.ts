import { writable } from 'svelte/store';

interface TimerSettings {
    duration: number;
    intervalTime: number;
    backgroundMusicEnabled: boolean;
    bellSoundEnabled: boolean;
}

const defaultSettings: TimerSettings = {
    duration: 600,
    intervalTime: 120,
    backgroundMusicEnabled: true,
    bellSoundEnabled: true,
};

function createTimerSettings() {
    // Try to load from localStorage
    const storedSettings = typeof localStorage !== 'undefined'
        ? localStorage.getItem('timerSettings')
        : null;

    const initialSettings = storedSettings
        ? JSON.parse(storedSettings)
        : defaultSettings;

    const { subscribe, set, update } = writable<TimerSettings>(initialSettings);

    return {
        subscribe,
        set: (settings: TimerSettings) => {
            set(settings);
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('timerSettings', JSON.stringify(settings));
            }
        },
        update: (updater: (settings: TimerSettings) => TimerSettings) => {
            update(settings => {
                const newSettings = updater(settings);
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('timerSettings', JSON.stringify(newSettings));
                }
                return newSettings;
            });
        }
    };
}

export const timerSettings = createTimerSettings();
