import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Node example", function() {
	it("keeps CommonJS and ESM package entry points working without module warnings", function() {
		const child = spawn(process.execPath, [
			"--trace-warnings",
			"-e",
			[
				"const ROT = require('rot-next.js');",
				"if (typeof ROT.Display !== 'function' || typeof require('rot-next.js/display').Display !== 'function') process.exit(1);",
				"try { require('rot-next.js/src/index.js'); process.exit(1); } catch (error) {",
				"if (error.code !== 'ERR_PACKAGE_PATH_NOT_EXPORTED') process.exit(1);",
				"}",
				"Promise.all([import('rot-next.js'), import('rot-next.js/display'), import('rot-next.js/addons/game/game.js')]).then(([ROT, display, game]) => {",
				"if (typeof ROT.Display !== 'function' || typeof display.Display !== 'function' || typeof game.createInitialGameState !== 'function') process.exit(1);",
				"}).catch(() => process.exit(1));"
			].join(" ")
		], {
			cwd: resolve("."),
			stdio: ["ignore", "ignore", "pipe"]
		});
		let stderr = "";
		child.stderr.setEncoding("utf8");
		child.stderr.on("data", data => {
			stderr += data;
		});

		return new Promise<void>((resolveTest, reject) => {
			child.on("error", reject);
			child.on("close", code => {
				expect(code).toBe(0);
				expect(stderr).not.toContain("MODULE_TYPELESS_PACKAGE_JSON");
				resolveTest();
			});
		});
	});

	it("renders without initialization or draw errors", async function() {
		await new Promise<void>((resolveTest, reject) => {
			const child = spawn(process.execPath, [resolve("examples/node/example.cjs")], {
				cwd: resolve("."),
			});
			let stdout = "";
			let stderr = "";

			child.stdout.setEncoding("utf8");
			child.stderr.setEncoding("utf8");
			child.stdout.on("data", data => {
				stdout += data;
			});
			child.stderr.on("data", data => {
				stderr += data;
			});

			const killTimer = setTimeout(() => {
				child.kill();
			}, 500);
			const timeoutTimer = setTimeout(() => {
				child.kill();
				reject(new Error("Node example did not start within 3 seconds"));
			}, 3000);

			child.on("error", error => {
				clearTimeout(killTimer);
				clearTimeout(timeoutTimer);
				reject(error);
			});
			child.on("close", () => {
				clearTimeout(killTimer);
				clearTimeout(timeoutTimer);

				expect(stderr).toBe("");
				expect(stdout.length).toBeGreaterThan(0);
				resolveTest();
			});
		});
	});
});
