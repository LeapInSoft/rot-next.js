import { Path } from '@/src/path/path.js';
import type {ComputeCallback, Options, PassableCallback} from '@/src/path/path.js';

interface Item {
	x: number;
	y: number;
	prev: Item | null;
}

/**
 * @class Simplified Dijkstra's algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
export class Dijkstra extends Path {
	private readonly computed: {[key: string]: Item} = {};
	private readonly todo: Item[] = [];

	constructor(toX: number, toY: number, passableCallback: PassableCallback, options: Partial<Options> = {}) {
		super(toX, toY, passableCallback, options);

		this.add(toX, toY, null);
	}

	/**
	 * Compute a path from a given point
	 * @see ROT.Path#compute
	 */
	compute(fromX: number, fromY: number, callback: ComputeCallback) {
		const key = `${fromX},${fromY}`;
		if (!(key in this.computed)) {
			this.computeUntil(fromX, fromY);
		}
		if (!(key in this.computed)) {
			return;
		}

		let item: Item | null = this.computed[key];
		while (item) {
			// side-effect
			callback(item.x, item.y);
			item = item.prev;
		}
	}

	/**
	 * Compute a non-cached value
	 */
	private computeUntil(fromX: number, fromY: number) {
		// side-effect
		while (this.todo.length) {
			const item = this.todo.shift() as Item;
			const isOrigin = item.x === fromX && item.y === fromY;

			this._getNeighbors(item.x, item.y)
				.filter(([x, y]) => !(`${x},${y}` in this.computed))
				.forEach(([x, y]) => {
					// side-effect
					this.add(x, y, item);
				});

			if (isOrigin) {
				return;
			}
		}
	}

	private add(x: number, y: number, prev: Item | null) {
		const item: Item = {
			x,
			y,
			prev
		};
		this.computed[`${x},${y}`] = item;
		this.todo.push(item);
	}
}