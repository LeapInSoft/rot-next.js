import { Map } from '@/src/map/map.js';
import type { CreateCallback } from '@/src/map/map.js';
import { DIRS } from '@/src/constants.js';
import { RNG } from '@/src/rng.js';

interface Options {
	born: number[];
	survive: number[];
	topology: 4 | 6 | 8;
}

interface ConnectionCallback { (from: Point, to: Point): void; }

type Point = [number, number];
interface PointMap { [pointKey: string]: Point; }

/**
 * @class Cellular automaton map generator
 * @augments ROT.Map
 * @param {int} [width=ROT.DEFAULT_WIDTH]
 * @param {int} [height=ROT.DEFAULT_HEIGHT]
 * @param {object} [options] Options
 * @param {int[]} [options.born] List of neighbor counts for a new cell to be born in empty space
 * @param {int[]} [options.survive] List of neighbor counts for an existing  cell to survive
 * @param {int} [options.topology] Topology 4 or 6 or 8
 */
export class Cellular extends Map {
	private options: Options;
	private directions: number[][];
	private cells: number[][];

	constructor(width: number, height: number, options: Partial<Options> = {}) {
		super(width, height);
		this.options = {
			born: [5, 6, 7, 8],
			survive: [4, 5, 6, 7, 8],
			topology: 8
		};
		this.setOptions(options);

		this.directions = DIRS[this.options.topology];
		this.cells = this.fillMap(0);
	}

	/**
	 * Fill the map with random values
	 * @param {float} probability Probability for a cell to become alive; 0 = all empty, 1 = all full
	 */
	randomize(probability: number) {
		this.cells = this.cells.map(column => column.map(() => RNG.getUniform() < probability ? 1 : 0));
		return this;
	}

	/**
	 * Change options.
	 * @see ROT.Map.Cellular
	 */
	setOptions(options: Partial<Options>) {
		Object.assign(this.options, options);
		this.directions = DIRS[this.options.topology];
	}

	set(x: number, y: number, value: number) { this.cells[x][y] = value; }

	create(callback?: CreateCallback) {
		const born = this.options.born;
		const survive = this.options.survive;
		const isHex = this.options.topology === 6;
		const newMap = this.cells.map((column, x) => column.map((cur, y) => {
			if (isHex && x % 2 !== y % 2) { return 0; }
			const ncount = this.getNeighbors(x, y);

			if (cur && survive.includes(ncount)) { return 1; }
			if (!cur && born.includes(ncount)) { return 1; }
			return 0;
		}));

		this.cells = newMap;
		callback && this.serviceCallback(callback);
	}

	private serviceCallback(callback: CreateCallback) {
		for (let j=0;j<this._height;j++) {
			let widthStep = 1;
			let widthStart = 0;
			if (this.options.topology === 6) {
				widthStep = 2;
				widthStart = j%2;
			}
			for (let i=widthStart; i<this._width; i+=widthStep) {
				callback(i, j, this.cells[i][j]);
			}
		}
	}

	/**
	 * Get neighbor count at [i,j] in the cell map
	 */
	private getNeighbors(cx: number, cy: number) {
		return this.directions.reduce((count, [dx, dy]) => {
			const x = cx + dx;
			const y = cy + dy;
			if (x < 0 || x >= this._width || y < 0 || y >= this._height) { return count; }
			return count + (this.cells[x][y] === 1 ? 1 : 0);
		}, 0);
	}

	/**
	 * Make sure every non-wall space is accessible.
	 * @param {function} callback to call to display map when do
	 * @param {int} value to consider empty space - defaults to 0
	 * @param {function} callback to call when a new connection is made
	 */
	connect(callback: CreateCallback, value: number, connectionCallback?: ConnectionCallback) {
		if (!value) value = 0;

		const allFreeSpace: Point[] = [];
		const notConnected: PointMap = {};

		// find all free space
		let widthStep = 1;
		let widthStarts = [0, 0];
		if (this.options.topology === 6) {
			widthStep = 2;
			widthStarts = [0, 1];
		}
		for (let y = 0; y < this._height; y++) {
			for (let x = widthStarts[y % 2]; x < this._width; x += widthStep) {
				if (this.freeSpace(x, y, value)) {
					const point: Point = [x, y];
					notConnected[this.pointKey(point)] = point;
					allFreeSpace.push(point);
				}
			}
		}
		const start = allFreeSpace[RNG.getUniformInt(0, allFreeSpace.length - 1)];

		const key = this.pointKey(start);
		const connected: PointMap = {};
		connected[key] = start;
		delete notConnected[key];

		// find what's connected to the starting point
		this.findConnected(connected, notConnected, [start], false, value);

		while (Object.keys(notConnected).length > 0) {
			// find two points from notConnected to connected
			const p = this.getFromTo(connected, notConnected);
			const from = p[0]; // notConnected
			const to = p[1]; // connected

			// find everything connected to the starting point
			const local: PointMap = {};
			local[this.pointKey(from)] = from;
			this.findConnected(local, notConnected, [from], true, value);

			// connect to a connected cell
			const tunnelFn = (this.options.topology === 6 ? this.tunnelToConnected6 : this.tunnelToConnected);
			tunnelFn.call(this, to, from, connected, notConnected, value, connectionCallback);

			// now all of local is connected
			for (const [key, point] of Object.entries(local)) {
				this.cells[point[0]][point[1]] = value;
				connected[key] = point;
				delete notConnected[key];
			}
		}

		callback && this.serviceCallback(callback);
	}

