import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Node example", function() {
	it("exports Display through the CommonJS package entry point", function() {
		const child = spawn(process.execPath, [
			"-e",
			'const ROT = require(process.cwd()); if (typeof ROT.Display !== "function") process.exit(1);'
		], {
			cwd: resolve("."),
			stdio: "ignore"
		});

		return new Promise<void>((resolveTest, reject) => {
			child.on("error", reject);
			child.on("close", code => {
				expect(code).toBe(0);
				resolveTest();
			});
		});
	});

	it("renders without initialization or draw errors", async function() {
		await new Promise<void>((resolveTest, reject) => {
			const child = spawn(process.execPath, [resolve("examples/node/example.js")], {
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
