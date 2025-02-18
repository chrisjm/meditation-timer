import { writable } from 'svelte/store';

interface AudioControl {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

const createAudioControl = () => {
  const { subscribe, set, update } = writable<AudioControl>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  return {
    subscribe,
    setPlaying: (isPlaying: boolean) => update(state => ({ ...state, isPlaying })),
    setTime: (currentTime: number) => update(state => ({ ...state, currentTime })),
    setDuration: (duration: number) => update(state => ({ ...state, duration })),
    reset: () => set({ isPlaying: false, currentTime: 0, duration: 0 }),
  };
};

export const audioControl = createAudioControl();
