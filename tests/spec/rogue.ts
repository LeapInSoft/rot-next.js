import { Rogue } from '@/src/map/rogue.js';
import { RNG } from '@/src/rng.js';
import { describe, expect, it, vi } from 'vitest';

const sizes = [
	{ width: 15, height: 15, seeds: 100 },
	{ width: 20, height: 10, seeds: 100 },
	{ width: 30, height: 20, seeds: 100 },
	{ width: 80, height: 25, seeds: 200 }
];

describe('Map.Rogue', () => {
	it('constructs with default options', () => {
		expect(() => new Rogue(30, 20)).not.toThrow();
	});

	it('calculates room size bounds with a minimum size of two', () => {
		const map = new Rogue(15, 10, {});

		expect(map._calculateRoomSize(15, 3)).toEqual([2, 4]);
		expect(map._calculateRoomSize(5, 3)).toEqual([2, 2]);
	});

	it('creates every cell with custom grid and room options', () => {
		const width = 41;
		const height = 23;
		const generator = new Rogue(width, height, {
			cellWidth: 4,
			cellHeight: 2,
			roomWidth: [2, 5],
			roomHeight: [2, 4]
		});
		const map = Array.from({ length: width }, () => Array<number>(height).fill(-1));
		let callbackCount = 0;

		RNG.setSeed(1234);
		expect(generator.create((x, y, value) => {
			map[x][y] = value;
			callbackCount++;
		})).toBe(generator);

		expect(callbackCount).toBe(width * height);
		expect(map.flat().every((value) => value === 0 || value === 1)).toBe(true);
		expect(map.flat()).toContain(0);
		expect(map.flat()).toContain(1);
	});

	it('can be recreated with or without a callback', () => {
		const width = 30;
		const height = 20;
		const generator = new Rogue(width, height, {});
		const capture = () => {
			const map = Array.from({ length: width }, () => Array<number>(height).fill(-1));
			generator.create((x, y, value) => {
				map[x][y] = value;
			});
			return map;
		};

		expect(generator.create()).toBe(generator);
		RNG.setSeed(456);
		const firstMap = capture();
		RNG.setSeed(456);
		expect(capture()).toEqual(firstMap);
	});

	it('does not log during map generation', () => {
		const log = vi.spyOn(console, 'log').mockImplementation(() => {});

		try {
			RNG.setSeed(789);
			new Rogue(30, 20, {}).create();
			expect(log).not.toHaveBeenCalled();
		} finally {
			log.mockRestore();
		}
	});

	for (const { width, height, seeds } of sizes) {
		it(`generates connected maps at ${width}x${height}`, () => {
			for (let seed = 0; seed < seeds; seed++) {
				RNG.setSeed(seed);
				const floors = new Set<string>();
				new Rogue(width, height, {}).create((x, y, value) => {
					if (value === 0) { floors.add(`${x},${y}`); }
				});

				const firstFloor = floors.values().next().value;
				expect(firstFloor, `seed ${seed} should create floor cells`).toBeDefined();
				if (firstFloor === undefined) { continue; }

				const reachable = new Set([firstFloor]);
				const pending = [firstFloor];

				while (pending.length) {
					const current = pending.pop();
					if (current === undefined) { continue; }
					const [x, y] = current.split(',').map(Number);
					const neighbors = [`${x - 1},${y}`, `${x + 1},${y}`, `${x},${y - 1}`, `${x},${y + 1}`];

					for (const neighbor of neighbors) {
						if (floors.has(neighbor) && !reachable.has(neighbor)) {
							reachable.add(neighbor);
							pending.push(neighbor);
						}
					}
				}

				expect(reachable.size, `all floor cells should connect for seed ${seed}`).toBe(floors.size);
			}
		});
	}
});
