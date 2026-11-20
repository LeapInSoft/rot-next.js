import { Map } from '@/src/map/map.js';
import type { CreateCallback } from '@/src/map/map.js';
import { RNG } from '@/src/rng.js';
import { DIRS } from '@/src/constants.js';

type Point = [number, number];

export interface Options {
	/** Number of cells to create on the horizontal (number of rooms horizontally) */
	cellWidth: number;

	/** Number of cells to create on the vertical (number of rooms vertically) */
	cellHeight: number;

	/** Room min and max width - normally set auto-magically via the constructor. */
	roomWidth: [number, number];

	/** Room min and max height - normally set auto-magically via the constructor. */
	roomHeight: [number, number];
}

export interface Room {
	x: number;
	y: number;
	width: number;
	height: number;
	connections: any[];
	cellx: number;
	celly: number;
}


/**
 * Dungeon generator which uses the "original" Rogue dungeon generation algorithm. See https://github.com/Davidslv/rogue-like/blob/master/docs/references/Mark_Damon_Hughes/07_Roguelike_Dungeon_Generation.md
 * @author hyakugei
 */
export class Rogue extends Map {
	private _options: Options;
	private map: number[][] = [];
	private rooms: Room[][] = [];

	constructor(width: number, height: number, options: Partial<Options> = {}) {
		super(width, height);

		options = Object.assign({
			cellWidth: 3,  // NOTE to self, these could probably work the same as the roomWidth/room Height values
			cellHeight: 3  //     ie. as an array with min-max values for each direction....
		}, options);

		/*
		Set the room sizes according to the over-all width of the map,
		and the cell sizes.
		*/
		if (!options.hasOwnProperty("roomWidth")) {
			options["roomWidth"] = this._calculateRoomSize(this._width, options["cellWidth"] as number);
		}
		if (!options.hasOwnProperty("roomHeight")) {
			options["roomHeight"] = this._calculateRoomSize(this._height, options["cellHeight"] as number);
		}

		this._options = options as Options;
	}

	create(callback?: CreateCallback) {
		this.map = this.fillMap(1);
		this.rooms = [];

		this._initRooms();
		this._connectRooms();
		this._connectUnconnectedRooms();
		this._createRandomRoomConnections();
		this._createRooms();
		this._createCorridors();

		if (callback) {
			for (let i = 0; i < this._width; i++) {
				for (let j = 0; j < this._height; j++) {
					callback(i, j, this.map[i][j]);
				}
			}
		}

		return this;
	}

	_calculateRoomSize(size: number, cell: number): [number, number] {
		let max = Math.floor((size/cell) * 0.8);
		let min = Math.floor((size/cell) * 0.25);
		if (min < 2) { min = 2; }
		if (max < 2) { max = 2; }
		return [min, max];
	}

	_initRooms() {
		// create rooms array. This is the "grid" list from the algo.
		for (let i = 0; i < this._options.cellWidth; i++) {
			this.rooms.push([]);
			for (let j = 0; j < this._options.cellHeight; j++) {
				this.rooms[i].push({"x":0, "y":0, "width":0, "height":0, "connections":[], "cellx":i, "celly":j});
			}
		}
	}

	_connectRooms() {
		//pick random starting grid
		let cgx = RNG.getUniformInt(0, this._options.cellWidth-1);
		let cgy = RNG.getUniformInt(0, this._options.cellHeight-1);

		let idx;
		let ncgx;
		let ncgy;

		let found = false;
		let room;
		let otherRoom;
		let dirToCheck;

		// find  unconnected neighbour cells
		do {

			//dirToCheck = [0, 1, 2, 3, 4, 5, 6, 7];
			dirToCheck = [0, 2, 4, 6];
			dirToCheck = RNG.shuffle(dirToCheck);

			do {
				found = false;
				idx = dirToCheck.pop() as number;

				ncgx = cgx + DIRS[8][idx][0];
				ncgy = cgy + DIRS[8][idx][1];

				if (ncgx < 0 || ncgx >= this._options.cellWidth) { continue; }
				if (ncgy < 0 || ncgy >= this._options.cellHeight) { continue; }

				room = this.rooms[cgx][cgy];

				if (room["connections"].length > 0) {
					// as long as this room doesn't already coonect to me, we are ok with it.
					if (room["connections"][0][0] == ncgx && room["connections"][0][1] == ncgy) {
						break;
					}
				}

				otherRoom = this.rooms[ncgx][ncgy];

				if (otherRoom["connections"].length == 0) {
					otherRoom["connections"].push([cgx, cgy]);

					cgx = ncgx;
					cgy = ncgy;
					found = true;
				}

			} while (dirToCheck.length > 0 && found == false);

		} while (dirToCheck.length > 0);

	}

