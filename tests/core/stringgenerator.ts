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

	it("should reproduce observed character sequences when prior weights are disabled", function() {
		const generator = new ROT.StringGenerator({ prior: 0 });
		generator.observe("goblin");

		expect(generator.generate()).toBe("goblin");
	});

	it("should split and join learned words in word mode", function() {
		const generator = new ROT.StringGenerator({ words: true, prior: 0 });
		generator.observe("old stone bridge");

		expect(generator.generate()).toBe("old stone bridge");
	});

	it("should add repeated observations to its learned event statistics", function() {
		const generator = new ROT.StringGenerator({ prior: 0 });
		generator.observe("ab");
		generator.observe("ab");

		expect(generator.getStats()).toBe("distinct samples: 2, dictionary size (contexts): 9, dictionary size (events): 9");
	});
});
