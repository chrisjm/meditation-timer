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

let audioContext: AudioContext | null = null;
const elementSources = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();

const ensureAudioContext = async (): Promise<AudioContext | null> => {
  if (typeof window === 'undefined') return null;

  const AudioContextCtor =
    (window as any).AudioContext || (window as any).webkitAudioContext;

  if (!AudioContextCtor) {
    console.warn('[audio] AudioContext is not available in this browser');
    return null;
  }

  if (!audioContext) {
    try {
      audioContext = new AudioContextCtor();
    } catch (error) {
      console.error('[audio] Failed to create AudioContext', error);
      audioContext = null;
      return null;
    }
  }

  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (error) {
      console.error('[audio] Failed to resume AudioContext', error);
    }
  }

  console.log('[audio] AudioContext state after ensure', {
    state: audioContext?.state
  });

  return audioContext;
};

const connectElementToContext = (audio: HTMLAudioElement, context: AudioContext) => {
  if (elementSources.has(audio)) {
    return;
  }

  try {
    const source = context.createMediaElementSource(audio);
    source.connect(context.destination);
    elementSources.set(audio, source);

    console.log('[audio] Connected element to AudioContext', { src: audio.src });
  } catch (error) {
    console.error('[audio] Failed to create MediaElementSource', {
      src: audio.src,
      error
    });
  }
};

/**
 * Initializes audio for mobile browsers by "priming" each audio element.
 * This allows programmatic playback later (e.g., by timers).
 */
export const initializeAudio = async (audioElements: HTMLAudioElement[]) => {
  const isMobileDevice = isMobile();
  const isAlreadyUnlocked = get(audioUnlocked);

  console.log('[audio] initializeAudio called', {
    isMobileDevice,
    isAlreadyUnlocked,
    elementCount: audioElements.length,
    sources: audioElements.map((element) => element.src)
  });

  if (!isMobileDevice || isAlreadyUnlocked) {
    audioUnlocked.set(true);
    return;
  }

  const context = await ensureAudioContext();

  for (const audio of audioElements) {
    console.log('[audio] priming audio element (before)', {
      src: audio.src,
      readyState: audio.readyState,
      paused: audio.paused,
      currentTime: audio.currentTime,
      muted: audio.muted,
      volume: audio.volume
    });

    if (context) {
      connectElementToContext(audio, context);
    }

    try {
      if (audio.readyState === 0) {
        audio.load();
      }

      const wasMuted = audio.muted;
      audio.muted = true;
      await audio.play();
      audio.pause();
      audio.currentTime = 0;
      audio.muted = wasMuted;

      console.log('[audio] priming audio element (after)', {
        src: audio.src,
        readyState: audio.readyState,
        paused: audio.paused,
        currentTime: audio.currentTime,
        muted: audio.muted,
        volume: audio.volume
      });
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
