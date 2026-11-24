import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const listFiles = (directory: string): string[] =>
	readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
		const entryPath = join(directory, entry.name);
		return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
	});

const countAliases = (filePath: string): number =>
	(readFileSync(filePath, "utf8").match(/@\/src\//g) ?? []).length;

describe("build artifacts", () => {
	it("resolves the @/src alias in every emitted lib module", () => {
		const leakingFiles = listFiles(resolve("lib"))
			.filter(filePath => filePath.endsWith(".js") || filePath.endsWith(".d.ts"))
			.filter(filePath => countAliases(filePath) > 0);

		expect(leakingFiles).toStrictEqual([]);
	});

	it("bundles the library without unresolved external imports", () => {
		for (const bundle of ["dist/rot.js", "dist/rot.min.js"]) {
			expect(countAliases(resolve(bundle))).toBe(0);
		}
	});
});
