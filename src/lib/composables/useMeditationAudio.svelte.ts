import { audio } from '$lib/stores/audio.svelte';
import { initializeAudio } from '$lib/utils/mobileAudioManager';

export function useMeditationAudio() {
	let startBell = $state<HTMLAudioElement | undefined>();
	let intervalBell = $state<HTMLAudioElement | undefined>();

	const setStartBell = (element: HTMLAudioElement | undefined) => {
		startBell = element;

		console.debug('[audio] setStartBell', {
			hasElement: Boolean(element),
			src: element?.src
		});

		if (element) {
			element.addEventListener('ended', () => audio.bells.trackAudio(element, false));
		}
	};

	const setIntervalBell = (element: HTMLAudioElement | undefined) => {
		intervalBell = element;

		console.debug('[audio] setIntervalBell', {
			hasElement: Boolean(element),
			src: element?.src
		});

		if (element) {
			element.addEventListener('ended', () => audio.bells.trackAudio(element, false));
		}
	};

	const initializeMobileAudio = async (): Promise<boolean> => {
		const audioElements = [startBell, intervalBell].filter(
			(audio): audio is HTMLAudioElement => audio !== undefined
		);

		try {
			console.debug('[audio] initializeMobileAudio (useMeditationAudio)', {
				hasStartBell: Boolean(startBell),
				hasIntervalBell: Boolean(intervalBell),
				audioElementCount: audioElements.length
			});

			await initializeAudio(audioElements);

			console.debug('[audio] initializeMobileAudio success (useMeditationAudio)');
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

		console.debug('[audio] playStartBell invoked', {
			src: startBell.src,
			isIntervalBellSet: Boolean(intervalBell),
			isIntervalBellPlaying: intervalBell ? !intervalBell.paused : false
		});

		// Start/finish bell has priority over interval bells
		if (intervalBell && !intervalBell.paused) {
			console.debug('[audio] playStartBell pausing active interval bell', {
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

			console.debug('[audio] playStartBell success', {
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

		console.debug('[audio] playIntervalBell invoked', {
			src: intervalBell.src,
			isStartBellSet: Boolean(startBell),
			isStartBellPlaying: startBell ? !startBell.paused : false
		});

		// Do not play interval bell while the start/finish bell is playing
		if (startBell && !startBell.paused) {
			console.debug('[audio] playIntervalBell skipped because start bell is playing', {
				startBellSrc: startBell.src
			});
			return false;
		}

		try {
			intervalBell.currentTime = 0;
			audio.bells.trackAudio(intervalBell, true);
			await intervalBell.play();

			console.debug('[audio] playIntervalBell success', {
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

		console.debug('[audio] stopAll invoked', {
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
			console.debug('[audio] updateStartBellVolume', {
				src: startBell.src,
				volume
			});
		}
	};

	const updateIntervalBellVolume = (volume: number) => {
		if (intervalBell) {
			intervalBell.volume = volume;
			console.debug('[audio] updateIntervalBellVolume', {
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
