import { writable } from 'svelte/store';

interface HLSPlayerState {
	isPlaying: boolean;
	currentTime: number;
	duration: number;
	audioElement?: HTMLAudioElement;
}

interface BellAudioState {
	activeAudio: Set<HTMLAudioElement>;
}

interface AudioStore {
	hls: HLSPlayerState;
	bells: BellAudioState;
}

const createAudioStore = () => {
	const { subscribe, set, update } = writable<AudioStore>({
		hls: {
			isPlaying: false,
			currentTime: 0,
			duration: 0,
			audioElement: undefined
		},
		bells: {
			activeAudio: new Set()
		}
	});

	let state: AudioStore = {
		hls: {
			isPlaying: false,
			currentTime: 0,
			duration: 0,
			audioElement: undefined
		},
		bells: {
			activeAudio: new Set()
		}
	};

	subscribe((value) => {
		state = value;
	});

	return {
		subscribe,

		hls: {
			setAudioElement: (element: HTMLAudioElement | undefined) =>
				update((s) => ({
					...s,
					hls: { ...s.hls, audioElement: element }
				})),

			setPlaying: (isPlaying: boolean) => {
				update((s) => {
					if (s.hls.audioElement && s.hls.isPlaying !== isPlaying) {
						if (isPlaying) {
							s.hls.audioElement.play().catch((err) => {
								console.error('Failed to play audio:', err);
							});
						} else {
							s.hls.audioElement.pause();
						}
					}
					return { ...s, hls: { ...s.hls, isPlaying } };
				});
			},

			setTime: (currentTime: number) =>
				update((s) => ({
					...s,
					hls: { ...s.hls, currentTime }
				})),

			setDuration: (duration: number) =>
				update((s) => ({
					...s,
					hls: { ...s.hls, duration }
				})),

			reset: () =>
				update((s) => {
					if (s.hls.audioElement) {
						s.hls.audioElement.pause();
						s.hls.audioElement.currentTime = 0;
					}
					return {
						...s,
						hls: {
							...s.hls,
							isPlaying: false,
							currentTime: 0,
							duration: 0
						}
					};
				})
		},

		bells: {
			trackAudio: (audio: HTMLAudioElement | undefined, isPlaying: boolean) =>
				update((s) => {
					if (!audio) return s;

					const newActiveAudio = new Set(s.bells.activeAudio);
					if (isPlaying) {
						newActiveAudio.add(audio);
					} else {
						newActiveAudio.delete(audio);
					}

					return {
						...s,
						bells: { activeAudio: newActiveAudio }
					};
				}),

			reset: () =>
				update((s) => ({
					...s,
					bells: { activeAudio: new Set() }
				}))
		}
	};
};

export const audio = createAudioStore();
