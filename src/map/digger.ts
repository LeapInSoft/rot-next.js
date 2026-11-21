import type { CreateCallback } from '@/src/map/map.js';
import { Dungeon } from '@/src/map/dungeon.js';
import { Room, Corridor } from '@/src/map/features.js';
import type { FeatureConstructor } from '@/src/map/features.js';

import { RNG } from '@/src/rng.js';
import { DIRS } from '@/src/constants.js';

const FEATURES = {
	"room": Room,
	"corridor": Corridor
}

interface Options {
	roomWidth: [number, number];
	roomHeight: [number, number];
	corridorLength: [number, number];
	dugPercentage: number;
	timeLimit: number
}

/**
 * Random dungeon generator using human-like digging patterns.
 * Heavily based on Mike Anderson's ideas from the "Tyrant" algo, mentioned at 
 * http://roguebasin.com/index.php/Dungeon-Building_Algorithm
 */
export class Digger extends Dungeon {
	options: Options;
	featureAttempts: number;
	map: number[][];
	walls: { [key:string]: number };
	dug: number;
	features: { [key:string]: number };

	constructor(width: number, height: number, options: Partial<Options> = {}) {
		super(width, height);
		
		this.options = Object.assign({
			roomWidth: [3, 9], /* room minimum and maximum width */
			roomHeight: [3, 5], /* room minimum and maximum height */
			corridorLength: [3, 10], /* corridor minimum and maximum length */
			dugPercentage: 0.2, /* we stop after this percentage of level area has been dug out */
			timeLimit: 1000 /* we stop after this much time has passed (msec) */
		}, options);
		
		this.features = {
			"room": 4,
			"corridor": 4
		};
		this.map = [];
		this.featureAttempts = 20; /* how many times do we try to create a feature on a suitable wall */
		this.walls = {}; /* these are available for digging */
		this.dug = 0;

		this.digCallback = this.digCallback.bind(this);
		this.canBeDugCallback = this.canBeDugCallback.bind(this);
		this.isWallCallback = this.isWallCallback.bind(this);
		this.priorityWallCallback = this.priorityWallCallback.bind(this);
	}

	create(callback?: CreateCallback) {
		if (this.width < 5 || this.height < 5) { return null; }

		this.rooms = [];
		this.corridors = [];
		this.map = this.fillMap(1);
		this.walls = {};
		this.dug = 0;
		const area = (this.width-2) * (this.height-2);

		this.firstRoom();
		
		const t1 = Date.now();

		let priorityWalls;
		do {
			priorityWalls = 0;
			const t2 = Date.now();
			if (t2 - t1 > this.options.timeLimit) { break; }

			/* find a good wall */
			const wall = this.findWall();
			if (!wall) { break; } /* no more walls */
			
			const parts = wall.split(",");
			const x = parseInt(parts[0]);
			const y = parseInt(parts[1]);
			const dir = this.getDiggingDirection(x, y);
			if (!dir) { continue; } /* this wall is not suitable */
			
	//		console.log("wall", x, y);

			/* try adding a feature */
			let featureAttempts = 0;
			do {
				featureAttempts++;
				if (this.tryFeature(x, y, dir[0], dir[1])) { /* feature added */
					//if (this.rooms.length + this.corridors.length === 2) { this.rooms[0].addDoor(x, y); } /* first room officially has doors */
					this.removeSurroundingWalls(x, y);
					this.removeSurroundingWalls(x-dir[0], y-dir[1]);
					break; 
				}
			} while (featureAttempts < this.featureAttempts);
			
			for (const id in this.walls) {
				if (this.walls[id] > 1) { priorityWalls++; }
			}

		} while (this.dug/area < this.options.dugPercentage || priorityWalls); /* fixme number of priority walls */

		this.addDoors();

		if (callback) {
			for (let i=0;i<this.width;i++) {
				for (let j=0;j<this.height;j++) {
					callback(i, j, this.map[i][j]);
				}
			}
		}
		
		this.walls = {};
		this.map = [];

		return this;
	}

	digCallback(x: number, y: number, value: number) {
		if (value === 0 || value === 2) { /* empty */
			this.map[x][y] = 0;
			this.dug++;
		} else { /* wall */
			this.walls[x+","+y] = 1;
		}
	}

