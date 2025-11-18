export interface HLSPlayerState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	audioElement?: HTMLAudioElement;
}

export interface BellAudioState {
	activeAudio: Set<HTMLAudioElement>;
}

export interface AudioState {
	hls: HLSPlayerState;
	bells: BellAudioState;
}

let audioState = $state<AudioState>({
	hls: {
		isPlaying: false,
		currentTime: 0,
		duration: 0,
		audioElement: undefined
	},
	bells: {
		activeAudio: new Set<HTMLAudioElement>()
	}
});

type AudioSubscriber = (state: AudioState) => void;

const subscribers = new Set<AudioSubscriber>();

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
	audioState.hls.audioElement = element;
	notifySubscribers();
};

const setHlsPlaying = (isPlaying: boolean): void => {
	const current = audioState.hls;

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

const setHlsTime = (currentTime: number): void => {
	audioState.hls.currentTime = currentTime;
	notifySubscribers();
};

const setHlsDuration = (duration: number): void => {
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

	if (isPlaying) {
		activeAudio.add(audio);
	} else {
		activeAudio.delete(audio);
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
		setPlaying: setHlsPlaying,
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
