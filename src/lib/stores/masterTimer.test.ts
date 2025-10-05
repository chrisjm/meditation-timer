import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { get } from 'svelte/store';
import { masterTimer, isRunning, isPaused, isIdle } from './masterTimer';

describe('masterTimer', () => {
	beforeEach(() => {
		masterTimer.reset();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should start in idle state', () => {
		const state = get(masterTimer);
		expect(state.status).toBe('idle');
		expect(get(isIdle)).toBe(true);
	});

	it('should transition to running when started', () => {
		masterTimer.start(60);
		expect(get(isRunning)).toBe(true);
		expect(get(masterTimer).currentTime).toBe(60);
	});

	it('should count down when running', () => {
		masterTimer.start(60);
		vi.advanceTimersByTime(1000);
		expect(get(masterTimer).currentTime).toBe(59);
	});

	it('should pause correctly', () => {
		masterTimer.start(60);
		masterTimer.pause();
		expect(get(isPaused)).toBe(true);
	});

	it('should reset to idle state', () => {
		masterTimer.start(60);
		masterTimer.reset();
		expect(get(isIdle)).toBe(true);
	});
});
