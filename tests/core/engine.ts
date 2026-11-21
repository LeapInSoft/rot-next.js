import * as ROT from "@/src";
import { beforeEach, describe, expect, it } from "vitest";

describe("Engine", function() {
	let RESULT = 0;
	let E: InstanceType<typeof ROT.Engine>;
	let S: InstanceType<typeof ROT.Scheduler.Speed>;
	const A50 = {getSpeed: function() { return 50; }, act: function() { RESULT++; } };
	const A70 = {getSpeed: function() { return 70; }, act: function() { RESULT++; S.add(A100, false); } };
	const A100 = {getSpeed: function() { return 100; }, act: function() { E.lock(); } };

	beforeEach(function() {
		RESULT = 0;
		S = new ROT.Scheduler.Speed();
		E = new ROT.Engine(S);
	});

	it("should stop when locked", function() {
		S.add(A50, true);
		S.add(A100, true);

		E.start();
		expect(RESULT).toEqual(0);
	});

	it("should run until locked", function() {
		S.add(A50, true);
		S.add(A70, true);

		E.start();
		expect(RESULT).toEqual(2);
	});

	it("should run only when unlocked", function() {
		S.add(A70, true);

		E.lock();
		E.start();
		expect(RESULT).toEqual(0);
		E.start();
		expect(RESULT).toEqual(1);
	});

	it("should restore the lock when an actor throws", function() {
		const error = new Error("Actor failed");
		let shouldThrow = true;
		const actor = {
			getSpeed: function() { return 50; },
			act: function() {
				if (shouldThrow) {
					shouldThrow = false;
					throw error;
				}
				RESULT++;
				E.lock();
			}
		};
		S.add(actor, true);

		expect(() => E.start()).toThrow(error);
		E.start();
		expect(RESULT).toEqual(1);
	});

	it("should resume when an actor's promise rejects", async function() {
		let calls = 0;
		const actor = {
			getSpeed: function() { return 50; },
			act: function() {
				calls++;
				if (calls === 1) { return Promise.reject(new Error("Actor failed")); }
				return E.lock();
			}
		};
		S.add(actor, true);

		E.start();
		await Promise.resolve();
		expect(calls).toEqual(2);
	});
});
