import * as ROT from "@/lib/index.js";
import { describe, expect, it } from "vitest";

describe("Map.Dungeon", function() {
	var names: ("Digger" | "Uniform")[] = ["Digger", "Uniform"];

	var buildDungeonTests = function(name: "Digger" | "Uniform") {
		var ctor = ROT.Map[name];
		ROT.RNG.setSeed(1234);
		var map = new ctor(ROT.DEFAULT_WIDTH, ROT.DEFAULT_HEIGHT, {});
		map.create();
		var rooms = map.getRooms();
		var corridors = map.getCorridors();

		describe(name, function() {
			it("should generate >0 rooms", function() {
				expect(rooms.length).toBeGreaterThan(0);
			});

			it("all rooms should have at least one door", function() {
				for (var i=0;i<rooms.length;i++) {
					var room = rooms[i];
					var doorCount = 0;
					room.create(function(x: number, y: number, value: number) {
						if (value == 2) { doorCount++ }
					})
					expect(doorCount).toBeGreaterThan(0);
				}
			});

			it("all rooms should have at least one wall", function() {
				for (var i=0;i<rooms.length;i++) {
					var room = rooms[i];
					var wallCount = 0;
					room.create(function(x: number, y: number, value: number) {
						if (value == 1) { wallCount++ }
					})
					expect(wallCount).toBeGreaterThan(0);
				}
			});

			it("all rooms should have at least one empty cell", function() {
				for (var i=0;i<rooms.length;i++) {
					var room = rooms[i];
					var emptyCount = 0;
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
				for (var i=0;i<corridors.length;i++) {
					var corridor = corridors[i];
					var emptyCount = 0;
					corridor.create(function(x: number, y: number, value: number) {
						if (value == 0) { emptyCount++ }
					})
					expect(emptyCount).toBeGreaterThan(0);
				}
			});
		});

	}

	while (names.length) {
		var name = names.shift();
		buildDungeonTests(name);
	}
});
