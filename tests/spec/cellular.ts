import * as ROT from '@/src';
import { describe, expect, it } from 'vitest';

describe('Map.Cellular', () => {
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

		const alive: string[] = [];
		map.create((x, y, value) => {
			if (value) { alive.push(`${x},${y}`); }
		});

		expect(alive).toEqual(['1,0', '0,1']);
	});

	it('should report the map when no cells have the requested value', () => {
		const map = new ROT.Map.Cellular(2, 2);
		const cells: string[] = [];

		expect(() => map.connect((x, y, value) => cells.push(`${x},${y}:${value}`), 1)).not.toThrow();
		expect(cells).toEqual(['0,0:0', '1,0:0', '0,1:0', '1,1:0']);
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
