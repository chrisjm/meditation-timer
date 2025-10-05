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
		expect(get(masterTimer).currentTime).toBe(60);
	});

	it('should stop counting down when paused', () => {
		masterTimer.start(60);
		vi.advanceTimersByTime(2000);
		expect(get(masterTimer).currentTime).toBe(58);
		
		masterTimer.pause();
		vi.advanceTimersByTime(3000);
		// Should still be 58, not counting down
		expect(get(masterTimer).currentTime).toBe(58);
		expect(get(isPaused)).toBe(true);
	});

	it('should resume counting down after unpause', () => {
		masterTimer.start(60);
		vi.advanceTimersByTime(2000);
		expect(get(masterTimer).currentTime).toBe(58);
		
		masterTimer.pause();
		vi.advanceTimersByTime(3000);
		expect(get(masterTimer).currentTime).toBe(58);
		
		// Resume (toggle pause again)
		masterTimer.pause();
		expect(get(isRunning)).toBe(true);
		
		vi.advanceTimersByTime(2000);
		expect(get(masterTimer).currentTime).toBe(56);
	});

	it('should reset to idle state', () => {
		masterTimer.start(60);
		masterTimer.reset();
		expect(get(isIdle)).toBe(true);
	});

	it('should reset to initial duration, not zero', () => {
		masterTimer.start(600);
		vi.advanceTimersByTime(5000);
		expect(get(masterTimer).currentTime).toBe(595);
		
		masterTimer.reset();
		expect(get(masterTimer).currentTime).toBe(600);
		expect(get(masterTimer).initialDuration).toBe(600);
		expect(get(isIdle)).toBe(true);
	});

	it('should maintain correct initial duration after pause and reset', () => {
		masterTimer.start(300);
		vi.advanceTimersByTime(3000);
		expect(get(masterTimer).currentTime).toBe(297);
		
		masterTimer.pause();
		masterTimer.reset();
		
		expect(get(masterTimer).currentTime).toBe(300);
		expect(get(masterTimer).initialDuration).toBe(300);
	});
});
