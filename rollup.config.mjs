import terser from "@rollup/plugin-terser";


export default [
	{
		input: "lib/index.js",
		output: [
			{ file: "dist/rot.cjs", format: "cjs" },
			{ file: "dist/rot.js", format: "umd", name: "ROT" },
			{ file: "dist/rot.min.js", format: "umd", name: "ROT", plugins: [terser()] }
		]
	},
	{
		input: "lib/display-entry.js",
		output: { file: "dist/display.cjs", format: "cjs" }
	}
];
