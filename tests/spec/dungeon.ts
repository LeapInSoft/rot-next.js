import * as ROT from "@/src";
import { describe, expect, it } from "vitest";

describe("Map.Dungeon", function() {
	const names: ("Digger" | "Uniform")[] = ["Digger", "Uniform"];

	it("should construct Uniform with default options", function() {
		expect(() => new ROT.Map.Uniform(80, 25)).not.toThrow();
	});

	it("should construct Digger with default options", function() {
		expect(() => new ROT.Map.Digger(80, 25)).not.toThrow();
	});

	it("should generate a 6x6 Digger map with seed 2", function() {
		ROT.RNG.setSeed(2);

		expect(() => new ROT.Map.Digger(6, 6).create()).not.toThrow();
	});

	const expectConnectedFloors = function(map: number[][]) {
		const floors = new Set<string>();
		map.forEach((column, x) => column.forEach((value, y) => {
			if (value === 0) { floors.add(`${x},${y}`); }
		}));
		const firstFloor = floors.values().next().value;
		expect(firstFloor).toBeDefined();
		if (firstFloor === undefined) { return; }

		const reachable = new Set([firstFloor]);
		const pending = [firstFloor];
		while (pending.length) {
			const cell = pending.pop();
			if (cell === undefined) { continue; }
			const [x, y] = cell.split(",").map(Number);
			[`${x-1},${y}`, `${x+1},${y}`, `${x},${y-1}`, `${x},${y+1}`]
				.filter(neighbor => floors.has(neighbor) && !reachable.has(neighbor))
				.forEach(neighbor => {
					reachable.add(neighbor);
					pending.push(neighbor);
				});
		}

		expect(reachable.size).toBe(floors.size);
	}

	const buildDungeonTests = function(name: "Digger" | "Uniform") {
		const ctor = ROT.Map[name];
		ROT.RNG.setSeed(1234);
		const map = new ctor(ROT.DEFAULT_WIDTH, ROT.DEFAULT_HEIGHT, {});
		map.create();
		const rooms = map.getRooms();
		const corridors = map.getCorridors();

		describe(name, function() {
			it("should generate >0 rooms", function() {
				expect(rooms.length).toBeGreaterThan(0);
			});

			it("all rooms should have at least one door", function() {
				for (let i=0;i<rooms.length;i++) {
					const room = rooms[i];
					let doorCount = 0;
					room.create(function(x: number, y: number, value: number) {
						if (value == 2) { doorCount++ }
					})
					expect(doorCount).toBeGreaterThan(0);
				}
			});

			it("all rooms should have at least one wall", function() {
				for (let i=0;i<rooms.length;i++) {
					const room = rooms[i];
					let wallCount = 0;
					room.create(function(x: number, y: number, value: number) {
						if (value == 1) { wallCount++ }
					})
					expect(wallCount).toBeGreaterThan(0);
				}
			});

			it("all rooms should have at least one empty cell", function() {
				for (let i=0;i<rooms.length;i++) {
					const room = rooms[i];
					let emptyCount = 0;
					room.create(function(x: number, y: number, value: number) {
						if (value == 0) { emptyCount++ }
					})
					expect(emptyCount).toBeGreaterThan(0);
				}
			});

			it("should generate >0 corridors", function() {
				expect(corridors.length).toBeGreaterThan(0);
			});

			it("all corridors should have at least one empty cell", function() {
				for (let i=0;i<corridors.length;i++) {
					const corridor = corridors[i];
					let emptyCount = 0;
					corridor.create(function(x: number, y: number, value: number) {
						if (value == 0) { emptyCount++ }
					})
					expect(emptyCount).toBeGreaterThan(0);
				}
			});

			it("should connect every floor cell", function() {
				ROT.RNG.setSeed(1234);
				const map = Array.from({ length: ROT.DEFAULT_WIDTH }, () => Array<number>(ROT.DEFAULT_HEIGHT).fill(-1));
				new ctor(ROT.DEFAULT_WIDTH, ROT.DEFAULT_HEIGHT, {}).create((x, y, value) => {
					map[x][y] = value;
				});

				expectConnectedFloors(map);
			});
		});

	}

	while (names.length) {
		const name = names.shift();
		buildDungeonTests(name);
	}
});
