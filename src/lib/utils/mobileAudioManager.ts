import { writable } from 'svelte/store';

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

export const initializeAudio = async (audioElements: HTMLAudioElement[]) => {
  if (!isMobile()) {
    audioUnlocked.set(true);
    return;
  }

  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContext();

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  for (const audio of audioElements) {
    audio.volume = isIOS() ? 1 : audio.volume;
    try {
      await audio.load();
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  }

  audioUnlocked.set(true);
  return audioContext;
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
