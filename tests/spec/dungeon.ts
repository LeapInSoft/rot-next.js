import * as ROT from "@/src";
import { describe, expect, it } from "vitest";

describe("Map.Dungeon", function() {
	const names: ("Digger" | "Uniform")[] = ["Digger", "Uniform"];

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
		});

	}

	while (names.length) {
		const name = names.shift();
		buildDungeonTests(name);
	}
});
