import * as ROT from '@/src';
import { describe, expect, it } from 'vitest';

describe('Map.Cellular', () => {
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
});
