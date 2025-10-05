import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { shouldPlayInterval } from './intervalHandler';
import { masterTimer } from './masterTimer';
import { timerSettings } from './timerSettings';

describe('intervalHandler', () => {
	beforeEach(() => {
		masterTimer.reset();
		timerSettings.set({
			duration: 300,
			intervalTime: 60,
			startStopBellEnabled: true,
			startStopBellVolume: 0.7,
			intervalBellEnabled: true,
			intervalBellVolume: 0.7,
			isDebugMode: false,
			backgroundMusicEnabled: true,
			backgroundMusicVolume: 0.5,
			theme: 'auto'
		});
	});

	afterEach(() => {
		masterTimer.cleanup();
	});

	describe('shouldPlayInterval', () => {
		it('should not play when timer is idle', () => {
			expect(get(shouldPlayInterval)).toBe(false);
		});

		it('should not play when interval time is 0 (disabled)', () => {
			timerSettings.update(s => ({ ...s, intervalTime: 0 }));
			masterTimer.start(300);
			expect(get(shouldPlayInterval)).toBe(false);
		});

		it('should not play at the very start (0 elapsed time)', () => {
			timerSettings.update(s => ({ ...s, duration: 300, intervalTime: 60 }));
			masterTimer.start(300);
			// At start, currentTime = 300, elapsed = 0
			expect(get(shouldPlayInterval)).toBe(false);
		});

		it('should play when crossing first interval boundary', async () => {
			vi.useFakeTimers();
			timerSettings.update(s => ({ ...s, duration: 300, intervalTime: 60 }));
			masterTimer.start(300, true); // debug mode (100ms ticks)

			// Advance time to cross the first interval (60 seconds elapsed = currentTime 240)
			// In debug mode, each tick is 100ms, so 61 ticks = 6100ms
			await vi.advanceTimersByTimeAsync(6100);

			const shouldPlay = get(shouldPlayInterval);
			// After crossing 60s elapsed, should have triggered
			expect(shouldPlay).toBe(true);

			vi.useRealTimers();
		});

		it('should reset interval tracking when timer is paused', () => {
			timerSettings.update(s => ({ ...s, duration: 300, intervalTime: 60 }));
			masterTimer.start(300);
			masterTimer.pause();
			expect(get(shouldPlayInterval)).toBe(false);
		});

		it('should not play at the very end (currentTime = 0)', () => {
			timerSettings.update(s => ({ ...s, duration: 60, intervalTime: 30 }));
			masterTimer.start(60);

			// Manually set to end state
			masterTimer.stop();
			expect(get(shouldPlayInterval)).toBe(false);
		});

		it('should only trigger once per interval crossing', async () => {
			vi.useFakeTimers();
			timerSettings.update(s => ({ ...s, duration: 300, intervalTime: 60 }));
			masterTimer.start(300, true);

			// Cross first interval
			await vi.advanceTimersByTimeAsync(6100);
			const firstCheck = get(shouldPlayInterval);
			expect(firstCheck).toBe(true);

			// Check again without crossing another interval
			await vi.advanceTimersByTimeAsync(100);
			const secondCheck = get(shouldPlayInterval);
			expect(secondCheck).toBe(false);

			vi.useRealTimers();
		});

		it('should trigger at multiple interval boundaries', async () => {
			vi.useFakeTimers();
			timerSettings.update(s => ({ ...s, duration: 300, intervalTime: 60 }));
			masterTimer.start(300, true);

			// Cross first interval (60s elapsed)
			await vi.advanceTimersByTimeAsync(6100);
			expect(get(shouldPlayInterval)).toBe(true);

			// Cross second interval (120s elapsed) - need another 6000ms
			await vi.advanceTimersByTimeAsync(6000);
			expect(get(shouldPlayInterval)).toBe(true);

			vi.useRealTimers();
		});
	});
});
