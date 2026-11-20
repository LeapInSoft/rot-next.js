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

});
