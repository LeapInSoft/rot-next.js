import { Arena, DividedMaze, EllerMaze, IceyMaze } from '../../src/map/index.js';
import { describe, expect, it } from 'vitest';

describe('Map.create without a callback', () => {
	const generators = [
		{ name: 'Arena', create: () => new Arena(5, 5) },
		{ name: 'DividedMaze', create: () => new DividedMaze(10, 10) },
		{ name: 'EllerMaze', create: () => new EllerMaze(10, 10) },
		{ name: 'IceyMaze', create: () => new IceyMaze(10, 10) }
	];

	for (const { name, create } of generators) {
		it(`${name} should generate without a callback`, () => {
			const map = create();

			expect(() => map.create()).not.toThrow();
		});
	}
});
