import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { shouldPlayInterval } from './intervalHandler.svelte';
import { masterTimer } from './masterTimer.svelte';
import { timerSettings } from './timerSettings.svelte';

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
		vi.useRealTimers();
	});

	describe('shouldPlayInterval', () => {
		it('should not play when timer is idle', () => {
			expect(get(shouldPlayInterval)).toBe(null);
		});

		it('should not play when interval time is 0 (disabled)', () => {
			timerSettings.update((s) => ({ ...s, intervalTime: 0 }));
			masterTimer.start(300);
			expect(get(shouldPlayInterval)).toBe(null);
		});

		it('should not play at the very start (0 elapsed time)', () => {
			timerSettings.update((s) => ({ ...s, duration: 300, intervalTime: 60 }));
			masterTimer.start(300);
			// At start, currentTime = 300, elapsed = 0
			expect(get(shouldPlayInterval)).toBe(null);
		});

		it('should play when crossing first interval boundary', async () => {
			vi.useFakeTimers();
			timerSettings.update((s) => ({ ...s, duration: 300, intervalTime: 60 }));
			masterTimer.start(300);

			// Advance time to cross the first interval (60 seconds elapsed = currentTime 240)
			await vi.advanceTimersByTimeAsync(60_000);

			const shouldPlay = get(shouldPlayInterval);
			// After crossing 60s elapsed, should have triggered
			expect(shouldPlay).toBe(1);
		});

		it('should reset interval tracking when timer is paused', () => {
			timerSettings.update((s) => ({ ...s, duration: 300, intervalTime: 60 }));
			masterTimer.start(300);
			masterTimer.pause();
			expect(get(shouldPlayInterval)).toBe(null);
		});

		it('should not play at the very end (currentTime = 0)', () => {
			timerSettings.update((s) => ({ ...s, duration: 60, intervalTime: 30 }));
			masterTimer.start(60);

			masterTimer.stop();
			expect(get(shouldPlayInterval)).toBe(null);
		});

		it('should only trigger once per interval crossing', async () => {
			vi.useFakeTimers();
			timerSettings.update((s) => ({ ...s, duration: 300, intervalTime: 60 }));
			masterTimer.start(300);

			await vi.advanceTimersByTimeAsync(60_000);
			const firstCheck = get(shouldPlayInterval);
			expect(firstCheck).toBe(1);

			// Check again without crossing another interval (one more tick)
			await vi.advanceTimersByTimeAsync(1_000);
			const secondCheck = get(shouldPlayInterval);
			expect(secondCheck).toBe(null);
		});

		it('should trigger at multiple interval boundaries', async () => {
			vi.useFakeTimers();
			timerSettings.update((s) => ({ ...s, duration: 300, intervalTime: 60 }));

			const triggers: number[] = [];
			const unsubscribe = shouldPlayInterval.subscribe((value) => {
				if (typeof value === 'number') triggers.push(value);
			});

			masterTimer.start(300);

			// Cross first interval (60s elapsed)
			await vi.advanceTimersByTimeAsync(60_000);
			expect(triggers).toContain(1);

			// Cross second interval (120s elapsed)
			await vi.advanceTimersByTimeAsync(60_000);
			expect(triggers).toContain(2);

			unsubscribe();
		});
	});
});
