export function useWakeLock() {
	let wakeLock = $state<WakeLockSentinel | null>(null);

	const acquire = async (): Promise<boolean> => {
		if (wakeLock) {
			console.debug('[wakeLock] acquire called but wake lock already active');
			return true;
		}

		try {
			console.debug('[wakeLock] requesting wake lock');
			wakeLock = await navigator.wakeLock?.request('screen');
			console.debug('[wakeLock] wake lock acquired', {
				hasWakeLock: Boolean(wakeLock)
			});
			return true;
		} catch (err) {
			console.log(`Failed to request wake lock: ${err}`);
			return false;
		}
	};

	const release = async (): Promise<boolean> => {
		if (!wakeLock) {
			console.debug('[wakeLock] release called but no active wake lock');
			return true;
		}

		try {
			console.debug('[wakeLock] releasing wake lock');
			await wakeLock.release();
			wakeLock = null;
			console.debug('[wakeLock] wake lock released');
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
