import * as ROT from "@/src";
import { describe, expect, it } from "vitest";

describe("FOV", function() {
	type LightCallback = ((x: number, y: number) => boolean) & {center: [number, number]};

	const MAP8_RING0 = [
		"#####",
		"#####",
		"##@##",
		"#####",
		"#####"
	];

	const RESULT_MAP8_RING0 = [
		"     ",
		" ... ",
		" ... ",
		" ... ",
		"     "
	];

	const RESULT_MAP8_RING0_90_NORTH = [
		"     ",
		" ... ",
		"  .  ",
		"     ",
		"     "
	];

	const RESULT_MAP8_RING0_90_SOUTH = [
		"     ",
		"     ",
		"  .  ",
		" ... ",
		"     "
	];

	const RESULT_MAP8_RING0_90_EAST = [
		"     ",
		"   . ",
		"  .. ",
		"   . ",
		"     "
	];

	const RESULT_MAP8_RING0_90_WEST = [
		"     ",
		" .   ",
		" ..  ",
		" .   ",
		"     "
	];

	const RESULT_MAP8_RING0_180_NORTH = [
		"     ",
		" ... ",
		" ... ",
		"     ",
		"     "
	];

	const RESULT_MAP8_RING0_180_SOUTH = [
		"     ",
		"     ",
		" ... ",
		" ... ",
		"     "
	];

	const RESULT_MAP8_RING0_180_EAST = [
		"     ",
		"  .. ",
		"  .. ",
		"  .. ",
		"     "
	];

	const RESULT_MAP8_RING0_180_WEST = [
		"     ",
		" ..  ",
		" ..  ",
		" ..  ",
		"     "
	];

	const MAP8_RING1 = [
		"#####",
		"#...#",
		"#.@.#",
		"#...#",
		"#####"
	];

	const MAP8_PARTIAL = [
		"#####",
		"##..#",
		"#.@.#",
		"#...#",
		"#####"
	];

	const RESULT_MAP8_RING1 = [
		".....",
		".....",
		".....",
		".....",
		"....."
	];

	const buildLightCallback = function(map: string[]): LightCallback {
		let center: [number, number] = [0, 0];
		/* locate center */
		for (let j=0;j<map.length;j++) {
			for (let i=0;i<map[j].length;i++) {
				if (map[j].charAt(i) == "@") {
					center = [i, j];
				}
			}
		}

		const result = function(x: number, y: number) {
			const ch = map[y].charAt(x);
			return (ch != "#");
		};
		return Object.assign(result, {center});
	}

	const checkResult = function(fov: Pick<InstanceType<typeof ROT.FOV.DiscreteShadowcasting>, "compute">, center: [number, number], result: string[]) {
		const used: Record<string, number> = {};
		const callback = function(x: number, y: number, dist: number) {
			expect(result[y].charAt(x)).toEqual(".");
			used[x+","+y] = 1;
		}

		fov.compute(center[0], center[1], 2, callback);
		for (let j=0;j<result.length;j++) {
			for (let i=0;i<result[j].length;i++) {
				if (result[j].charAt(i) != ".") { continue; }
				expect((i+","+j) in used).toEqual(true);
			}
		}
	}

	const checkResult90Degrees = function(fov: InstanceType<typeof ROT.FOV.RecursiveShadowcasting>, dir: number, center: [number, number], result: string[]) {
		const used: Record<string, number> = {};
		const callback = function(x: number, y: number, dist: number) {
			expect(result[y].charAt(x)).toEqual(".");
			used[x+","+y] = 1;
		}

		fov.compute90(center[0], center[1], 2, dir, callback);
		for (let j=0;j<result.length;j++) {
			for (let i=0;i<result[j].length;i++) {
				if (result[j].charAt(i) != ".") { continue; }
				expect((i+","+j) in used).toEqual(true);
			}
		}
	}

	const checkResult180Degrees = function(fov: InstanceType<typeof ROT.FOV.RecursiveShadowcasting>, dir: number, center: [number, number], result: string[]) {
		const used: Record<string, number> = {};
		const callback = function(x: number, y: number, dist: number) {
			expect(result[y].charAt(x)).toEqual(".");
			used[x+","+y] = 1;
		}

		fov.compute180(center[0], center[1], 2, dir, callback);
		for (let j=0;j<result.length;j++) {
			for (let i=0;i<result[j].length;i++) {
				if (result[j].charAt(i) != ".") { continue; }
				expect((i+","+j) in used).toEqual(true);
			}
		}
	}

	describe("Discrete Shadowcasting", function() {
		it("should show an opaque origin but block visibility beyond it", function() {
			const fov = new ROT.FOV.DiscreteShadowcasting(() => false);
			const visible: string[] = [];

			fov.compute(2, 2, 2, (x, y) => { visible.push(`${x},${y}`); });

			expect(visible).toEqual(["2,2"]);
		});

		describe("8-topology", function() {
			it("should compute visible ring0", function() {
				const lightPasses = buildLightCallback(MAP8_RING0);
				const fov = new ROT.FOV.DiscreteShadowcasting(lightPasses, {topology:8});
				checkResult(fov, lightPasses.center, RESULT_MAP8_RING0);
			});
			it("should compute visible ring1", function() {
				const lightPasses = buildLightCallback(MAP8_RING1);
				const fov = new ROT.FOV.DiscreteShadowcasting(lightPasses, {topology:8});
				checkResult(fov, lightPasses.center, RESULT_MAP8_RING1);
			});
		});
	});

	describe("Precise Shadowcasting", function() {
		it("should show an opaque origin but block visibility beyond it", function() {
			const fov = new ROT.FOV.PreciseShadowcasting(() => false);
			const visible: string[] = [];

			fov.compute(2, 2, 2, (x, y) => { visible.push(`${x},${y}`); });

			expect(visible).toEqual(["2,2"]);
		});

		describe("8-topology", function() {
			const topology = 8 as const;
			it("should compute visible ring0", function() {
				const lightPasses = buildLightCallback(MAP8_RING0);
				const fov = new ROT.FOV.PreciseShadowcasting(lightPasses, {topology:topology});
				checkResult(fov, lightPasses.center, RESULT_MAP8_RING0);
			});
			it("should compute visible ring1", function() {
				const lightPasses = buildLightCallback(MAP8_RING1);
				const fov = new ROT.FOV.PreciseShadowcasting(lightPasses, {topology:topology});
				checkResult(fov, lightPasses.center, RESULT_MAP8_RING1);
			});
		});
	});

	describe("Recursive Shadowcasting", function() {
		describe("8-topology", function() {
			describe("360-degree view", function () {
				it("should compute visible ring0 in 360 degrees", function() {
					const lightPasses = buildLightCallback(MAP8_RING0);
					const fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology:8});
					checkResult(fov, lightPasses.center, RESULT_MAP8_RING0);
				});
				it("should compute visible ring1 in 360 degrees", function() {
					const lightPasses = buildLightCallback(MAP8_RING1);
					const fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology:8});
					checkResult(fov, lightPasses.center, RESULT_MAP8_RING1);
				});
				it("should report each visible cell only once", function() {
					const fov = new ROT.FOV.RecursiveShadowcasting(() => true);
					const counts = new Map<string, number>();

					fov.compute(0, 0, 3, (x, y) => {
						const key = `${x},${y}`;
						counts.set(key, (counts.get(key) || 0) + 1);
					});

					expect([...counts.values()].every(count => count === 1)).toBe(true);
				});
				it("should use a Manhattan-radius footprint for 4-topology", function() {
					const fov = new ROT.FOV.RecursiveShadowcasting(() => true, {topology:4});
					const visible = new Set<string>();

					fov.compute(0, 0, 2, (x, y) => visible.add(`${x},${y}`));

					const expected = new Set<string>();
					for (let x = -2; x <= 2; x++) {
						for (let y = -2; y <= 2; y++) {
							if (Math.abs(x) + Math.abs(y) <= 2) { expected.add(`${x},${y}`); }
						}
					}
					expect(visible).toEqual(expected);
				});
				it("should reject invalid directions for partial views", function() {
					const fov = new ROT.FOV.RecursiveShadowcasting(() => true);

					expect(() => fov.compute90(0, 0, 2, 8, () => {})).toThrow(RangeError);
					expect(() => fov.compute180(0, 0, 2, -1, () => {})).toThrow(RangeError);
				});
			});
			describe("180-degree view", function () {
				it("should compute visible ring0 180 degrees facing north", function() {
					const lightPasses = buildLightCallback(MAP8_RING0);
					const fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology:8});
					checkResult180Degrees(fov, 0, lightPasses.center, RESULT_MAP8_RING0_180_NORTH);
				});
				it("should compute visible ring0 180 degrees facing south", function() {
					const lightPasses = buildLightCallback(MAP8_RING0);
					const fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology:8});
					checkResult180Degrees(fov, 4, lightPasses.center, RESULT_MAP8_RING0_180_SOUTH);
				});
				it("should compute visible ring0 180 degrees facing east", function() {
					const lightPasses = buildLightCallback(MAP8_RING0);
					const fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology:8});
					checkResult180Degrees(fov, 2, lightPasses.center, RESULT_MAP8_RING0_180_EAST);
				});
				it("should compute visible ring0 180 degrees facing west", function() {
					const lightPasses = buildLightCallback(MAP8_RING0);
					const fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology:8});
					checkResult180Degrees(fov, 6, lightPasses.center, RESULT_MAP8_RING0_180_WEST);
				});
			});
			describe("90-degree view", function () {
				it("should compute visible ring0 90 degrees facing north", function() {
					const lightPasses = buildLightCallback(MAP8_RING0);
					const fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology:8});
					checkResult90Degrees(fov, 0, lightPasses.center, RESULT_MAP8_RING0_90_NORTH);
				});
				it("should compute visible ring0 90 degrees facing south", function() {
					const lightPasses = buildLightCallback(MAP8_RING0);
					const fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology:8});
					checkResult90Degrees(fov, 4, lightPasses.center, RESULT_MAP8_RING0_90_SOUTH);
				});
				it("should compute visible ring0 90 degrees facing east", function() {
					const lightPasses = buildLightCallback(MAP8_RING0);
					const fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology:8});
					checkResult90Degrees(fov, 2, lightPasses.center, RESULT_MAP8_RING0_90_EAST);
				});
				it("should compute visible ring0 90 degrees facing west", function() {
					const lightPasses = buildLightCallback(MAP8_RING0);
					const fov = new ROT.FOV.RecursiveShadowcasting(lightPasses, {topology:8});
					checkResult90Degrees(fov, 6, lightPasses.center, RESULT_MAP8_RING0_90_WEST);
				});
			});
		});
	});

}); /* FOV */
