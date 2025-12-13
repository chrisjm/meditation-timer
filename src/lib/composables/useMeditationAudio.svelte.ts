import { audio } from '$lib/stores/audio.svelte';
import { timerSettings, type TimerSettings } from '$lib/stores/timerSettings.svelte';
import { withErrorHandling } from '$lib/utils/errorHandling';
import { initializeAudio } from '$lib/utils/mobileAudioManager';

export function useMeditationAudio() {
	const isDev = import.meta.env.DEV;
	let shouldDebugLog = isDev;

	timerSettings.subscribe((settings: TimerSettings) => {
		shouldDebugLog = isDev && settings.isDebugMode;
	});

	const debugLog = (message: string, data?: Record<string, unknown>) => {
		if (!shouldDebugLog) {
			return;
		}
		if (data) {
			console.debug(message, data);
			return;
		}
		console.debug(message);
	};

	let startBell = $state<HTMLAudioElement | undefined>();
	let intervalBell = $state<HTMLAudioElement | undefined>();
	let startBellEndedListener: (() => void) | null = null;
	let intervalBellEndedListener: (() => void) | null = null;

	const setStartBell = (element: HTMLAudioElement | undefined) => {
		if (startBell && startBellEndedListener) {
			startBell.removeEventListener('ended', startBellEndedListener);
		}

		startBell = element;

		debugLog('[audio] setStartBell', {
			hasElement: Boolean(element),
			src: element?.src
		});

		if (element) {
			startBellEndedListener = () => audio.bells.trackAudio(element, false);
			element.addEventListener('ended', startBellEndedListener);
		} else {
			startBellEndedListener = null;
		}
	};

	const setIntervalBell = (element: HTMLAudioElement | undefined) => {
		if (intervalBell && intervalBellEndedListener) {
			intervalBell.removeEventListener('ended', intervalBellEndedListener);
		}

		intervalBell = element;

		debugLog('[audio] setIntervalBell', {
			hasElement: Boolean(element),
			src: element?.src
		});

		if (element) {
			intervalBellEndedListener = () => audio.bells.trackAudio(element, false);
			element.addEventListener('ended', intervalBellEndedListener);
		} else {
			intervalBellEndedListener = null;
		}
	};

	const initializeMobileAudio = async (): Promise<boolean> => {
		const audioElements = [startBell, intervalBell].filter(
			(audio): audio is HTMLAudioElement => audio !== undefined
		);

		debugLog('[audio] initializeMobileAudio (useMeditationAudio)', {
			hasStartBell: Boolean(startBell),
			hasIntervalBell: Boolean(intervalBell),
			audioElementCount: audioElements.length
		});

		const initialized = await withErrorHandling(
			async () => {
				await initializeAudio(audioElements);
				return true;
			},
			{ showNotification: false, notificationMessage: 'Failed to initialize audio' }
		);

		if (!initialized) {
			return false;
		}

		debugLog('[audio] initializeMobileAudio success (useMeditationAudio)');
		return true;
	};

	const playStartBell = async (): Promise<boolean> => {
		if (!startBell) {
			console.warn('[audio] playStartBell called but startBell is not set');
			return false;
		}

		debugLog('[audio] playStartBell invoked', {
			src: startBell.src,
			isIntervalBellSet: Boolean(intervalBell),
			isIntervalBellPlaying: intervalBell ? !intervalBell.paused : false
		});

		// Start/finish bell has priority over interval bells
		if (intervalBell && !intervalBell.paused) {
			debugLog('[audio] playStartBell pausing active interval bell', {
				src: intervalBell.src
			});

			intervalBell.pause();
			intervalBell.currentTime = 0;
			audio.bells.trackAudio(intervalBell, false);
		}

		try {
			startBell.currentTime = 0;
			audio.bells.trackAudio(startBell, true);
			await startBell.play();

			debugLog('[audio] playStartBell success', {
				src: startBell.src
			});
			return true;
		} catch (err: unknown) {
			const error = err as Error;
			console.error('[audio] Failed to play start bell', {
				src: startBell.src,
				name: error?.name,
				message: error?.message,
				fullError: error
			});
			audio.bells.trackAudio(startBell, false);
			return false;
		}
	};

	const playIntervalBell = async (): Promise<boolean> => {
		if (!intervalBell) {
			console.warn('[audio] playIntervalBell called but intervalBell is not set');
			return false;
		}

		debugLog('[audio] playIntervalBell invoked', {
			src: intervalBell.src,
			isStartBellSet: Boolean(startBell),
			isStartBellPlaying: startBell ? !startBell.paused : false
		});

		// Do not play interval bell while the start/finish bell is playing
		if (startBell && !startBell.paused) {
			debugLog('[audio] playIntervalBell skipped because start bell is playing', {
				startBellSrc: startBell.src
			});
			return false;
		}

		try {
			intervalBell.currentTime = 0;
			audio.bells.trackAudio(intervalBell, true);
			await intervalBell.play();

			debugLog('[audio] playIntervalBell success', {
				src: intervalBell.src
			});
			return true;
		} catch (err: unknown) {
			const error = err as Error;
			console.error('[audio] Failed to play interval bell', {
				src: intervalBell.src,
				name: error?.name,
				message: error?.message,
				fullError: error
			});
			audio.bells.trackAudio(intervalBell, false);
			return false;
		}
	};

	const stopAll = async (): Promise<void> => {
		const audioElements = [startBell, intervalBell].filter(
			(audio): audio is HTMLAudioElement => audio !== undefined
		);

		debugLog('[audio] stopAll invoked', {
			audioElementCount: audioElements.length
		});

		await Promise.all(
			audioElements.map(async (audioElement) => {
				await audioElement.pause();
				audioElement.currentTime = 0;
				audio.bells.trackAudio(audioElement, false);
			})
		);
	};

	const updateStartBellVolume = (volume: number) => {
		if (startBell) {
			startBell.volume = volume;
			debugLog('[audio] updateStartBellVolume', {
				src: startBell.src,
				volume
			});
		}
	};

	const updateIntervalBellVolume = (volume: number) => {
		if (intervalBell) {
			intervalBell.volume = volume;
			debugLog('[audio] updateIntervalBellVolume', {
				src: intervalBell.src,
				volume
			});
		}
	};

	return {
		setStartBell,
		setIntervalBell,
		initializeMobileAudio,
		playStartBell,
		playIntervalBell,
		stopAll,
		updateStartBellVolume,
		updateIntervalBellVolume,
		get startBell() {
			return startBell;
		},
		get intervalBell() {
			return intervalBell;
		}
	};
}
