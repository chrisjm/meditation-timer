import { writable } from 'svelte/store';

// Store to track if audio has been unlocked
export const audioUnlocked = writable(false);

// Detect iOS
export const isIOS = () => {
  return (
    typeof window !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  );
};

// Detect Android
export const isAndroid = () => {
  return typeof window !== 'undefined' && /Android/.test(navigator.userAgent);
};

// Check if we're on a mobile device
export const isMobile = () => isIOS() || isAndroid();

// Initialize audio context and unlock audio
export const initializeAudio = async (audioElements: HTMLAudioElement[]) => {
  if (!isMobile()) {
    audioUnlocked.set(true);
    return;
  }

  // Create and resume AudioContext
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  const audioContext = new AudioContext();
  
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  // Enable audio elements
  for (const audio of audioElements) {
    // Set initial volume
    audio.volume = isIOS() ? 1 : audio.volume;
    
    // Load audio
    try {
      await audio.load();
    } catch (error) {
      console.error('Error loading audio:', error);
    }
  }

  audioUnlocked.set(true);
  return audioContext;
};

// Handle volume changes based on platform
export const setVolume = (audioElement: HTMLAudioElement, value: number) => {
  if (!audioElement) return;

  // Clamp volume between 0 and 1
  const newVolume = Math.max(0, Math.min(1, value));

  if (isIOS()) {
    // On iOS, we can't change volume programmatically
    // Instead, we'll just store the value for when we move to other platforms
    audioElement.dataset.desiredVolume = newVolume.toString();
  } else {
    audioElement.volume = newVolume;
  }

  return newVolume;
};
