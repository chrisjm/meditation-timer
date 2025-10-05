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

  let state: AudioControl = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    audioElement: undefined,
  };

  subscribe(value => {
    state = value;
  });

  return {
    subscribe,
    setAudioElement: (element: HTMLAudioElement | undefined) =>
      update(s => {
        state = { ...s, audioElement: element };
        return state;
      }),
    setPlaying: (isPlaying: boolean) => {
      update(s => {
        if (s.audioElement && s.isPlaying !== isPlaying) {
          if (isPlaying) {
            s.audioElement.play().catch(err => {
              console.error('Failed to play audio:', err);
            });
          } else {
            s.audioElement.pause();
          }
        }
        return { ...s, isPlaying };
      });
    },
    setTime: (currentTime: number) => {
      update(s => ({ ...s, currentTime }));
    },
    setDuration: (duration: number) => {
      update(s => ({ ...s, duration }));
    },
    reset: () => {
      update(s => {
        if (s.audioElement) {
          s.audioElement.pause();
          s.audioElement.currentTime = 0;
        }
        return { ...s, isPlaying: false, currentTime: 0, duration: 0 };
      });
    },
  };
};

export const audioControl = createAudioControl();
