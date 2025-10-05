export function useWakeLock() {
	let wakeLock = $state<WakeLockSentinel | null>(null);

	const acquire = async (): Promise<boolean> => {
		if (wakeLock) {
			return true;
		}

		try {
			wakeLock = await navigator.wakeLock?.request('screen');
			return true;
		} catch (err) {
			console.log(`Failed to request wake lock: ${err}`);
			return false;
		}
	};

	const release = async (): Promise<boolean> => {
		if (!wakeLock) {
			return true;
		}

		try {
			await wakeLock.release();
			wakeLock = null;
			return true;
		} catch (err) {
			console.log(`Failed to release wake lock: ${err}`);
			return false;
		}
	};

	const isActive = $derived(wakeLock !== null);

	return {
		acquire,
		release,
		get isActive() {
			return isActive;
		}
	};
}
