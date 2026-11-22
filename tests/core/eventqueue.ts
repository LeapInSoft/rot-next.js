import * as ROT from "@/src";
import { describe, expect, it, vi } from "vitest";

describe("EventQueue", function() {
	it("should return added event", function() {
		const q = new ROT.EventQueue<string>();
		q.add("a", 100);
		expect(q.get()).toEqual("a");
	});

	it("should return null when no events are available", function() {
		const q = new ROT.EventQueue();
		expect(q.get()).toEqual(null);
	});

	it("should remove returned events", function() {
		const q = new ROT.EventQueue();
		q.add(0, 0);
		q.get();
		expect(q.get()).toEqual(null);
	});

	it("should look up time of events", function() {
		const q = new ROT.EventQueue();
		q.add(123, 187);
		q.add(456, 42);
		expect(q.getEventTime(123)).toEqual(187);
		expect(q.getEventTime(456)).toEqual(42);
	});

	it("should look up correct times after events removed", function() {
		const q = new ROT.EventQueue();
		q.add(123, 187);
		q.add(456, 42);
		q.add(789, 411);
                q.get();
		expect(q.getEventTime(456)).toBeUndefined();
		expect(q.getEventTime(123)).toEqual(187 - 42);
		expect(q.getEventTime(789)).toEqual(411 - 42);
	});

	it("should remove events", function() {
		const q = new ROT.EventQueue();
		q.add(123, 0);
		q.add(456, 0);
		const result = q.remove(123);
		expect(result).toEqual(true);
		expect(q.get()).toEqual(456);
	});

	it("should report the earliest due time for duplicate events", function() {
		const q = new ROT.EventQueue<string>();
		q.add("duplicate", 10);
		q.add("duplicate", 5);
		q.add("other", 1);

		expect(q.getEventTime("duplicate")).toBe(5);
		expect(q.get()).toBe("other");
		expect(q.getEventTime("duplicate")).toBe(4);
		expect(q.get()).toBe("duplicate");
	});

	it("should remove the earliest-inserted matching duplicate event", function() {
		const q = new ROT.EventQueue<string>();
		q.add("duplicate", 10);
		q.add("other", 4);
		q.add("duplicate", 6);
		q.add("first", 2);

		expect(q.getEventTime("duplicate")).toBe(6);
		expect(q.remove("duplicate")).toBe(true);
		expect(q.getEventTime("duplicate")).toBe(6);
		expect(q.get()).toBe("first");
		expect(q.get()).toBe("other");
		expect(q.get()).toBe("duplicate");
	});

	it("should survive removal of non-existent events", function() {
		const q = new ROT.EventQueue();
		q.add(0, 0);
		const result = q.remove(1);
		expect(result).toEqual(false);
		expect(q.get()).toEqual(0);
	});

	it("should return events sorted", function() {
		const q = new ROT.EventQueue<number>();
		q.add(456, 10);
		q.add(123, 5);
		q.add(789, 15);
		expect(q.get()).toEqual(123);
		expect(q.get()).toEqual(456);
		expect(q.get()).toEqual(789);
	});

	it("should compute elapsed time", function() {
		const q = new ROT.EventQueue();
		q.add(456, 10);
		q.add(123, 5);
		q.add(789, 15);
		q.get();
		q.get();
		q.get();
		expect(q.getTime()).toEqual(15);
	});

	it("should not shift the whole heap when advancing time", function() {
		const q = new ROT.EventQueue<number>();
		q.add(456, 10);
		q.add(123, 5);

		const map = vi.spyOn(Array.prototype, "map");
		let event: number | null = null;
		let mapCalls = 0;
		try {
			event = q.get();
			mapCalls = map.mock.calls.length;
		} finally {
			map.mockRestore();
		}
		expect(event).toEqual(123);
		expect(mapCalls).toBe(0);
	});

	it("should maintain event order for same timestamps", function() {
		const q = new ROT.EventQueue();
		q.add(456, 10);
		q.add(123, 10);
		q.add(789, 10);
		expect(q.get()).toEqual(456);
		expect(q.get()).toEqual(123);
		expect(q.get()).toEqual(789);
		expect(q.getTime()).toEqual(10);
	});

	it("should advance time only for positive event delays", function() {
		const q = new ROT.EventQueue<string>();
		q.add("negative", -5);
		q.add("zero", 0);
		q.add("positive", 3);

		expect(q.get()).toBe("negative");
		expect(q.getTime()).toBe(0);
		expect(q.get()).toBe("zero");
		expect(q.getTime()).toBe(0);
		expect(q.get()).toBe("positive");
		expect(q.getTime()).toBe(3);
	});
});
