import type { CreateCallback } from '@/src/map/map.js';
import { Dungeon } from '@/src/map/dungeon.js';
import { Room, Corridor } from '@/src/map/features.js';
import { RNG } from '@/src/rng.js';

interface Options {
	roomWidth: [number, number], /* room minimum and maximum width */
	roomHeight: [number, number], /* room minimum and maximum height */
	roomDugPercentage: number, /* we stop after this percentage of level area has been dug out by rooms */
	timeLimit: number /* we stop after this much time has passed (msec) */
};

type Point = [number, number];

/**
 * @class Dungeon generator which tries to fill the space evenly. Generates independent rooms and tries to connect them.
 * @augments ROT.Map.Dungeon
 */
export class Uniform extends Dungeon {
	options: Options;
	roomAttempts: number;
	corridorAttempts: number;
	connected: Room[];
	unconnected: Room[];
	map: number[][];
	dug: number;

	constructor(width:number, height: number, options: Partial<Options> = {}) {
		super(width, height);

		this.options = {
			roomWidth: [3, 9], /* room minimum and maximum width */
			roomHeight: [3, 5], /* room minimum and maximum height */
			roomDugPercentage: 0.1, /* we stop after this percentage of level area has been dug out by rooms */
			timeLimit: 1000 /* we stop after this much time has passed (msec) */
		};
		Object.assign(this.options, options);

		this.map = [];
		this.dug = 0;
		this.roomAttempts = 20; /* new room is created N-times until is considered as impossible to generate */
		this.corridorAttempts = 20; /* corridors are tried N-times until the level is considered as impossible to connect */

		this.connected = []; /* list of already connected rooms */
		this.unconnected = []; /* list of remaining unconnected rooms */
		
		this.digCallback = this.digCallback.bind(this);
		this.canBeDugCallback = this.canBeDugCallback.bind(this);
		this.isWallCallback = this.isWallCallback.bind(this);
	}

	/**
	 * Create a map.
	 * @returns This generator after success, or null if the time limit is hit.
	 * @see ROT.Map#create
	 */
	create(callback?: CreateCallback): this | null {
		if (this.width < 5 || this.height < 5) { return null; }

		const t1 = Date.now();
		while (1) {
			const t2 = Date.now();
			if (t2 - t1 > this.options.timeLimit) {
				this.resetGeneration();
				return null;
			} /* time limit! */
		
			this.map = this.fillMap(1);
			this.dug = 0;
			this.rooms = [];
			this.unconnected = [];
			this.generateRooms();
			if (this.rooms.length < 2) { continue; }
			if (this.generateCorridors()) { break; }
		}
		
		if (callback) {
			for (let i=0;i<this.width;i++) {
				for (let j=0;j<this.height;j++) {
					callback(i, j, this.map[i][j]);
				}
			}
		}
		
		return this;
	}

	private resetGeneration() {
		this.map = this.fillMap(1);
		this.dug = 0;
		this.rooms = [];
		this.corridors = [];
		this.connected = [];
		this.unconnected = [];
	}

	/**
	 * Generates a suitable amount of rooms
	 */
	generateRooms() {
		const w = this.width-2;
		const h = this.height-2;

		let room;
		do {
			room = this.generateRoom();
			if (this.dug/(w*h) > this.options.roomDugPercentage) { break; } /* achieved requested amount of free space */
		} while (room);

		/* either enough rooms, or not able to generate more of them :) */
	}

	/**
	 * Try to generate one room
	 */
	generateRoom() {
		let count = 0;
		while (count < this.roomAttempts) {
			count++;
			
			const room = Room.createRandom(this.width, this.height, this.options);
			if (!room.isValid(this.isWallCallback, this.canBeDugCallback)) { continue; }
			
			room.create(this.digCallback);
			this.rooms.push(room);
			return room;
		} 

		/* no room was generated in a given number of attempts */
		return null;
	}

	/**
	 * Generates connectors between rooms
	 * @returns {bool} success Was this attempt successful?
	 */
	generateCorridors() {
		let cnt = 0;
		while (cnt < this.corridorAttempts) {
			cnt++;
			this.corridors = [];

			/* dig rooms into a clear map */
			this.map = this.fillMap(1);
			for (let i=0;i<this.rooms.length;i++) { 
				const room = this.rooms[i];
				room.clearDoors();
				room.create(this.digCallback); 
			}

			this.unconnected = RNG.shuffle(this.rooms.slice());
			this.connected = [];
			if (this.unconnected.length) {
				const firstRoom = this.unconnected.pop();
				if (firstRoom) { this.connected.push(firstRoom); }
			} /* first one is always connected */
			
			while (1) {
				/* 1. pick random connected room */
				const connected = RNG.getItem(this.connected);
				if (!connected) { break; }
				
				/* 2. find closest unconnected */
				const room1 = this.closestRoom(this.unconnected, connected);
				if (!room1) { break; }
				
				/* 3. connect it to closest connected */
				const room2 = this.closestRoom(this.connected, room1);
				if (!room2) { break; }
				
				const ok = this.connectRooms(room1, room2);
				if (!ok) { break; } /* stop connecting, re-shuffle */
				
				if (!this.unconnected.length) { return true; } /* done; no rooms remain */
			}
		}
		return false;
	};

	/**
	 * For a given room, find the closest one from the list
	 */
	closestRoom(rooms: Room[], room: Room) {
		let dist = Infinity;
		const center = room.getCenter();
		let result = null;
		
		for (let i=0;i<rooms.length;i++) {
			const r = rooms[i];
			const c = r.getCenter();
			const dx = c[0]-center[0];
			const dy = c[1]-center[1];
			const d = dx*dx+dy*dy;
			
			if (d < dist) {
				dist = d;
				result = r;
			}
		}
		
		return result;
	}

