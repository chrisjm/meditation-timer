import { writable } from 'svelte/store';

interface TimerSettings {
    duration: number;
    intervalTime: number;
    startStopBellEnabled: boolean;
    startStopBellVolume: number;
    intervalBellEnabled: boolean;
    intervalBellVolume: number;
    isDebugMode: boolean;
    // Audio player settings
    backgroundMusicEnabled: boolean;
    backgroundMusicVolume: number;
    autoUnlockAudio: boolean;
}

const defaultSettings: TimerSettings = {
    duration: 600,
    intervalTime: 120,
    startStopBellEnabled: true,
    startStopBellVolume: 0.7,
    intervalBellEnabled: true,
    intervalBellVolume: 0.7,
    isDebugMode: false,
    // Audio player default settings
    backgroundMusicEnabled: true,
    backgroundMusicVolume: 0.7,
    autoUnlockAudio: false,
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
