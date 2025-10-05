import { describe, it, expect } from 'vitest';
import {
	validateDuration,
	validateVolume,
	clampDuration,
	clampVolume
} from './timerSettings';

describe('timerSettings validators', () => {
	it('should accept valid durations', () => {
		const result = validateDuration(600);
		expect(result.isValid).toBe(true);
	});

	it('should reject invalid durations', () => {
		const result = validateDuration(30);
		expect(result.isValid).toBe(false);
	});

	it('should accept valid volumes', () => {
		const result = validateVolume(0.5);
		expect(result.isValid).toBe(true);
	});

	it('should reject invalid volumes', () => {
		const result = validateVolume(1.5);
		expect(result.isValid).toBe(false);
	});

	it('should clamp duration', () => {
		expect(clampDuration(600)).toBe(600);
	});

	it('should clamp volume', () => {
		expect(clampVolume(0.5)).toBe(0.5);
	});
});
