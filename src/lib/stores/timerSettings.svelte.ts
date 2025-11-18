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

const STORAGE_KEY = 'timerSettings';

const loadInitialSettings = (): TimerSettings => {
	if (typeof localStorage === 'undefined') {
		return defaultSettings;
	}

	try {
		const storedSettings = localStorage.getItem(STORAGE_KEY);
		if (!storedSettings) {
			return defaultSettings;
		}

		const parsed = JSON.parse(storedSettings) as TimerSettings;
		return sanitizeSettings(parsed);
	} catch {
		return defaultSettings;
	}
};

let timerSettingsState = $state<TimerSettings>(loadInitialSettings());

const applySettings = (settings: TimerSettings): void => {
	const sanitized = sanitizeSettings(settings);

	timerSettingsState.duration = sanitized.duration;
	timerSettingsState.intervalTime = sanitized.intervalTime;
	timerSettingsState.startStopBellEnabled = sanitized.startStopBellEnabled;
	timerSettingsState.startStopBellVolume = sanitized.startStopBellVolume;
	timerSettingsState.intervalBellEnabled = sanitized.intervalBellEnabled;
	timerSettingsState.intervalBellVolume = sanitized.intervalBellVolume;
	timerSettingsState.isDebugMode = sanitized.isDebugMode;
	timerSettingsState.backgroundMusicEnabled = sanitized.backgroundMusicEnabled;
	timerSettingsState.backgroundMusicVolume = sanitized.backgroundMusicVolume;
	timerSettingsState.theme = sanitized.theme;
};

const setTimerSettings = (settings: TimerSettings): void => {
	applySettings(settings);

	subscribers.forEach((run) => {
		run(timerSettingsState);
	});

	if (typeof localStorage !== 'undefined') {
		const snapshot: TimerSettings = { ...timerSettingsState };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	}
};

const updateTimerSettings = (updater: (settings: TimerSettings) => TimerSettings): void => {
	const current: TimerSettings = { ...timerSettingsState };
	const updated = updater(current);
	applySettings(updated);

	subscribers.forEach((run) => {
		run(timerSettingsState);
	});

	if (typeof localStorage !== 'undefined') {
		const snapshot: TimerSettings = { ...timerSettingsState };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
	}
};

type TimerSettingsSubscriber = (settings: TimerSettings) => void;

const subscribers = new Set<TimerSettingsSubscriber>();

const subscribe = (run: TimerSettingsSubscriber) => {
	subscribers.add(run);
	run(timerSettingsState);

	return () => {
		subscribers.delete(run);
	};
};

const timerSettings = {
	subscribe,
	set: setTimerSettings,
	update: updateTimerSettings
};

export { timerSettings, setTimerSettings, updateTimerSettings };
