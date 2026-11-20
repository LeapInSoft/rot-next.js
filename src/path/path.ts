import { DIRS } from "@/src/constants.js";

export type ComputeCallback = (x: number, y: number) => any;
export type PassableCallback = (x: number, y: number) => boolean;

export interface Options {
	topology: 4 | 6 | 8;
}

/**
 * @class Abstract pathfinder
 * @param {int} toX Target X coord
 * @param {int} toY Target Y coord
 * @param {function} passableCallback Callback to determine map passability
 * @param {object} [options]
 * @param {int} [options.topology=8]
 */
export abstract class Path {
	toX: number;
	toY: number;
	passableCallback: PassableCallback;
	options: Options;
	dirs: number[][];

	constructor(toX: number, toY: number, passableCallback: PassableCallback, options: Partial<Options> = {}) {
		this.toX = toX;
		this.toY = toY;
		this.passableCallback = passableCallback;
		this.options = Object.assign({
			topology: 8
		}, options);

		this.dirs = DIRS[this.options.topology];
		if (this.options.topology == 8) { /* reorder dirs for more aesthetic result (vertical/horizontal first) */
			this.dirs = [
				this.dirs[0],
				this.dirs[2],
				this.dirs[4],
				this.dirs[6],
				this.dirs[1],
				this.dirs[3],
				this.dirs[5],
				this.dirs[7]
			]
		}
	}

	/**
	 * Compute a path from a given point
	 * @param {int} fromX
	 * @param {int} fromY
	 * @param {function} callback Will be called for every path item with arguments "x" and "y"
	 */
	abstract compute(fromX: number, fromY: number, callback: ComputeCallback): void;

	getNeighbors(cx: number, cy: number) {
		const result = [];
		for (let i=0;i<this.dirs.length;i++) {
			const dir = this.dirs[i];
			const x = cx + dir[0];
			const y = cy + dir[1];
			
			if (!this.passableCallback(x, y)) { continue; }
			result.push([x, y]);
		}
		
		return result;
	}
}