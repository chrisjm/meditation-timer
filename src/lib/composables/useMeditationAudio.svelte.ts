import { audio } from '$lib/stores/audio';
import { initializeAudio, isMobile, audioUnlocked } from '$lib/utils/mobileAudioManager';
import { get } from 'svelte/store';

export function useMeditationAudio() {
	let startBell = $state<HTMLAudioElement | undefined>();
	let intervalBell = $state<HTMLAudioElement | undefined>();

	const setStartBell = (element: HTMLAudioElement | undefined) => {
		startBell = element;
		if (element) {
			element.addEventListener('ended', () => audio.bells.trackAudio(element, false));
			element.addEventListener('play', () => audio.bells.trackAudio(element, true));
		}
	};

	const setIntervalBell = (element: HTMLAudioElement | undefined) => {
		intervalBell = element;
		if (element) {
			element.addEventListener('ended', () => audio.bells.trackAudio(element, false));
			element.addEventListener('play', () => audio.bells.trackAudio(element, true));
		}
	};

	const initializeMobileAudio = async (): Promise<boolean> => {
		const audioElements = [startBell, intervalBell].filter(
			(audio): audio is HTMLAudioElement => audio !== undefined
		);

		try {
			await initializeAudio(audioElements);
			return true;
		} catch (err) {
			console.error('Failed to initialize audio:', err);
			return false;
		}
	};

	const playStartBell = async (): Promise<boolean> => {
		if (!startBell) {
			console.warn('[audio] playStartBell called but startBell is not set');
			return false;
		}

		console.log('[audio] playStartBell called', {
			src: startBell.src,
			readyState: startBell.readyState,
			paused: startBell.paused,
			currentTime: startBell.currentTime,
			muted: startBell.muted,
			volume: startBell.volume
		});

		try {
			startBell.currentTime = 0;
			await startBell.play();
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

		console.log('[audio] playIntervalBell called', {
			src: intervalBell.src,
			readyState: intervalBell.readyState,
			paused: intervalBell.paused,
			currentTime: intervalBell.currentTime,
			muted: intervalBell.muted,
			volume: intervalBell.volume
		});

		try {
			intervalBell.currentTime = 0;
			await intervalBell.play();
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
		}
	};

	const updateIntervalBellVolume = (volume: number) => {
		if (intervalBell) {
			intervalBell.volume = volume;
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
