import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("browser examples", function() {
	beforeEach(function() {
		document.body.replaceChildren();
	});

	it("appends a display container from the native-module entry point", async function() {
		await vi.importActual("../../examples/native-modules/example.js");

		expect(document.body.querySelector("canvas")).not.toBeNull();
	});

	it("appends a display container from the prebuilt-bundle entry point", function() {
		const bundle = readFileSync(resolve("dist/rot.js"), "utf8");
		const example = readFileSync(resolve("examples/dist/example.js"), "utf8");

		window.eval(bundle);
		expect(window.eval("typeof ROT.Display")).toBe("function");
		window.eval(example);

		expect(document.body.querySelector("canvas")).not.toBeNull();
	});

	it("builds and runs the bundled-module entry point", function() {
		const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
		execSync(`${npmCommand} run examples:bundle`, {
			cwd: resolve("."),
			stdio: "pipe"
		});

		const bundle = readFileSync(
			resolve("examples/bundled-modules/dist/example.bundle.js"),
			"utf8"
		);
		window.eval(bundle);

		expect(document.body.querySelector("canvas")).not.toBeNull();
	}, 60_000);
});
