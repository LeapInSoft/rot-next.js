import * as ROT from '@/src';
import { describe, expect, it } from 'vitest';

describe('Noise.Simplex', () => {
	it('produces repeatable, finite samples for a seeded permutation table', () => {
		const previousState = ROT.RNG.getState();
		try {
			ROT.RNG.setSeed(1234);
			const first = new ROT.Noise.Simplex();
			const firstSamples = [[0, 0], [0.25, 0.75], [-2.5, 3.125]].map(([x, y]) => first.get(x, y));

			ROT.RNG.setSeed(1234);
			const second = new ROT.Noise.Simplex();
			const secondSamples = [[0, 0], [0.25, 0.75], [-2.5, 3.125]].map(([x, y]) => second.get(x, y));

			expect(secondSamples).toEqual(firstSamples);
			expect(firstSamples.every((value) => Number.isFinite(value) && value >= -1 && value <= 1)).toBe(true);
			expect(new Set(firstSamples).size).toBeGreaterThan(1);
		} finally {
			ROT.RNG.setState(previousState);
		}
	});

	it('uses the requested gradient count for its permutation table', () => {
		const previousState = ROT.RNG.getState();
		try {
			ROT.RNG.setSeed(42);
			const noise = new ROT.Noise.Simplex(8);

			expect(noise._perms).toHaveLength(16);
			expect(noise._indexes).toHaveLength(16);
			expect(noise.get(1.25, -0.5)).toEqual(expect.any(Number));
		} finally {
			ROT.RNG.setState(previousState);
		}
	});
});
