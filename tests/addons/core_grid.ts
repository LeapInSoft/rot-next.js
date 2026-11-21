import { describe, expect, it } from 'vitest';

import { createGridCoordinate, gridKey, manhattanDistance } from '@/addons/core/grid.js';

describe('grid addon', () => {
	it('creates immutable grid coordinates and derives stable keys', () => {
		const origin = createGridCoordinate(2, 3);

		expect(origin).toEqual({x: 2, y: 3});
		expect(Object.isFrozen(origin)).toBe(true);
		expect(gridKey(origin)).toBe('2,3');
		expect(manhattanDistance(origin, createGridCoordinate(5, 7))).toBe(7);
	});
});
