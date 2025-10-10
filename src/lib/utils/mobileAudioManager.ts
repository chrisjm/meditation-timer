import { writable, get } from 'svelte/store';

export const audioUnlocked = writable(false);

export const isIOS = () => {
  return (
    typeof window !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  );
};

export const isAndroid = () => {
  return typeof window !== 'undefined' && /Android/.test(navigator.userAgent);
};
export const isMobile = () => isIOS() || isAndroid();

/**
 * Initializes audio for mobile browsers by "priming" each audio element.
 * This allows programmatic playback later (e.g., by timers).
 */
export const initializeAudio = async (audioElements: HTMLAudioElement[]) => {
  if (!isMobile() || get(audioUnlocked)) {
    audioUnlocked.set(true);
    return;
  }

  // Prime each audio element with muted play/pause
  for (const audio of audioElements) {
    try {
      const wasMuted = audio.muted;
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = wasMuted;
    } catch (error) {
      console.error('Error priming audio element:', audio.src, error);
    }
  }

  audioUnlocked.set(true);
};

export const setVolume = (audioElement: HTMLAudioElement, value: number) => {
  if (!audioElement) return;

  const newVolume = Math.max(0, Math.min(1, value));

  if (isIOS()) {
    audioElement.dataset.desiredVolume = newVolume.toString();
  } else {
    audioElement.volume = newVolume;
  }

  return newVolume;
};
