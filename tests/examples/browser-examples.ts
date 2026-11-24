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

	it("runs the complete basic addon slice and supports player actions", async function() {
		interface BasicAddonScene {
			getState(): {
				readonly player: {readonly hp: number};
				readonly monster: {readonly alive: boolean};
				readonly turn: number;
			};
			readonly messages: {toString(): string};
			act(action: {readonly type: "wait"}): void;
			destroy(): void;
		}
		const {basicAddonScene} = await vi.importActual<{
			readonly basicAddonScene: BasicAddonScene;
		}>("../../examples/basic-addon/example.js");
		const scene = basicAddonScene;

		expect(document.body.querySelector("canvas")).not.toBeNull();
		expect(scene.getState().player.hp).toBeGreaterThan(0);
		expect(scene.getState().monster.alive).toBe(true);

		scene.act({type: "wait"});
		expect(scene.getState().turn).toBe(1);
		expect(scene.messages.toString()).toContain("Ada waits.");
		scene.destroy();
	}, 60_000);

	it("appends a display container from the prebuilt-bundle entry point", function() {
		const bundle = readFileSync(resolve("dist/rot.js"), "utf8");
		const example = readFileSync(resolve("examples/dist/example.js"), "utf8");

		window.eval(bundle);
		expect(window.eval("typeof ROT.Display")).toBe("function");
		window.eval(example);

		expect(document.body.querySelector("canvas")).not.toBeNull();
	});

	it("builds and runs the bundled-module entry point", function() {
		const bundle = readFileSync(
			resolve("examples/bundled-modules/dist/example.bundle.js"),
			"utf8"
		);
		window.eval(bundle);

		expect(document.body.querySelector("canvas")).not.toBeNull();
	}, 60_000);
});
