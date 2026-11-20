import * as ROT from "@/src";
import { describe, expect, it } from "vitest";

type Lights = Record<string, number[]>;

function createLighting(
	reflectivity: (x: number, y: number) => number = () => 0,
	options: ConstructorParameters<typeof ROT.Lighting>[1] = {}
) {
	const lighting = new ROT.Lighting(reflectivity, options);
	lighting.setFOV(new ROT.FOV.PreciseShadowcasting(() => true));
	return lighting;
}

function collect(lighting: InstanceType<typeof ROT.Lighting>) {
	const result: Lights = {};
	lighting.compute((x, y, color) => { result[`${x},${y}`] = [...color]; });
	return result;
}

describe("Lighting", function() {
	it("uses the default range and converts string light colors", function() {
		const lighting = createLighting();
		lighting.setLight(0, 0, "red");

		const lights = collect(lighting);

		expect(lights["0,0"]).toEqual([255, 0, 0]);
		expect(lights["1,0"]).toEqual([230, 0, 0]);
		expect(lights["10,0"]).toBeUndefined();
	});

	it("requires an FOV algorithm when computing a light source", function() {
		const lighting = new ROT.Lighting(() => 0);
		lighting.setLight(0, 0, [100, 100, 100]);

		expect(() => lighting.compute(() => {})).toThrow('FOV algorithm must be set before computing lighting');
	});

	it("adds light from multiple sources at overlapping cells", function() {
		const lighting = createLighting(() => 0, {range: 2});
		lighting.setLight(0, 0, [100, 0, 0]);
		lighting.setLight(2, 0, [0, 0, 100]);

		expect(collect(lighting)["1,0"]).toEqual([50, 0, 50]);
	});

	it("updates and removes lights and can clear all lights", function() {
		const lighting = createLighting();
		lighting.setLight(0, 0, [100, 100, 100]);
		lighting.setLight(0, 0, "red");
		expect(collect(lighting)["0,0"]).toEqual([255, 0, 0]);

		lighting.setLight(0, 0, null);
		expect(collect(lighting)).toEqual({});

		lighting.setLight(0, 0, [100, 100, 100]);
		lighting.clearLights();
		expect(collect(lighting)).toEqual({});
	});

	it("caches FOV calculations until reset or the FOV is replaced", function() {
		let passChecks = 0;
		const lighting = createLighting();
		lighting.setFOV(new ROT.FOV.PreciseShadowcasting(() => {
			passChecks++;
			return true;
		}));
		lighting.setLight(0, 0, [100, 100, 100]);

		collect(lighting);
		const checksAfterFirstCompute = passChecks;
		collect(lighting);
		expect(passChecks).toBe(checksAfterFirstCompute);

		lighting.reset();
		collect(lighting);
		expect(passChecks).toBeGreaterThan(checksAfterFirstCompute);

		lighting.setFOV(new ROT.FOV.PreciseShadowcasting(() => false));
		expect(collect(lighting)).toEqual({"0,0": [100, 100, 100]});
	});

	it("caches reflectivity values until reset", function() {
		let reflectivityChecks = 0;
		const lighting = createLighting(() => {
			reflectivityChecks++;
			return 0;
		}, {passes: 2, range: 2});
		lighting.setLight(0, 0, [100, 100, 100]);

		collect(lighting);
		const checksAfterFirstCompute = reflectivityChecks;
		expect(checksAfterFirstCompute).toBeGreaterThan(0);

		collect(lighting);
		expect(reflectivityChecks).toBe(checksAfterFirstCompute);

		lighting.reset();
		collect(lighting);
		expect(reflectivityChecks).toBeGreaterThan(checksAfterFirstCompute);
	});

	it("reflects light during additional passes", function() {
		const lighting = createLighting((x, y) => x === 1 && y === 0 ? 1 : 0, {passes: 2, range: 2});
		lighting.setLight(0, 0, [100, 100, 100]);

		expect(collect(lighting)["2,0"]).toEqual([25, 25, 25]);
	});

	it("does not reflect when the emission threshold is not exceeded", function() {
		const lighting = createLighting((x, y) => x === 1 && y === 0 ? 1 : 0, {
			passes: 2,
			emissionThreshold: 150,
			range: 2
		});
		lighting.setLight(0, 0, [100, 100, 100]);

		expect(collect(lighting)["2,0"]).toBeUndefined();
	});

	it("clears cached visibility and lights only the source when range becomes zero", function() {
		const lighting = createLighting(() => 1, {range: 2});
		lighting.setLight(0, 0, [100, 100, 100]);

		const initialLighting = collect(lighting);
		expect(initialLighting["1,0"]).toBeDefined();

		lighting.setOptions({range: 0});
		expect(collect(lighting)).toEqual({"0,0": [100, 100, 100]});
	});

	it.each([-1, NaN, Infinity, -Infinity])("rejects invalid constructor range %s", function(range) {
		expect(() => createLighting(() => 1, {range})).toThrow(RangeError);
	});

	it("rejects an invalid range update without changing the configured range", function() {
		const lighting = createLighting(() => 0, {range: 2});
		lighting.setLight(0, 0, [100, 100, 100]);

		expect(() => lighting.setOptions({range: -1})).toThrow(RangeError);
		expect(collect(lighting)["1,0"]).toEqual([50, 50, 50]);
	});
});
