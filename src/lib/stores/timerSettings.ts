import { writable } from 'svelte/store';
import { clampDuration, clampIntervalTime, clampVolume } from '$lib/validators/timerSettings';

export interface TimerSettings {
	duration: number;
	intervalTime: number;
	startStopBellEnabled: boolean;
	startStopBellVolume: number;
	intervalBellEnabled: boolean;
	intervalBellVolume: number;
	isDebugMode: boolean;
	backgroundMusicEnabled: boolean;
	backgroundMusicVolume: number;
	theme: 'light' | 'dark' | 'auto';
}

const defaultSettings: TimerSettings = {
	duration: 600,
	intervalTime: 120,
	startStopBellEnabled: true,
	startStopBellVolume: 0.7,
	intervalBellEnabled: true,
	intervalBellVolume: 0.7,
	isDebugMode: false,
	backgroundMusicEnabled: true,
	backgroundMusicVolume: 0.7,
	theme: 'auto'
};

const sanitizeSettings = (settings: TimerSettings): TimerSettings => {
	return {
		...settings,
		duration: clampDuration(settings.duration),
		intervalTime: clampIntervalTime(settings.intervalTime),
		startStopBellVolume: clampVolume(settings.startStopBellVolume),
		intervalBellVolume: clampVolume(settings.intervalBellVolume),
		backgroundMusicVolume: clampVolume(settings.backgroundMusicVolume)
	};
};

function createTimerSettings() {
	const storedSettings =
		typeof localStorage !== 'undefined' ? localStorage.getItem('timerSettings') : null;

	let initialSettings = storedSettings ? JSON.parse(storedSettings) : defaultSettings;

	initialSettings = sanitizeSettings(initialSettings);

	const { subscribe, set, update } = writable<TimerSettings>(initialSettings);

	return {
		subscribe,
		set: (settings: TimerSettings) => {
			const sanitized = sanitizeSettings(settings);
			set(sanitized);
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('timerSettings', JSON.stringify(sanitized));
			}
		},
		update: (updater: (settings: TimerSettings) => TimerSettings) => {
			update((settings) => {
				const newSettings = sanitizeSettings(updater(settings));
				if (typeof localStorage !== 'undefined') {
					localStorage.setItem('timerSettings', JSON.stringify(newSettings));
				}
				return newSettings;
			});
		}
	};
}

export const timerSettings = createTimerSettings();
