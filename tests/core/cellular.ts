import * as ROT from '@/src';
import { describe, expect, it } from 'vitest';

describe('Map.Cellular', () => {
	function captureAlive(map: InstanceType<typeof ROT.Map.Cellular>) {
		const alive: string[] = [];
		map.create((x, y, value) => {
			if (value) { alive.push(`${x},${y}`); }
		});
		return alive;
	}

	function expectAllFloorsConnected(map: number[][]) {
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
			[
				`${x - 1},${y}`,
				`${x + 1},${y}`,
				`${x},${y - 1}`,
				`${x},${y + 1}`
			].filter((neighbor) => floors.has(neighbor) && !reachable.has(neighbor))
				.forEach((neighbor) => {
					reachable.add(neighbor);
					pending.push(neighbor);
				});
		}

		expect(reachable.size).toBe(floors.size);
	}

	it('should report an empty randomized map without a callback', () => {
		const map = new ROT.Map.Cellular(3, 3);
		map.randomize(0);

		expect(() => map.create()).not.toThrow();
	});

	it('should generate cells according to a 4-topology rule', () => {
		const map = new ROT.Map.Cellular(3, 3, {topology:4, born:[1], survive:[]});
		map.set(0, 0, 1);

		const alive: string[] = [];
		map.create((x, y, value) => {
			if (value) { alive.push(`${x},${y}`); }
		});

		expect(alive).toEqual(['1,0', '0,1']);
	});

	it('should generate cells according to a 6-topology rule', () => {
		const map = new ROT.Map.Cellular(3, 3, {topology:6, born:[1], survive:[]});
		map.set(0, 0, 1);

		const alive: string[] = [];
		map.create((x, y, value) => {
			if (value) { alive.push(`${x},${y}`); }
		});

		expect(alive).toEqual(['2,0', '1,1']);
	});

	it('should use updated topology for neighbor counts and generated cells', () => {
		const map = new ROT.Map.Cellular(3, 3, {topology:8, born:[1], survive:[]});
		map.setOptions({topology:4});
		map.set(0, 0, 1);

		expect(captureAlive(map)).toEqual(['1,0', '0,1']);
	});

	it('should transition through 4-, 6-, and 8-topology neighbor rules', () => {
		const map = new ROT.Map.Cellular(3, 3, {topology:4, born:[1], survive:[]});
		map.set(0, 0, 1);
		expect(captureAlive(map)).toEqual(['1,0', '0,1']);

		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				map.set(x, y, 0);
			}
		}
		map.set(0, 0, 1);
		map.setOptions({topology:6});
		expect(captureAlive(map)).toEqual(['2,0', '1,1']);

		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				map.set(x, y, 0);
			}
		}
		map.set(0, 0, 1);
		map.setOptions({topology:8});
		expect(captureAlive(map)).toEqual(['1,0', '0,1', '1,1']);
	});

	it('should report the map when no cells have the requested value', () => {
		const map = new ROT.Map.Cellular(2, 2);
		const cells: string[] = [];

		expect(() => map.connect((x, y, value) => cells.push(`${x},${y}:${value}`), 1)).not.toThrow();
		expect(cells).toEqual(['0,0:0', '1,0:0', '0,1:0', '1,1:0']);
	});

	it('should leave an all-wall map unchanged and report it as a no-op', () => {
		const map = new ROT.Map.Cellular(3, 3);
		const cells: string[] = [];
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				map.set(x, y, 1);
			}
		}

		expect(() => map.connect((x, y, value) => cells.push(`${x},${y}:${value}`), 0)).not.toThrow();
		expect(cells).toEqual([
			'0,0:1', '1,0:1', '2,0:1',
			'0,1:1', '1,1:1', '2,1:1',
			'0,2:1', '1,2:1', '2,2:1'
		]);
	});

	it('should handle a single free cell without choosing invalid random indexes', () => {
		const map = new ROT.Map.Cellular(3, 3);
		for (let x = 0; x < 3; x++) {
			for (let y = 0; y < 3; y++) {
				map.set(x, y, 1);
			}
		}
		map.set(1, 1, 0);
		const cells: string[] = [];

		expect(() => map.connect((x, y, value) => cells.push(`${x},${y}:${value}`), 0)).not.toThrow();
		expect(cells).toContain('1,1:0');
	});

	it('should connect one or more disconnected free-cell components', () => {
		const map = new ROT.Map.Cellular(5, 5);
		for (let x = 0; x < 5; x++) {
			for (let y = 0; y < 5; y++) {
				map.set(x, y, 1);
			}
		}
		map.set(1, 1, 0);
		map.set(3, 3, 0);

		const result = Array.from({length: 5}, () => Array<number>(5).fill(-1));
		map.connect((x, y, value) => { result[x][y] = value; }, 0);
		expectAllFloorsConnected(result);
	});

	it('should report carved segments when connecting free spaces', () => {
		const map = new ROT.Map.Cellular(6, 5);
		for (let x = 0; x < 6; x++) {
			for (let y = 0; y < 5; y++) {
				map.set(x, y, 1);
			}
		}
		map.set(1, 3, 0);
		map.set(4, 1, 0);

		const carved = new Set<string>();
		const segments: Array<[[number, number], [number, number]]> = [];
		map.connect((x, y, value) => {
			if (value === 0) { carved.add(`${x},${y}`); }
		}, 0, (from, to) => segments.push([from, to]));

		for (const [[fromX, fromY], [toX, toY]] of segments) {
			const dx = Math.sign(toX - fromX);
			const dy = Math.sign(toY - fromY);
			for (let x = fromX, y = fromY; x !== toX || y !== toY; x += dx, y += dy) {
				expect(carved.has(`${x},${y}`)).toBe(true);
			}
			expect(carved.has(`${toX},${toY}`)).toBe(true);
		}
	});
});
