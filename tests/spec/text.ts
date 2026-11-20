import * as ROT from "@/src";
import { describe, expect, it } from "vitest";

describe("Text", function() {
	const measure = function(text: string, maxWidth = Infinity) {
		return ROT.Text.measure(text, maxWidth);
	}

	describe("line breaking", function() {
		const A100 = new Array(101).join("A");
		const B100 = new Array(101).join("B");

		it("should not break when not requested", function() {
			const size = measure(A100);
			expect(size.width).toEqual(A100.length);
			expect(size.height).toEqual(1);
		});

		it("should break text with a negative max width", function() {
			const tokens = ROT.Text.tokenize("abc", -1);
			expect(tokens.map(token => token.type === ROT.Text.TYPE_TEXT ? token.value : "\n").join("")).toBe("a\nb\nc");
		});

		it("should break when max length requested", function() {
			const size = measure(A100, 30);
			expect(size.height).toEqual(4);
		});

		it("should break at explicit newlines", function() {
			const size = measure("a\nb\nc");
			expect(size.height).toEqual(3);
		});

		it("should break at explicit newlines AND max length", function() {
			const size = measure(A100 + B100, 30);
			expect(size.height).toEqual(7);

			const sizeWithNewline = measure(A100 + "\n" + B100, 30);
			expect(sizeWithNewline.height).toEqual(8);
		});

		it("should break at space", function() {
			const size = measure(A100 + " " + B100, 30);
			expect(size.height).toEqual(8);
		});

		it("should not break at nbsp", function() {
			const size = measure(A100 + String.fromCharCode(160) + B100, 30);
			expect(size.height).toEqual(7);
		});

		it("should not break when text is short", function() {
			const size = measure("aaa bbb", 7);
			expect(size.width).toEqual(7);
			expect(size.height).toEqual(1);
		});

		it("should adjust resulting width", function() {
			const size = measure("aaa bbb", 6);
			expect(size.width).toEqual(3);
			expect(size.height).toEqual(2);
		});

		it("should adjust resulting width even without breaks", function() {
			const size = measure("aaa ", 6);
			expect(size.width).toEqual(3);
			expect(size.height).toEqual(1);
		});

		it("should remove unnecessary spaces around newlines", function() {
			const size = measure("aaa  \n  bbb");
			expect(size.width).toEqual(3);
			expect(size.height).toEqual(2);
		});

		it("should remove unnecessary spaces at the beginning", function() {
			const size = measure("   aaa    bbb", 3);
			expect(size.width).toEqual(3);
			expect(size.height).toEqual(2);
		});

		it("should remove unnecessary spaces at the end", function() {
			const size = measure("aaa    \nbbb", 3);
			expect(size.width).toEqual(3);
			expect(size.height).toEqual(2);
		});
	});

	describe("color formatting", function() {
		it("should not break with formatting part", function() {
			const size = measure("aaa%c{x}bbb");
			expect(size.height).toEqual(1);
		});

		it("should correctly remove formatting", function() {
			const size = measure("aaa%c{x}bbb");
			expect(size.width).toEqual(6);
		});

		it("should break independently on formatting - forced break", function() {
			const size = measure("aaa%c{x}bbb", 3);
			expect(size.width).toEqual(3);
			expect(size.height).toEqual(2);
		});

		it("should break independently on formatting - forward break", function() {
			const size = measure("aaa%c{x}b bb", 5);
			expect(size.width).toEqual(4);
			expect(size.height).toEqual(2);
		});

		it("should break independently on formatting - backward break", function() {
			const size = measure("aa a%c{x}bbb", 5);
			expect(size.width).toEqual(4);
			expect(size.height).toEqual(2);
		});
	});
});
