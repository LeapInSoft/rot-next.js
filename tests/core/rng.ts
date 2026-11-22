import * as ROT from "@/src";
import { describe, expect, it } from "vitest";

describe("RNG", function() {
	describe("getUniform", function() {
		const value = ROT.RNG.getUniform();
		it("should return a number", function() {
			expect(typeof(value)).toEqual("number");
		});
		it("should return a number 0..1", function() {
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
		});
	});

	describe("getUniformInt", function() {
		it("should return the bound for an empty range", function() {
			ROT.RNG.setSeed(123);
			expect(ROT.RNG.getUniformInt(7, 7)).toBe(7);
		});
	});

	describe("getUniformInt", function() {
	const lowerBound = 5;
	const upperBound = 10;
		it("should return a number", function() {
		  const value = ROT.RNG.getUniformInt(lowerBound, upperBound);
			expect(typeof(value)).toEqual("number");
		});
		it("should not care which number is larger in the arguments", function() {
			const seed = 123456;
			ROT.RNG.setSeed(seed);
			const val1 = ROT.RNG.getUniformInt(lowerBound, upperBound);
			ROT.RNG.setSeed(seed);
			const val2 = ROT.RNG.getUniformInt(upperBound, lowerBound);
			expect(val1).toEqual(val2);
		});
		it("should only return a number in the desired range", function() {
			const value = ROT.RNG.getUniformInt(lowerBound, upperBound);
			const value2 = ROT.RNG.getUniformInt(upperBound, lowerBound);
			expect(value).not.toBeGreaterThan(upperBound);
			expect(value).not.toBeLessThan(lowerBound);
			expect(value2).not.toBeGreaterThan(upperBound);
			expect(value2).not.toBeLessThan(lowerBound);
		});
	});

	describe("getWeightedValue", function() {
		it("should return undefined when no weighted values are available", function() {
			expect(ROT.RNG.getWeightedValue({})).toBeUndefined();
		});

		it("should return a weighted key", function() {
			ROT.RNG.setSeed(12345);
			expect(["common", "rare"]).toContain(
				ROT.RNG.getWeightedValue({ common: 10, rare: 1 })
			);
		});
	});

	describe("distribution helpers", function() {
		it("should keep getNormal finite and getPercentage in range", function() {
			ROT.RNG.setSeed(123456);

			const normal = ROT.RNG.getNormal();
			const percentage = ROT.RNG.getPercentage();

			expect(Number.isFinite(normal)).toBe(true);
			expect(percentage).toBeGreaterThanOrEqual(1);
			expect(percentage).toBeLessThanOrEqual(100);
		});

		it("should return null for getItem on an empty array", function() {
			expect(ROT.RNG.getItem([])).toBeNull();
		});

		it("should preserve all items when shuffling", function() {
			ROT.RNG.setSeed(123456);
			const original = [1, 2, 3, 4, 5];

			const shuffled = ROT.RNG.shuffle(original);

			expect(original).toEqual([1, 2, 3, 4, 5]);
			expect(shuffled).toHaveLength(original.length);
			expect([...shuffled].sort((a, b) => a - b)).toEqual(original);
		});

		it("should preserve null, undefined, and NaN items when shuffling", function() {
			ROT.RNG.setSeed(123456);
			const original = [null, undefined, Number.NaN, 1];

			const shuffled = ROT.RNG.shuffle(original);

			expect(shuffled).toHaveLength(original.length);
			expect(shuffled).toEqual(expect.arrayContaining(original));
		});
	});

	describe("seeding", function() {
		it("should return a seed number", function() {
			expect(typeof(ROT.RNG.getSeed())).toEqual("number");
		});

		it("should return the same value for a given seed", function() {
			const seed = 123456;
			ROT.RNG.setSeed(seed);
			const val1 = ROT.RNG.getUniform();
			ROT.RNG.setSeed(seed);
			const val2 = ROT.RNG.getUniform();
			expect(val1).toEqual(val2);
		});

		it("should return a precomputed value for a given seed", function() {
			ROT.RNG.setSeed(12345);
			const val = ROT.RNG.getUniform();
			expect(val).toEqual(0.01198604702949524);
		});
	});
	
	describe("state manipulation", function() {
		it("should return identical values after setting identical states", function() {
			ROT.RNG.getUniform();
			
			const state = ROT.RNG.getState();
			const val1 = ROT.RNG.getUniform();
			ROT.RNG.setState(state);
			const val2 = ROT.RNG.getUniform();

			expect(val1).toEqual(val2);
		});
	});

	describe("cloning", function() {
		it("should be able to clone a RNG", function() {
			const clone = ROT.RNG.clone();
			expect(typeof(clone)).toEqual("object");
		});

		it("should clone a working RNG", function() {
			const clone = ROT.RNG.clone();
			const num = clone.getUniform();
			expect(typeof(num)).toEqual("number");
		});

		it("should clone maintaining its state", function() {
			const clone = ROT.RNG.clone();
			const num1 = ROT.RNG.getUniform();
			const num2 = clone.getUniform();
			expect(num1).toEqual(num2);
		});
	});

	describe("independent RNG streams", () => {
		it("should reproduce a sequence when created with the same seed", () => {
			const seed = 123456;
			const first = ROT.createRNG(seed);
			const second = ROT.createRNG(seed);

			const firstSequence = Array.from({length: 5}, () => first.getUniform());
			const secondSequence = Array.from({length: 5}, () => second.getUniform());

			expect(firstSequence).toEqual(secondSequence);
		});

		it("should keep independently seeded streams isolated", () => {
			const stream = ROT.createRNG(123456);
			const control = ROT.createRNG(123456);
			const other = ROT.createRNG(654321);
			Array.from({length: 5}, () => other.getUniform());

			expect(stream.getUniform()).toEqual(control.getUniform());
		});

		it("should restore or clone the current sequence", () => {
			const stream = ROT.createRNG(123456);
			stream.getUniform();
			const state = stream.getState();
			const clone = stream.clone();
			const expected = stream.getUniform();

			stream.setState(state);
			expect(stream.getUniform()).toEqual(expected);
			expect(clone.getUniform()).toEqual(expected);
		});

		it("should not alter the legacy singleton when creating a stream", () => {
			const state = ROT.RNG.getState();
			const expected = ROT.RNG.clone().getUniform();

			ROT.createRNG(123456);
			expect(ROT.RNG.getUniform()).toEqual(expected);
			ROT.RNG.setState(state);
		});
	});
});
