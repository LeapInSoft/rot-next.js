import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const projectRoot = resolve(process.cwd());

export default defineConfig({
	resolve: {
		alias: {
			"@": projectRoot
		}
	},
	test: {
		environment: "happy-dom",
		include: [
			"tests/core/**/*.ts",
			"tests/exemples/**.ts",
			"tests/addons/**.ts"
		],
		setupFiles: ["./tests/setup.ts"],
		globals: true
	}
});
