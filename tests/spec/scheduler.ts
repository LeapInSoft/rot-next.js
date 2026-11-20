import * as ROT from "@/src";
import { beforeEach, describe, expect, it } from "vitest";

describe("Scheduler", function() {
	describe("Simple", function() {
		const S = new ROT.Scheduler.Simple();
		const A1 = "A1";
		const A2 = "A2";
		const A3 = "A3";
		beforeEach(function() { S.clear(); });

		it("should schedule actors evenly", function() {
			S.add(A1, true);
			S.add(A2, true);
			S.add(A3, true);
			const result = [];
			for (let i=0;i<6;i++) { result.push(S.next()); }
			expect(result).toEqual([A1, A2, A3, A1, A2, A3]);
		});

		it("should schedule one-time events", function() {
			S.add(A1, false);
			S.add(A2, true);
			const result = [];
			for (let i=0;i<4;i++) { result.push(S.next()); }
			expect(result).toEqual([A1, A2, A2, A2]);
		});

		it("should remove repeated events", function() {
			S.add(A1, false);
			S.add(A2, true);
			S.add(A3, true);
			S.remove(A2);
			const result = [];
			for (let i=0;i<4;i++) { result.push(S.next()); }
			expect(result).toEqual([A1, A3, A3, A3]);
		});

		it("should remove one-time events", function() {
			S.add(A1, false);
			S.add(A2, false);
			S.add(A3, true);
			S.remove(A2);
			const result = [];
			for (let i=0;i<4;i++) { result.push(S.next()); }
			expect(result).toEqual([A1, A3, A3, A3]);
		});

		it("should remove properly (issue #187)", function() {
			S.add(A1, true);
			S.add(A2, true);
			S.remove(A2);

			const result = [];
			for (let i=0;i<4;i++) { result.push(S.next()); }
			expect(result).toEqual([A1, A1, A1, A1]);
		});
	});

	describe("Speed", function() {
		const S = new ROT.Scheduler.Speed();
		const A: {speed:number; getSpeed():number} = {speed:0, getSpeed:function(){return this.speed;}};
		const A50 = Object.create(A); A50.speed = 50;
		const A100a = Object.create(A); A100a.speed = 100;
		const A100b = Object.create(A); A100b.speed = 100;
		const A200 = Object.create(A); A200.speed = 200;

		beforeEach(function() { S.clear(); });

		it("should reject actors with zero speed", function() {
			const actor = {getSpeed: () => 0};

			expect(() => S.add(actor, true)).toThrow(RangeError);
		});

		it("should reject zero speed when rescheduling a repeated actor", function() {
			const actor = {speed: 1, getSpeed() { return this.speed; }};
			S.add(actor, true);
			expect(S.next()).toBe(actor);

			actor.speed = 0;
			expect(() => S.next()).toThrow(RangeError);
		});

		it("should schedule same speed evenly", function() {
			S.add(A100a, true);
			S.add(A100b, true);
			const result = [];
			for (let i=0;i<4;i++) { result.push(S.next()); }

			expect(result).toEqual([A100a, A100b, A100a, A100b]);
		});

		it("should schedule different speeds properly", function() {
			S.add(A50, true);
			S.add(A100a, true);
			S.add(A200, true);
			const result = [];
			for (let i=0;i<7;i++) { result.push(S.next()); }
			expect(result).toEqual([A200, A100a, A200, A200, A50, A100a, A200]);
		});

		it("should schedule with initial offsets", function() {
			S.add(A50, true, 1/300);
			S.add(A100a, true, 0);
			S.add(A200, true);
			const result = [];
			for (let i=0;i<9;i++) { result.push(S.next()); }
			expect(result).toEqual([A100a, A50, A200, A100a, A200, A200, A100a, A200, A50]);
		});

		it("should look up the time of an event", function() {
			S.add(A100a, true);
			S.add(A50, true, 1/200);
			expect(S.getTimeOf(A50)).toEqual(1/200);
			expect(S.getTimeOf(A100a)).toEqual(1/100);
		});

		it("should repeatedly schedule an actor after next", function() {
			const speedScheduler = new ROT.Scheduler.Speed<{ getSpeed(): number }>();
			const actor = { getSpeed: () => 100 };

			speedScheduler.add(actor, true);
			expect(speedScheduler.next()).toBe(actor);
			expect(speedScheduler.next()).toBe(actor);
		});

	});

	describe("Action", function() {
		let S: InstanceType<typeof ROT.Scheduler.Action>;
		const A1 = "A1";
		const A2 = "A2";
		const A3 = "A3";
		beforeEach(function() { S = new ROT.Scheduler.Action(); });

		it("should schedule evenly by default", function() {
			S.add(A1, true);
			S.add(A2, true);
			S.add(A3, true);
			const result = [];
			for (let i=0;i<6;i++) { result.push(S.next()); }
			expect(result).toEqual([A1, A2, A3, A1, A2, A3]);
		});

		it("should schedule with respect to extra argument", function() {
			S.add(A1, true);
			S.add(A2, true, 2);
			S.add(A3, true);
			const result = [];
			for (let i=0;i<6;i++) { result.push(S.next()); }
			expect(result).toEqual([A1, A3, A2, A1, A3, A2]);
		});

		it("should preserve an explicit zero delay", function() {
			S.add(A1, true, 0);
			expect(S.getTimeOf(A1)).toEqual(0);
		});

		it("should schedule a zero-delay action before a positive-delay action", function() {
			S.add(A1, true, 0);
			S.add(A2, true, 1);

			expect(S.next()).toBe(A1);
			expect(S.getTime()).toBe(0);
			expect(S.next()).toBe(A2);
			expect(S.getTime()).toBe(1);
		});

		it("should advance time only for positive action delays", function() {
			S.add(A1, false, -2);
			S.add(A2, false, 0);
			S.add(A3, false, 3);

			expect(S.next()).toBe(A1);
			expect(S.getTime()).toBe(0);
			expect(S.next()).toBe(A2);
			expect(S.getTime()).toBe(0);
			expect(S.next()).toBe(A3);
			expect(S.getTime()).toBe(3);
		});

		it("should use the default delay when the delay is omitted", function() {
			S.add(A1, true);

			expect(S.getTimeOf(A1)).toBe(1);
		});

		it("should schedule with respect to action duration", function() {
			S.add(A1, true);
			S.add(A2, true);
			S.add(A3, true);
			const result = [];

			result.push(S.next());
			S.setDuration(10);

			result.push(S.next());
			S.setDuration(5);

			result.push(S.next());
			S.setDuration(1);
			expect(S.getTime()).toEqual(1);

			for (let i=0;i<3;i++) {
				result.push(S.next());
				S.setDuration(100); /* somewhere in the future */
			}

			expect(result).toEqual([A1, A2, A3, A3, A2, A1]);
		});

		it("should preserve a zero action duration", function() {
			S.add(A1, true);
			S.add(A2, true);

			expect(S.next()).toEqual(A1);
			S.setDuration(0);
			expect(S.next()).toEqual(A2);

			expect(S.getTimeOf(A1)).toEqual(0);
		});
	});

	describe("Zero-ID actor", function() {
		const schedulers = [ROT.Scheduler.Simple, ROT.Scheduler.Action] as const;
		schedulers.forEach((schedulerCtor, i) => describe(`scheduler ${i}`, function() {
			const s = new schedulerCtor();
			const A1 = 0;

			it("should schedule the zero-id actor", function() {
				s.add(A1, true);
				const result = [];
				for (let i=0;i<6;i++) { result.push(s.next()); }
				expect(result).toEqual([A1, A1, A1, A1, A1, A1]);
			});

			if (schedulerCtor === ROT.Scheduler.Action) {
				it("should set the duration for the zero-id actor", function() {
					const actionScheduler = new ROT.Scheduler.Action();
					const otherActor = "B";
					actionScheduler.add(A1, true);
					actionScheduler.add(otherActor, true);

					const result = [actionScheduler.next()];
					actionScheduler.setDuration(10);
					result.push(actionScheduler.next());
					result.push(actionScheduler.next());

					expect(result).toEqual([A1, otherActor, otherActor]);
				});
			}
		}));
	});
});
