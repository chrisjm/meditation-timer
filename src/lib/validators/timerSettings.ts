export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

export interface TimerSettingsConstraints {
	duration: { min: number; max: number };
	intervalTime: { min: number; max: number };
	volume: { min: number; max: number };
}

export const TIMER_CONSTRAINTS: TimerSettingsConstraints = {
	duration: { min: 60, max: 7200 }, // 1 minute to 2 hours
	intervalTime: { min: 0, max: 3600 }, // 0 (disabled) to 1 hour
	volume: { min: 0, max: 1 }
};

export const validateDuration = (duration: number): ValidationResult => {
	const errors: string[] = [];

	if (typeof duration !== 'number' || isNaN(duration)) {
		errors.push('Duration must be a valid number');
	} else if (duration < TIMER_CONSTRAINTS.duration.min) {
		errors.push(`Duration must be at least ${TIMER_CONSTRAINTS.duration.min} seconds (1 minute)`);
	} else if (duration > TIMER_CONSTRAINTS.duration.max) {
		errors.push(
			`Duration must be at most ${TIMER_CONSTRAINTS.duration.max} seconds (2 hours)`
		);
	}

	return {
		isValid: errors.length === 0,
		errors
	};
};

export const validateIntervalTime = (intervalTime: number): ValidationResult => {
	const errors: string[] = [];

	if (typeof intervalTime !== 'number' || isNaN(intervalTime)) {
		errors.push('Interval time must be a valid number');
	} else if (intervalTime < TIMER_CONSTRAINTS.intervalTime.min) {
		errors.push(`Interval time must be at least ${TIMER_CONSTRAINTS.intervalTime.min} seconds`);
	} else if (intervalTime > TIMER_CONSTRAINTS.intervalTime.max) {
		errors.push(
			`Interval time must be at most ${TIMER_CONSTRAINTS.intervalTime.max} seconds (1 hour)`
		);
	}

	return {
		isValid: errors.length === 0,
		errors
	};
};

export const validateVolume = (volume: number, name: string = 'Volume'): ValidationResult => {
	const errors: string[] = [];

	if (typeof volume !== 'number' || isNaN(volume)) {
		errors.push(`${name} must be a valid number`);
	} else if (volume < TIMER_CONSTRAINTS.volume.min) {
		errors.push(`${name} must be at least ${TIMER_CONSTRAINTS.volume.min}`);
	} else if (volume > TIMER_CONSTRAINTS.volume.max) {
		errors.push(`${name} must be at most ${TIMER_CONSTRAINTS.volume.max}`);
	}

	return {
		isValid: errors.length === 0,
		errors
	};
};

export const validateTimerSettings = (settings: {
	duration: number;
	intervalTime: number;
	startStopBellVolume: number;
	intervalBellVolume: number;
	backgroundMusicVolume: number;
}): ValidationResult => {
	const allErrors: string[] = [];

	const durationResult = validateDuration(settings.duration);
	allErrors.push(...durationResult.errors);

	const intervalResult = validateIntervalTime(settings.intervalTime);
	allErrors.push(...intervalResult.errors);

	const startStopVolumeResult = validateVolume(
		settings.startStopBellVolume,
		'Start/Stop bell volume'
	);
	allErrors.push(...startStopVolumeResult.errors);

	const intervalVolumeResult = validateVolume(settings.intervalBellVolume, 'Interval bell volume');
	allErrors.push(...intervalVolumeResult.errors);

	const bgMusicVolumeResult = validateVolume(
		settings.backgroundMusicVolume,
		'Background music volume'
	);
	allErrors.push(...bgMusicVolumeResult.errors);

	return {
		isValid: allErrors.length === 0,
		errors: allErrors
	};
};

export const clampDuration = (duration: number): number => {
	return Math.max(
		TIMER_CONSTRAINTS.duration.min,
		Math.min(TIMER_CONSTRAINTS.duration.max, duration)
	);
};

export const clampIntervalTime = (intervalTime: number): number => {
	return Math.max(
		TIMER_CONSTRAINTS.intervalTime.min,
		Math.min(TIMER_CONSTRAINTS.intervalTime.max, intervalTime)
	);
};

export const clampVolume = (volume: number): number => {
	return Math.max(TIMER_CONSTRAINTS.volume.min, Math.min(TIMER_CONSTRAINTS.volume.max, volume));
};
