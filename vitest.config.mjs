import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "happy-dom",
		include: ["tests/spec/**/*.js"],
		setupFiles: ["./tests/setup.js"],
		globals: true
	}
});
