import { SvelteSet } from 'svelte/reactivity';

export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerState {
	currentTime: number;
	status: TimerStatus;
	initialDuration: number;
}

const timerState = $state<TimerState>({
	currentTime: 0,
	status: 'idle',
	initialDuration: 0
});

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let endTimestampMs: number | null = null;
let pauseStartedAtMs: number | null = null;
let hasReachedZero = false;

let lifecycleCleanup: (() => void) | null = null;

const attachLifecycleListeners = (): void => {
	if (lifecycleCleanup) {
		return;
	}

	if (typeof document === 'undefined' || typeof window === 'undefined') {
		return;
	}

	const handleVisibilityChange = () => {
		if (document.visibilityState === 'visible') {
			tick();
		}
	};

	const handleFocus = () => {
		tick();
	};

	const handlePageShow = () => {
		tick();
	};

	document.addEventListener('visibilitychange', handleVisibilityChange);
	window.addEventListener('focus', handleFocus);
	window.addEventListener('pageshow', handlePageShow);

	lifecycleCleanup = () => {
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		window.removeEventListener('focus', handleFocus);
		window.removeEventListener('pageshow', handlePageShow);
	};
};

const detachLifecycleListeners = (): void => {
	if (!lifecycleCleanup) {
		return;
	}

	lifecycleCleanup();
	lifecycleCleanup = null;
};

type TimerSubscriber = (state: TimerState) => void;

const subscribers = new SvelteSet<TimerSubscriber>();

const notifySubscribers = (): void => {
	subscribers.forEach((run) => {
		run(timerState);
	});
};

const clearTimerInterval = (): void => {
	if (intervalHandle) {
		clearInterval(intervalHandle);
		intervalHandle = null;
	}
};

const tick = (): void => {
	if (timerState.status !== 'running' || endTimestampMs === null) {
		return;
	}

	if (hasReachedZero && timerState.currentTime === 0) {
		clearTimerInterval();
		hasReachedZero = false;
		timerState.status = 'completed';
		notifySubscribers();
		return;
	}

	const remainingSeconds = Math.max(0, Math.ceil((endTimestampMs - Date.now()) / 1000));

	if (remainingSeconds !== timerState.currentTime) {
		timerState.currentTime = remainingSeconds;
		notifySubscribers();
	}

	if (remainingSeconds === 0) {
		hasReachedZero = true;
	}
};

const startTimerInterval = (): void => {
	clearTimerInterval();
	intervalHandle = setInterval(tick, 1000);
};

const clearRuntimeState = (): void => {
	endTimestampMs = null;
	pauseStartedAtMs = null;
	hasReachedZero = false;
};

const start = (duration: number): void => {
	clearTimerInterval();
	clearRuntimeState();
	attachLifecycleListeners();

	timerState.currentTime = duration;
	timerState.status = 'running';
	timerState.initialDuration = duration;

	notifySubscribers();

	endTimestampMs = Date.now() + duration * 1000;
	startTimerInterval();
	tick();
};

const pause = (): void => {
	if (timerState.status === 'running') {
		pauseStartedAtMs = Date.now();
		clearTimerInterval();
		hasReachedZero = false;
		timerState.status = 'paused';
	} else if (timerState.status === 'paused') {
		if (pauseStartedAtMs !== null && endTimestampMs !== null) {
			endTimestampMs += Date.now() - pauseStartedAtMs;
		}
		pauseStartedAtMs = null;
		timerState.status = 'running';
		startTimerInterval();
		tick();
	}

	notifySubscribers();
};

const reset = (): void => {
	clearTimerInterval();
	clearRuntimeState();
	detachLifecycleListeners();

	timerState.currentTime = timerState.initialDuration;
	timerState.status = 'idle';

	notifySubscribers();
};

const stop = (): void => {
	clearTimerInterval();
	clearRuntimeState();
	detachLifecycleListeners();

	timerState.currentTime = timerState.initialDuration;
	timerState.status = 'idle';

	notifySubscribers();
};

const setIdleDuration = (duration: number): void => {
	clearTimerInterval();
	clearRuntimeState();
	detachLifecycleListeners();

	timerState.currentTime = duration;
	timerState.initialDuration = duration;
	timerState.status = 'idle';

	notifySubscribers();
};

const cleanup = (): void => {
	clearTimerInterval();
	clearRuntimeState();
	detachLifecycleListeners();
};

const subscribe = (run: TimerSubscriber): (() => void) => {
	subscribers.add(run);
	run(timerState);

	return () => {
		subscribers.delete(run);
	};
};

const masterTimer = {
	subscribe,
	start,
	pause,
	reset,
	stop,
	setIdleDuration,
	cleanup
};

const createDerivedStore = <T>(compute: (state: TimerState) => T) => {
	return {
		subscribe(run: (value: T) => void): () => void {
			let currentValue = compute(timerState);
			run(currentValue);

			const unsubscribe = subscribe((state) => {
				const nextValue = compute(state);
				if (nextValue === currentValue) return;
				currentValue = nextValue;
				run(currentValue);
			});

			return unsubscribe;
		}
	};
};

const isRunning = createDerivedStore((state) => state.status === 'running');
const isPaused = createDerivedStore((state) => state.status === 'paused');
const isIdle = createDerivedStore((state) => state.status === 'idle');
const isCompleted = createDerivedStore((state) => state.status === 'completed');

const progress = createDerivedStore((state) => {
	if (state.initialDuration <= 0) {
		return 0;
	}

	const rawProgress = (state.initialDuration - state.currentTime) / state.initialDuration;

	if (!Number.isFinite(rawProgress)) {
		return 0;
	}

	return Math.min(1, Math.max(0, rawProgress));
});

export { masterTimer, isRunning, isPaused, isIdle, isCompleted, progress };
