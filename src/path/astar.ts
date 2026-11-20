import { Path, type ComputeCallback, type PassableCallback, type Options } from "@/src/path/path.js";

interface Item {
	x: number;
	y: number;
	g: number;
	h: number;
	prev: Item | null;
}

/**
 * @class Simplified A* algorithm: all edges have a value of 1
 * @augments ROT.Path
 * @see ROT.Path
 */
export class AStar extends Path {
	todo: Item[];
	done: {[key:string]: Item};
	fromX!: number;
	fromY!: number;

	constructor(toX: number, toY: number, passableCallback: PassableCallback, options: Partial<Options> = {}) {
		super(toX, toY, passableCallback, options);

		this.todo = [];
		this.done = {};
	}

	/**
	 * Compute a path from a given point
	 * @see ROT.Path#compute
	 */
	compute(fromX: number, fromY: number, callback: ComputeCallback) {
		this.todo = [];
		this.done = {};
		this.fromX = fromX;
		this.fromY = fromY;
		this.add(this.toX, this.toY, null);

		while (this.todo.length) {
			const item = this.todo.shift() as Item;
			const id = item.x+","+item.y;
			if (id in this.done) { continue; }
			this.done[id] = item;
			if (item.x == fromX && item.y == fromY) { break; }

			const neighbors = this.getNeighbors(item.x, item.y);

			for (let i=0;i<neighbors.length;i++) {
				const neighbor = neighbors[i];
				const x = neighbor[0];
				const y = neighbor[1];
				const id = x+","+y;
				if (id in this.done) { continue; }
				this.add(x, y, item); 
			}
		}
		
		let item: Item | null = this.done[fromX+","+fromY];
		if (!item) { return; }
		
		while (item) {
			callback(item.x, item.y);
			item = item.prev;
		}
	}

	add(x: number, y: number, prev: Item | null) {
		const h = this.distance(x, y);
		const obj = {
			x: x,
			y: y,
			prev: prev,
			g: (prev ? prev.g+1 : 0),
			h: h
		};
		
		/* insert into priority queue */
		
		const f = obj.g + obj.h;
		for (let i=0;i<this.todo.length;i++) {
			const item = this.todo[i];
			const itemF = item.g + item.h;
			if (f < itemF || (f == itemF && h < item.h)) {
				this.todo.splice(i, 0, obj);
				return;
			}
		}
		
		this.todo.push(obj);
	}

	distance(x: number, y: number) {
		switch (this.options.topology) {
			case 4:
				return (Math.abs(x-this.fromX) + Math.abs(y-this.fromY));
			break;

			case 6:
				const dx = Math.abs(x - this.fromX);
				const dy = Math.abs(y - this.fromY);
				return dy + Math.max(0, (dx-dy)/2);
			break;

			case 8: 
				return Math.max(Math.abs(x-this.fromX), Math.abs(y-this.fromY));
			break;
		}
	}
}