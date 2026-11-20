import { MinHeap } from "@/src/min_heap";
import { describe, expect, it } from "vitest";

describe("MinHeap", function() {
	it("should throw when popping an empty heap", function() {
		const heap = new MinHeap<number>();

		expect(() => heap.pop()).toThrow("no element to pop");
	});

	it("should maintain logical keys across offsets", function() {
		const heap = new MinHeap<string>();
		heap.push("later", 10);
		heap.push("first", 5);

		heap.shift(-2);

		expect(heap.find("first")?.key).toBe(3);
		expect(heap.pop()).toMatchObject({ value: "first", key: 3 });
		expect(heap.pop()).toMatchObject({ value: "later", key: 8 });
	});

	it("should use strict equality when finding and removing values", function() {
		const heap = new MinHeap<number | string>();
		heap.push(1, 0);

		expect(heap.find("1")).toBeNull();
		expect(heap.remove("1")).toBe(false);
		expect(heap.pop().value).toBe(1);
	});

	it("should remove the first matching duplicate value", function() {
		const heap = new MinHeap<string>();
		heap.push("duplicate", 2);
		heap.push("duplicate", 3);

		expect(heap.find("duplicate")?.key).toBe(2);
		expect(heap.remove("duplicate")).toBe(true);
		expect(heap.find("duplicate")?.key).toBe(3);
	});

	it("should preserve heap order when removing a node whose replacement belongs higher", function() {
		const heap = new MinHeap<string>();
		heap.push("root", 0);
		heap.push("parent", 5);
		heap.push("other branch", 1);
		heap.push("removed", 6);
		heap.push("parent child", 7);
		heap.push("other child", 4);
		heap.push("replacement", 2);

		expect(heap.remove("removed")).toBe(true);

		const values = [];
		while (heap.len()) { values.push(heap.pop().value); }
		expect(values).toEqual(["root", "other branch", "replacement", "other child", "parent", "parent child"]);
	});
});
