let audioUnlocked = false;

export const getAudioUnlocked = () => audioUnlocked;

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
	const isMobileDevice = isMobile();
	const isAlreadyUnlocked = audioUnlocked;

	console.debug('[audio] initializeAudio called', {
		isMobileDevice,
		isAlreadyUnlocked,
		audioElementCount: audioElements.length
	});

	if (!isMobileDevice || isAlreadyUnlocked) {
		audioUnlocked = true;

		console.debug('[audio] initializeAudio short-circuit', {
			reason: !isMobileDevice ? 'not-mobile' : 'already-unlocked',
			resultUnlocked: audioUnlocked
		});

		return;
	}

	// Prime each audio element with muted play/pause
	for (const audio of audioElements) {
		try {
			console.debug('[audio] initializeAudio priming element', {
				src: audio.src,
				readyState: audio.readyState
			});

			if (audio.readyState === 0) {
				audio.load();
			}

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

	audioUnlocked = true;

	console.debug('[audio] initializeAudio completed', {
		resultUnlocked: audioUnlocked
	});
};

export const setVolume = (audioElement: HTMLAudioElement, value: number) => {
	if (!audioElement) return;

	const newVolume = Math.max(0, Math.min(1, value));

	if (isIOS()) {
		audioElement.dataset.desiredVolume = newVolume.toString();
	} else {
		audioElement.volume = newVolume;
	}

	console.debug('[audio] setVolume', {
		src: audioElement.src,
		newVolume,
		appliedTo: isIOS() ? 'desiredVolumeDataAttribute' : 'elementVolumeProperty'
	});

	return newVolume;
};
