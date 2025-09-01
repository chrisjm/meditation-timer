import { writable } from 'svelte/store';

interface AudioControl {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioElement?: HTMLAudioElement;
}

const createAudioControl = () => {
  const { subscribe, set, update } = writable<AudioControl>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    audioElement: undefined,
  });

  let state: AudioControl;
  subscribe(value => {
    state = value;
  });

  return {
    subscribe,
    setAudioElement: (element: HTMLAudioElement | undefined) =>
      update(state => ({ ...state, audioElement: element })),
    setPlaying: (isPlaying: boolean) => {
      if (state.audioElement) {
        if (isPlaying) {
          state.audioElement.play();
        } else {
          state.audioElement.pause();
        }
      }
      // plausible(isPlaying ? "Audio Pause" : "Audio Play");
      return update(state => ({ ...state, isPlaying }));
    },
    setTime: (currentTime: number) => {
      update(state => ({ ...state, currentTime }));
    },
    setDuration: (duration: number) => {
      update(state => ({ ...state, duration }))
      // plausible("Audio Duration Update");
    },
    reset: () => {
      if (state.audioElement) {
        state.audioElement.pause();
        state.audioElement.currentTime = 0;
      }
      set({ isPlaying: false, currentTime: 0, duration: 0, audioElement: state.audioElement });
      // plausible("Audio Reset");
    },
  };
};

export const audioControl = createAudioControl();