	connectRooms(room1: Room, room2: Room) {
		/*
			room1.debug();
			room2.debug();
		*/
		const center1 = room1.getCenter();
		const center2 = room2.getCenter();

		const diffX = center2[0] - center1[0];
		const diffY = center2[1] - center1[1];

		let end: Point | null;

		let dirIndex1, dirIndex2, min, max, index;
		if (Math.abs(diffX) < Math.abs(diffY)) { /* first try connecting north-south walls */
			dirIndex1 = (diffY > 0 ? 2 : 0);
			dirIndex2 = (dirIndex1 + 2) % 4;
			min = room2.getLeft();
			max = room2.getRight();
			index = 0;
		} else { /* first try connecting east-west walls */
			dirIndex1 = (diffX > 0 ? 1 : 3);
			dirIndex2 = (dirIndex1 + 2) % 4;
			min = room2.getTop();
			max = room2.getBottom();
			index = 1;
		}

		const start = this.placeInWall(room1, dirIndex1); /* corridor will start here */
		if (!start) { return false; }

		if (start[index] >= min && start[index] <= max) { /* possible to connect with straight line (I-like) */
			end = [start[0], start[1]];
			let value = 0;
			switch (dirIndex2) {
				case 0: value = room2.getTop()-1; break;
				case 1: value = room2.getRight()+1; break;
				case 2: value = room2.getBottom()+1; break;
				case 3: value = room2.getLeft()-1; break;
			}
			end[(index+1)%2] = value;
			this.digLine([start, end]);
			
		} else if (start[index] < min-1 || start[index] > max+1) { /* need to switch target wall (L-like) */

			const diff = start[index] - center2[index];
			let rotation = 0;
			switch (dirIndex2) {
				case 0:
				case 1:	rotation = (diff < 0 ? 3 : 1); break;
				case 2:
				case 3:	rotation = (diff < 0 ? 1 : 3); break;
			}
			dirIndex2 = (dirIndex2 + rotation) % 4;
			
			end = this.placeInWall(room2, dirIndex2);
			if (!end) { return false; }

			const mid: Point = [0, 0];
			mid[index] = start[index];
			const index2 = (index+1)%2;
			mid[index2] = end[index2];
			this.digLine([start, mid, end]);
			
		} else { /* use current wall pair, but adjust the line in the middle (S-like) */
		
			const index2 = (index+1)%2;
			end = this.placeInWall(room2, dirIndex2);
			if (!end) { return false; }
			const mid = Math.round((end[index2] + start[index2])/2);

			const mid1: Point = [0, 0];
			const mid2: Point = [0, 0];
			mid1[index] = start[index];
			mid1[index2] = mid;
			mid2[index] = end[index];
			mid2[index2] = mid;
			this.digLine([start, mid1, mid2, end]);
		}

		room1.addDoor(start[0], start[1]);
		room2.addDoor(end[0], end[1]);
		
		index = this.unconnected.indexOf(room1);
		if (index !== -1) {
			this.unconnected.splice(index, 1);
			this.connected.push(room1);
		}

		index = this.unconnected.indexOf(room2);
		if (index !== -1) {
			this.unconnected.splice(index, 1);
			this.connected.push(room2);
		}
		
		return true;
	}

	placeInWall(room: Room, dirIndex: number): Point | null {
		let start = [0, 0];
		let dir = [0, 0];
		let length = 0;
		
		switch (dirIndex) {
			case 0:
				dir = [1, 0];
				start = [room.getLeft(), room.getTop()-1];
				length = room.getRight()-room.getLeft()+1;
			break;
			case 1:
				dir = [0, 1];
				start = [room.getRight()+1, room.getTop()];
				length = room.getBottom()-room.getTop()+1;
			break;
			case 2:
				dir = [1, 0];
				start = [room.getLeft(), room.getBottom()+1];
				length = room.getRight()-room.getLeft()+1;
			break;
			case 3:
				dir = [0, 1];
				start = [room.getLeft()-1, room.getTop()];
				length = room.getBottom()-room.getTop()+1;
			break;
		}
		
		const avail: (Point | null)[] = [];
		let lastBadIndex = -2;

		for (let i=0;i<length;i++) {
			const x = start[0] + i*dir[0];
			const y = start[1] + i*dir[1];
			avail.push(null);
			
			const isWall = (this.map[x][y] === 1);
			if (isWall) {
				if (lastBadIndex !== i-1) { avail[i] = [x, y]; }
			} else {
				lastBadIndex = i;
				if (i) { avail[i-1] = null; }
			}
		}
		
		for (let i=avail.length-1; i>=0; i--) {
			if (!avail[i]) { avail.splice(i, 1); }
		}
		return (avail.length ? RNG.getItem(avail) : null);
	}

	/**
	 * Dig a polyline.
	 */
	digLine(points: Point[]) {
		for (let i=1;i<points.length;i++) {
			const start = points[i-1];
			const end = points[i];
			const corridor = new Corridor(start[0], start[1], end[0], end[1]);
			corridor.create(this.digCallback);
			this.corridors.push(corridor);
		}
	}

	digCallback(x:number, y:number, value: number) {
		this.map[x][y] = value;
		if (value === 0) { this.dug++; }
	}

	isWallCallback(x: number, y: number) {
		if (x < 0 || y < 0 || x >= this.width || y >= this.height) { return false; }
		return (this.map[x][y] === 1);
	}

	canBeDugCallback(x: number, y: number) {
		if (x < 1 || y < 1 || x+1 >= this.width || y+1 >= this.height) { return false; }
		return (this.map[x][y] === 1);
	}
}