import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from '@/src/constants.js';

export interface CreateCallback { (x: number, y: number, contents: number): void; }

export abstract class Map {
	width: number;
	height: number;

	/**
	 * @class Base map generator
	 * @param {int} [width=ROT.DEFAULT_WIDTH]
	 * @param {int} [height=ROT.DEFAULT_HEIGHT]
	 */
	constructor(width = DEFAULT_WIDTH, height = DEFAULT_HEIGHT) {
		this.width = width;
		this.height = height;
	};

	/**
	 * Create the map.
	 * @returns The generator after success, or null if generation timed out.
	 */
	abstract create(callback?: CreateCallback): this | null;

	protected fillMap(value: number) {
		const map: number[][] = [];
		for (let i=0;i<this.width;i++) {
			map.push([]);
			for (let j=0;j<this.height;j++) { map[i].push(value); }
		}
		return map;
	}
}
