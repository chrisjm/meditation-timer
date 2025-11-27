export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerState {
	currentTime: number;
	status: TimerStatus;
	initialDuration: number;
}

let timerState = $state<TimerState>({
	currentTime: 0,
	status: 'idle',
	initialDuration: 0
});

let intervalHandle: ReturnType<typeof setInterval> | null = null;

type TimerSubscriber = (state: TimerState) => void;

const subscribers = new Set<TimerSubscriber>();

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

const start = (duration: number, debug: boolean = false): void => {
	clearTimerInterval();

	timerState.currentTime = duration;
	timerState.status = 'running';
	timerState.initialDuration = duration;

	notifySubscribers();

	intervalHandle = setInterval(
		() => {
			if (timerState.status === 'running' && timerState.currentTime > 0) {
				timerState.currentTime -= 1;
				notifySubscribers();
				return;
			}

			if (timerState.currentTime === 0) {
				clearTimerInterval();
				timerState.status = 'completed';
				notifySubscribers();
			}
		},
		debug ? 200 : 1000
	);
};

const pause = (): void => {
	if (timerState.status === 'running') {
		timerState.status = 'paused';
	} else if (timerState.status === 'paused') {
		timerState.status = 'running';
	}

	notifySubscribers();
};

const reset = (): void => {
	clearTimerInterval();

	timerState.currentTime = timerState.initialDuration;
	timerState.status = 'idle';

	notifySubscribers();
};

const stop = (): void => {
	clearTimerInterval();

	timerState.currentTime = timerState.initialDuration;
	timerState.status = 'idle';

	notifySubscribers();
};

const setIdleDuration = (duration: number): void => {
	clearTimerInterval();

	timerState.currentTime = duration;
	timerState.initialDuration = duration;
	timerState.status = 'idle';

	notifySubscribers();
};

const cleanup = (): void => {
	clearTimerInterval();
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