	_connectUnconnectedRooms() {
		const cw = this._options.cellWidth;
		const ch = this._options.cellHeight;
		const parents = Array.from({ length: cw * ch }, (_, index) => index);
		const find = (cell: number): number => {
			while (parents[cell] !== cell) {
				parents[cell] = parents[parents[cell]];
				cell = parents[cell];
			}
			return cell;
		};
		const join = (first: number, second: number): boolean => {
			const firstRoot = find(first);
			const secondRoot = find(second);
			if (firstRoot === secondRoot) { return false; }
			parents[firstRoot] = secondRoot;
			return true;
		};
		const getIndex = (x: number, y: number) => x * ch + y;

		for (let x = 0; x < cw; x++) {
			for (let y = 0; y < ch; y++) {
				for (const [otherX, otherY] of this.rooms[x][y].connections) {
					join(getIndex(x, y), getIndex(otherX, otherY));
				}
			}
		}

		const candidateConnections: [Point, Point][] = [];
		for (let x = 0; x < cw; x++) {
			for (let y = 0; y < ch; y++) {
				if (x + 1 < cw) { candidateConnections.push([[x, y], [x + 1, y]]); }
				if (y + 1 < ch) { candidateConnections.push([[x, y], [x, y + 1]]); }
			}
		}

		for (const [[x, y], [otherX, otherY]] of RNG.shuffle(candidateConnections)) {
			if (join(getIndex(x, y), getIndex(otherX, otherY))) {
				this.rooms[x][y].connections.push([otherX, otherY]);
			}
		}
	}

	_createRandomRoomConnections() {
		// Empty for now.
	}

	_createRooms() {
		const w = this._width;
		const h = this._height;

		const cw = this._options.cellWidth;
		const ch = this._options.cellHeight;

		const cwp = Math.floor(this._width / cw);
		const chp = Math.floor(this._height / ch);

		const roomWidth = this._options["roomWidth"];
		const roomHeight = this._options["roomHeight"];

		for (let i = 0; i < cw; i++) {
			for (let j = 0; j < ch; j++) {
				const cellX = cwp * i;
				const cellY = chp * j;
				const maxRoomWidth = Math.max(1, Math.min(cwp - 1, w - cellX - 2));
				const maxRoomHeight = Math.max(1, Math.min(chp - 1, h - cellY - 2));
				const roomw = Math.min(RNG.getUniformInt(roomWidth[0], roomWidth[1]), maxRoomWidth);
				const roomh = Math.min(RNG.getUniformInt(roomHeight[0], roomHeight[1]), maxRoomHeight);
				const maxOffsetX = Math.max(0, Math.min(cwp - roomw - 1, w - cellX - roomw - 2));
				const maxOffsetY = Math.max(0, Math.min(chp - roomh - 1, h - cellY - roomh - 2));
				const sx = cellX + 1 + RNG.getUniformInt(0, maxOffsetX);
				const sy = cellY + 1 + RNG.getUniformInt(0, maxOffsetY);

				this.rooms[i][j]["x"] = sx;
				this.rooms[i][j]["y"] = sy;
				this.rooms[i][j]["width"] = roomw;
				this.rooms[i][j]["height"] = roomh;

				for (let ii = sx; ii < sx + roomw; ii++) {
					for (let jj = sy; jj < sy + roomh; jj++) {
						this.map[ii][jj] = 0;
					}
				}
			}
		}
	}