	/**
	 * Find random points to connect. Search for the closest point in the larger space.
	 * This is to minimize the length of the passage while maintaining good performance.
	 */
	private getFromTo(connected: PointMap, notConnected: PointMap): Point[] {
		let from: Point = [0, 0];
		let to: Point = [0, 0];
		let distance: number;
		const connectedKeys = Object.keys(connected);
		const notConnectedKeys = Object.keys(notConnected);
		for (let i = 0; i < 5; i++) {
			if (connectedKeys.length < notConnectedKeys.length) {
				const keys = connectedKeys;
				to = connected[keys[RNG.getUniformInt(0, keys.length - 1)]];
				from = this.getClosest(to, notConnected);
			} else {
				const keys = notConnectedKeys;
				from = notConnected[keys[RNG.getUniformInt(0, keys.length - 1)]];
				to = this.getClosest(from, connected);
			}
			distance = (from[0] - to[0]) * (from[0] - to[0]) + (from[1] - to[1]) * (from[1] - to[1]);
			if (distance < 64) { break; }
		}
		return [from, to];
	}

	private getClosest(point: Point, space: PointMap) {
		const closest = Object.values(space).reduce<{point: Point | null; distance: number}>((best, candidate) => {
			const distance = (candidate[0] - point[0]) * (candidate[0] - point[0]) + (candidate[1] - point[1]) * (candidate[1] - point[1]);
			return best.point == null || distance < best.distance ? {point: candidate, distance} : best;
		}, {point: null, distance: Infinity});
		if (closest.point === null) {
			throw new Error('Cannot find the closest point in an empty space.');
		}
		return closest.point;
	}

	private findConnected(connected: PointMap, notConnected: PointMap,
					stack: Point[], keepNotConnected: boolean, value: number) {
		while (stack.length > 0) {
			const p = stack.splice(0, 1)[0];
			let tests: Point[];

			if (this.options.topology === 6) {
				tests = [
					[p[0] + 2, p[1]],
					[p[0] + 1, p[1] - 1],
					[p[0] - 1, p[1] - 1],
					[p[0] - 2, p[1]],
					[p[0] - 1, p[1] + 1],
					[p[0] + 1, p[1] + 1],
				];
			} else {
				tests = [
					[p[0] + 1, p[1]],
					[p[0] - 1, p[1]],
					[p[0],     p[1] + 1],
					[p[0],     p[1] - 1]
				];
			}

			tests.forEach(test => {
				const key = this.pointKey(test);
				if (connected[key] == null && this.freeSpace(test[0], test[1], value)) {
					connected[key] = test;
					if (!keepNotConnected) { delete notConnected[key]; }
					stack.push(test);
				}
			});
		}
	}

	private tunnelToConnected(to: Point, from: Point,
						connected: PointMap, notConnected: PointMap,
						value: number, connectionCallback?: ConnectionCallback) {
		let a: Point;
		let b: Point;
		if (from[0] < to[0]) {
			a = from;
			b = to;
		} else {
			a = to;
			b = from;
		}
		for (let xx = a[0]; xx <= b[0]; xx++) {
			this.cells[xx][a[1]] = value;
			const point: Point = [xx, a[1]];
			const pointKey = this.pointKey(point);
			connected[pointKey] = point;
			delete notConnected[pointKey];
		}
		if (connectionCallback && a[0] < b[0]) {
			connectionCallback(a, [b[0], a[1]]);
		}

		// x is now fixed
		const x = b[0];

		if (from[1] < to[1]) {
			a = from;
			b = to;
		} else {
			a = to;
			b = from;
		}
		for (let yy = a[1]; yy < b[1]; yy++) {
			this.cells[x][yy] = value;
			const point: Point = [x, yy];
			const pointKey = this.pointKey(point);
			connected[pointKey] = point;
			delete notConnected[pointKey];
		}
		if (connectionCallback && a[1] < b[1]) { connectionCallback([b[0], a[1]], [b[0], b[1]]); }
	}

	private tunnelToConnected6(to: Point, from: Point,
						connected: PointMap, notConnected: PointMap,
						value: number, connectionCallback?: ConnectionCallback) {
		let a: Point;
		let b: Point;
		if (from[0] < to[0]) {
			a = from;
			b = to;
		} else {
			a = to;
			b = from;
		}

		// tunnel diagonally until horizontally level
		let xx = a[0];
		let yy = a[1];
		while (xx !== b[0] || yy !== b[1]) {
			let stepWidth = 2;
			if (yy < b[1]) {
				yy++;
				stepWidth = 1;
			} else if (yy > b[1]) {
				yy--;
				stepWidth = 1;
			}
			if (xx < b[0]) {
				xx += stepWidth
			} else if (xx > b[0]) {
				xx -= stepWidth
			} else if (b[1] % 2) {
				// Won't step outside map if destination on is map's right edge
				xx -= stepWidth;
			} else {
				// ditto for left edge
				xx += stepWidth;
			}
			this.cells[xx][yy] = value;
			const point: Point = [xx, yy];
			const pointKey = this.pointKey(point);
			connected[pointKey] = point;
			delete notConnected[pointKey];
		}

		if (connectionCallback) { connectionCallback(from, to); }
	}

	private freeSpace(x: number, y: number, value: number) {
		return x >= 0 && x < this._width && y >= 0 && y < this._height && this.cells[x][y] === value;
	}

	private pointKey(point: Point) { return `${point[0]}.${point[1]}`; }
}
