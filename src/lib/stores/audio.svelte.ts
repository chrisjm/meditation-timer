import { SvelteSet } from 'svelte/reactivity';
import { timerSettings, type TimerSettings } from '$lib/stores/timerSettings.svelte';

const isDev = import.meta.env.DEV;
let shouldDebugLog = isDev;

timerSettings.subscribe((settings: TimerSettings) => {
	shouldDebugLog = isDev && settings.isDebugMode;
});

export interface HLSPlayerState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	audioElement?: HTMLAudioElement;
}

export interface BellAudioState {
	activeAudio: SvelteSet<HTMLAudioElement>;
}

export interface AudioState {
	hls: HLSPlayerState;
	bells: BellAudioState;
}

const audioState = $state<AudioState>({
	hls: {
		isPlaying: false,
		currentTime: 0,
		duration: 0,
		audioElement: undefined
	},
	bells: {
		activeAudio: new SvelteSet<HTMLAudioElement>()
	}
});

type AudioSubscriber = (state: AudioState) => void;

const subscribers = new SvelteSet<AudioSubscriber>();

const notifySubscribers = (): void => {
	subscribers.forEach((run) => {
		run(audioState);
	});
};

const subscribe = (run: AudioSubscriber): (() => void) => {
	subscribers.add(run);
	run(audioState);

	return () => {
		subscribers.delete(run);
	};
};

const setHlsAudioElement = (element: HTMLAudioElement | undefined): void => {
	if (audioState.hls.audioElement === element) {
		return;
	}

	audioState.hls.audioElement = element;
	notifySubscribers();
};

const setHlsPlayingAndSyncElement = (isPlaying: boolean): void => {
	const current = audioState.hls;

	if (current.isPlaying === isPlaying) {
		return;
	}

	if (current.audioElement && current.isPlaying !== isPlaying) {
		if (isPlaying) {
			current.audioElement.play().catch((error) => console.error('Failed to play audio:', error));
		} else {
			current.audioElement.pause();
		}
	}

	audioState.hls.isPlaying = isPlaying;
	notifySubscribers();
};

const setHlsPlayingFromElement = (isPlaying: boolean): void => {
	const current = audioState.hls;

	if (current.isPlaying === isPlaying) {
		return;
	}

	current.isPlaying = isPlaying;
	notifySubscribers();
};

const setHlsTime = (currentTime: number): void => {
	if (audioState.hls.currentTime === currentTime) {
		return;
	}

	audioState.hls.currentTime = currentTime;
	notifySubscribers();
};

const setHlsDuration = (duration: number): void => {
	if (audioState.hls.duration === duration) {
		return;
	}

	audioState.hls.duration = duration;
	notifySubscribers();
};

const resetHls = (): void => {
	const current = audioState.hls;

	if (current.audioElement) {
		current.audioElement.pause();
		current.audioElement.currentTime = 0;
	}

	current.isPlaying = false;
	current.currentTime = 0;
	current.duration = 0;

	notifySubscribers();
};

const trackBellAudio = (audio: HTMLAudioElement | undefined, isPlaying: boolean): void => {
	if (!audio) {
		return;
	}

	const activeAudio = audioState.bells.activeAudio;
	const isCurrentlyActive = activeAudio.has(audio);

	if (isPlaying === isCurrentlyActive) {
		return;
	}

	if (isPlaying) {
		activeAudio.add(audio);
	} else {
		activeAudio.delete(audio);
	}

	if (shouldDebugLog) {
		console.debug('[audio] trackBellAudio', {
			src: audio.src,
			isPlaying,
			activeCount: activeAudio.size
		});
	}

	notifySubscribers();
};

const resetBells = (): void => {
	audioState.bells.activeAudio.clear();
	notifySubscribers();
};

const audio = {
	subscribe,
	hls: {
		setAudioElement: setHlsAudioElement,
		setPlayingAndSyncElement: setHlsPlayingAndSyncElement,
		setPlayingFromElement: setHlsPlayingFromElement,
		setTime: setHlsTime,
		setDuration: setHlsDuration,
		reset: resetHls
	},
	bells: {
		trackAudio: trackBellAudio,
		reset: resetBells
	}
};

export { audio };
