import { MinHeap } from "@/src/MinHeap";
import { describe, expect, it } from "vitest";

describe("MinHeap", function() {
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
