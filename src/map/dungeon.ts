import { Map } from '@/src/map/map.js';
import type { Room, Corridor } from '@/src/map/features.js';

/**
 * @class Dungeon map: has rooms and corridors
 * @augments ROT.Map
 */
export abstract class Dungeon extends Map {
	rooms: Room[];
	corridors: Corridor[];

	constructor(width: number, height: number) {
		super(width, height);
		this.rooms = [];
		this.corridors = [];
	}

	/**
	 * Get all generated rooms
	 * @returns {ROT.Map.Feature.Room[]}
	 */
	getRooms() { return this.rooms; }

	/**
	 * Get all generated corridors
	 * @returns {ROT.Map.Feature.Corridor[]}
	 */
	getCorridors() { return this.corridors; }
}
