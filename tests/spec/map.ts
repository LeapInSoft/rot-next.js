import { Arena, Cellular, Digger, DividedMaze, EllerMaze, IceyMaze, Rogue, Uniform } from '../../src/map/index.js';
import { describe, expect, it } from 'vitest';

function captureMap(generator: InstanceType<typeof Arena> | InstanceType<typeof DividedMaze> | InstanceType<typeof EllerMaze> | InstanceType<typeof IceyMaze>, width: number, height: number) {
	const map = Array.from({ length: width }, () => Array<number>(height).fill(-1));
	generator.create((x, y, value) => {
		map[x][y] = value;
	});
	return map;
}

function expectConnectedFloors(map: number[][]) {
	const floors = new Set<string>();
	map.forEach((column, x) => column.forEach((value, y) => {
		if (value === 0) { floors.add(`${x},${y}`); }
	}));
	const firstFloor = floors.values().next().value;
	expect(firstFloor).toBeDefined();
	if (firstFloor === undefined) { return; }

	const reachable = new Set([firstFloor]);
	const pending = [firstFloor];
	while (pending.length) {
		const cell = pending.pop();
		if (cell === undefined) { continue; }
		const [x, y] = cell.split(',').map(Number);
		[`${x - 1},${y}`, `${x + 1},${y}`, `${x},${y - 1}`, `${x},${y + 1}`]
			.filter((neighbor) => floors.has(neighbor) && !reachable.has(neighbor))
			.forEach((neighbor) => {
				reachable.add(neighbor);
				pending.push(neighbor);
			});
	}

	expect(reachable.size).toBe(floors.size);
}

describe('Map.create without a callback', () => {
	const generators = [
		{ name: 'Arena', create: () => new Arena(5, 5) },
		{ name: 'Cellular', create: () => new Cellular(10, 10) },
		{ name: 'Digger', create: () => new Digger(30, 20) },
		{ name: 'DividedMaze', create: () => new DividedMaze(10, 10) },
		{ name: 'EllerMaze', create: () => new EllerMaze(10, 10) },
		{ name: 'IceyMaze', create: () => new IceyMaze(10, 10) },
		{ name: 'Rogue', create: () => new Rogue(30, 20) },
		{ name: 'Uniform', create: () => new Uniform(30, 20) }
	];

	for (const { name, create } of generators) {
		it(`${name} should generate without a callback`, () => {
			const map = create();

			expect(() => map.create()).not.toThrow();
		});
	}
});

describe('Map generation', () => {
	it('creates an arena with a wall border and connected interior', () => {
		const map = captureMap(new Arena(9, 7), 9, 7);

		expect(map.every((column) => column.length === 7 && column.every((value) => value === 0 || value === 1))).toBe(true);
		expect(map[0].every((value) => value === 1)).toBe(true);
		expect(map[8].every((value) => value === 1)).toBe(true);
		expect(map[4][3]).toBe(0);
		expectConnectedFloors(map);
	});

	it.each([
		{ name: 'DividedMaze', create: () => new DividedMaze(31, 21) },
		{ name: 'EllerMaze', create: () => new EllerMaze(31, 21) },
		{ name: 'IceyMaze', create: () => new IceyMaze(31, 21) }
	])('%s fills the requested grid with connected floors', ({ create }) => {
		const width = 31;
		const height = 21;
		const map = captureMap(create(), width, height);

		expect(map).toHaveLength(width);
		expect(map.every((column) => column.length === height && column.every((value) => value === 0 || value === 1))).toBe(true);
		expectConnectedFloors(map);
	});
});