	isWallCallback(x: number, y: number) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) { return false; }
		return (this.map[x][y] === 1);
	}

	canBeDugCallback(x: number, y: number) {
		if (x < 1 || y < 1 || x+1 >= this.width || y+1 >= this.height) { return false; }
		return (this.map[x][y] === 1);
	}

	priorityWallCallback(x: number, y: number) { this.walls[x+","+y] = 2; };

	firstRoom() {
		const cx = Math.floor(this.width/2);
		const cy = Math.floor(this.height/2);
		const maxRoomWidth = Math.min(this.options.roomWidth[1], cx, this.width - cx - 1);
		const maxRoomHeight = Math.min(this.options.roomHeight[1], cy, this.height - cy - 1);
		const options: Options = {
			...this.options,
			roomWidth: [Math.min(this.options.roomWidth[0], maxRoomWidth), maxRoomWidth],
			roomHeight: [Math.min(this.options.roomHeight[0], maxRoomHeight), maxRoomHeight]
		};
		const room = Room.createRandomCenter(cx, cy, options);
		this.rooms.push(room);
		room.create(this.digCallback);
	}

	/**
	 * Get a suitable wall
	 */
	findWall() {
		const prio1 = [];
		const prio2 = [];
		for (const id in this.walls) {
			const prio = this.walls[id];
			if (prio === 2) { 
				prio2.push(id); 
			} else {
				prio1.push(id);
			}
		}
		
		const arr = (prio2.length ? prio2 : prio1);
		if (!arr.length) { return null; } /* no walls :/ */
		
		const id = RNG.getItem(arr.sort()); // sort to make the order deterministic
		if (id === null) { return null; }
		delete this.walls[id];

		return id;
	}

	/**
	 * Tries adding a feature
	 * @returns {bool} was this a successful try?
	 */
	tryFeature(x: number, y: number, dx: number, dy: number) {
		const featureName = RNG.getWeightedValue(this.features);
		if (featureName !== "room" && featureName !== "corridor") { return false; }
		const ctor: FeatureConstructor = FEATURES[featureName];
		const feature = ctor.createRandomAt(x, y, dx, dy, this.options);
		
		if (!feature.isValid(this.isWallCallback, this.canBeDugCallback)) {
	//		console.log("not valid");
	//		feature.debug();
			return false;
		}
		
		feature.create(this.digCallback);
	//	feature.debug();

		if (feature instanceof Room) { this.rooms.push(feature); }
		if (feature instanceof Corridor) { 
			feature.createPriorityWalls(this.priorityWallCallback);
			this.corridors.push(feature); 
		}
		
		return true;
	}

	removeSurroundingWalls(cx: number, cy: number) {
		const deltas = DIRS[4];

		for (let i=0;i<deltas.length;i++) {
			const delta = deltas[i];
			let x = cx + delta[0];
			let y = cy + delta[1];
			delete this.walls[x+","+y];
			x = cx + 2*delta[0];
			y = cy + 2*delta[1];
			delete this.walls[x+","+y];
		}
	}

	/**
	 * Returns vector in "digging" direction, or false, if this does not exist (or is not unique)
	 */
	getDiggingDirection(cx: number, cy: number) {
		if (cx <= 0 || cy <= 0 || cx >= this.width - 1 || cy >= this.height - 1) { return null; }

		let result = null;
		const deltas = DIRS[4];
		
		for (let i=0;i<deltas.length;i++) {
			const delta = deltas[i];
			const x = cx + delta[0];
			const y = cy + delta[1];
			
			if (!this.map[x][y]) { /* there already is another empty neighbor! */
				if (result) { return null; }
				result = delta;
			}
		}
		
		/* no empty neighbor */
		if (!result) { return null; }
		
		return [-result[0], -result[1]];
	}

	/**
	 * Find empty spaces surrounding rooms, and apply doors.
	 */
	addDoors() {
		const data = this.map;
		function isWallCallback(x: number, y: number) {
			return (data[x][y] === 1);
		};
		for (let i = 0; i < this.rooms.length; i++ ) {
			const room = this.rooms[i];
			room.clearDoors();
			room.addDoors(isWallCallback);
		}
	}
}