	_getWallPosition(aRoom: Room, aDirection: number): Point {
		let rx;
		let ry;
		let door;

		if (aDirection == 1 || aDirection == 3) {
			rx = RNG.getUniformInt(aRoom["x"] + 1, aRoom["x"] + aRoom["width"] - 2);
			if (aDirection == 1) {
				ry = aRoom["y"] - 2;
				door = ry + 1;
			} else {
				ry = aRoom["y"] + aRoom["height"] + 1;
				door = ry -1;
			}

			this.map[rx][door] = 0; // i'm not setting a specific 'door' tile value right now, just empty space.

		} else {
			ry = RNG.getUniformInt(aRoom["y"] + 1, aRoom["y"] + aRoom["height"] - 2);
			if(aDirection == 2) {
				rx = aRoom["x"] + aRoom["width"] + 1;
				door = rx - 1;
			} else {
				rx = aRoom["x"] - 2;
				door = rx + 1;
			}

			this.map[door][ry] = 0; // i'm not setting a specific 'door' tile value right now, just empty space.

		}
		return [rx, ry];
	}

	_drawCorridor(startPosition: Point, endPosition: Point) {
		const xOffset = endPosition[0] - startPosition[0];
		const yOffset = endPosition[1] - startPosition[1];

		let xpos = startPosition[0];
		let ypos = startPosition[1];

		let tempDist;
		let move; // 2 element array, element 0 is the direction, element 1 is the total value to move.
		const moves = []; // a list of 2 element arrays

		const xAbs = Math.abs(xOffset);
		const yAbs = Math.abs(yOffset);

		const percent = RNG.getUniform(); // used to split the move at different places along the long axis
		const firstHalf = percent;
		const secondHalf = 1 - percent;

		const xDir = xOffset > 0 ? 2 : 6;
		const yDir = yOffset > 0 ? 4 : 0;

		if (xAbs < yAbs) {
			// move firstHalf of the y offset
			tempDist = Math.ceil(yAbs * firstHalf);
			moves.push([yDir, tempDist]);
			// move all the x offset
			moves.push([xDir, xAbs]);
			// move sendHalf of the  y offset
			tempDist = Math.floor(yAbs * secondHalf);
			moves.push([yDir, tempDist]);
		} else {
			//  move firstHalf of the x offset
			tempDist = Math.ceil(xAbs * firstHalf);
			moves.push([xDir, tempDist]);
			// move all the y offset
			moves.push([yDir, yAbs]);
			// move secondHalf of the x offset.
			tempDist = Math.floor(xAbs * secondHalf);
			moves.push([xDir, tempDist]);
		}

		this.map[xpos][ypos] = 0;

		while (moves.length > 0) {
			move = moves.pop() as Point;
			while (move[1] > 0) {
				xpos += DIRS[8][move[0]][0];
				ypos += DIRS[8][move[0]][1];
				this.map[xpos][ypos] = 0;
				move[1] = move[1] - 1;
			}
		}
	}

	_createCorridors() {
		// Draw Corridors between connected rooms

		const cw = this._options.cellWidth;
		const ch = this._options.cellHeight;
		let room;
		let connection;
		let otherRoom;
		let wall;
		let otherWall;

		for (let i = 0; i < cw; i++) {
			for (let j = 0; j < ch; j++) {
				room = this.rooms[i][j];

				for (let k = 0; k < room["connections"].length; k++) {

					connection = room["connections"][k];

					otherRoom = this.rooms[connection[0]][connection[1]];

					// figure out what wall our corridor will start one.
					// figure out what wall our corridor will end on.
					if (otherRoom["cellx"] > room["cellx"]) {
						wall = 2;
						otherWall = 4;
					} else if (otherRoom["cellx"] < room["cellx"]) {
						wall = 4;
						otherWall = 2;
					} else if(otherRoom["celly"] > room["celly"]) {
						wall = 3;
						otherWall = 1;
					} else {
						wall = 1;
						otherWall = 3;
					}

					this._drawCorridor(this._getWallPosition(room, wall), this._getWallPosition(otherRoom, otherWall));
				}
			}
		}
	}
}
