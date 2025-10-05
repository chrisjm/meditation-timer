import { describe, it, expect } from 'vitest';
import {
	validateDuration,
	validateIntervalTime,
	validateVolume,
	validateTimerSettings,
	clampDuration,
	clampIntervalTime,
	clampVolume,
	TIMER_CONSTRAINTS
} from './timerSettings';

describe('timerSettings validators', () => {
	describe('validateDuration', () => {
		it('should accept valid durations', () => {
			const result = validateDuration(600);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject durations below minimum', () => {
			const result = validateDuration(30);
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0]).toContain('at least');
		});

		it('should reject durations above maximum', () => {
			const result = validateDuration(10000);
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0]).toContain('at most');
		});

		it('should reject non-numeric values', () => {
			const result = validateDuration(NaN);
			expect(result.isValid).toBe(false);
			expect(result.errors[0]).toContain('valid number');
		});
	});

	describe('validateIntervalTime', () => {
		it('should accept valid interval times', () => {
			const result = validateIntervalTime(120);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should accept zero (disabled)', () => {
			const result = validateIntervalTime(0);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject negative interval times', () => {
			const result = validateIntervalTime(-10);
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(1);
		});

		it('should reject interval times above maximum', () => {
			const result = validateIntervalTime(5000);
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0]).toContain('at most');
		});

		it('should reject non-numeric values', () => {
			const result = validateIntervalTime(NaN);
			expect(result.isValid).toBe(false);
			expect(result.errors[0]).toContain('valid number');
		});
	});

	describe('validateVolume', () => {
		it('should accept valid volumes', () => {
			const result = validateVolume(0.5);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject volumes above maximum', () => {
			const result = validateVolume(1.5);
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(1);
		});

		it('should reject negative volumes', () => {
			const result = validateVolume(-0.5);
			expect(result.isValid).toBe(false);
			expect(result.errors).toHaveLength(1);
		});

		it('should use custom name in error messages', () => {
			const result = validateVolume(1.5, 'Custom Volume');
			expect(result.errors[0]).toContain('Custom Volume');
		});
	});

	describe('validateTimerSettings', () => {
		it('should accept valid settings', () => {
			const result = validateTimerSettings({
				duration: 600,
				intervalTime: 120,
				startStopBellVolume: 0.7,
				intervalBellVolume: 0.7,
				backgroundMusicVolume: 0.5
			});
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should collect all validation errors', () => {
			const result = validateTimerSettings({
				duration: 30,
				intervalTime: -10,
				startStopBellVolume: 1.5,
				intervalBellVolume: -0.5,
				backgroundMusicVolume: 2.0
			});
			expect(result.isValid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});
	});

	describe('clampDuration', () => {
		it('should return valid durations unchanged', () => {
			expect(clampDuration(600)).toBe(600);
		});

		it('should clamp durations below minimum', () => {
			expect(clampDuration(30)).toBe(TIMER_CONSTRAINTS.duration.min);
		});

		it('should clamp durations above maximum', () => {
			expect(clampDuration(10000)).toBe(TIMER_CONSTRAINTS.duration.max);
		});
	});

	describe('clampIntervalTime', () => {
		it('should return valid interval times unchanged', () => {
			expect(clampIntervalTime(120)).toBe(120);
		});

		it('should allow zero (disabled)', () => {
			expect(clampIntervalTime(0)).toBe(0);
		});

		it('should clamp negative interval times to minimum', () => {
			expect(clampIntervalTime(-10)).toBe(TIMER_CONSTRAINTS.intervalTime.min);
		});

		it('should clamp interval times above maximum', () => {
			expect(clampIntervalTime(5000)).toBe(TIMER_CONSTRAINTS.intervalTime.max);
		});
	});

	describe('clampVolume', () => {
		it('should return valid volumes unchanged', () => {
			expect(clampVolume(0.5)).toBe(0.5);
		});

		it('should clamp volumes below minimum', () => {
			expect(clampVolume(-0.5)).toBe(TIMER_CONSTRAINTS.volume.min);
		});

		it('should clamp volumes above maximum', () => {
			expect(clampVolume(1.5)).toBe(TIMER_CONSTRAINTS.volume.max);
		});
	});
});
