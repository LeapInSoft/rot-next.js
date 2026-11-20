import * as ROT from "@/src";
import { describe, expect, it } from "vitest";

describe("StringGenerator", function() {
	it("should generate an empty string after clearing learned data", function() {
		const generator = new ROT.StringGenerator({});
		generator.observe("abc");
		generator.clear();

		expect(generator.generate()).toEqual("");
	});

	it("should generate an empty string after clearing when prior is zero", function() {
		const generator = new ROT.StringGenerator({ prior: 0 });
		generator.observe("abc");
		generator.clear();

		expect(generator.generate()).toEqual("");
	});
});
