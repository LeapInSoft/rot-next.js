import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";

const plugins = [
	babel({
		babelHelpers: "bundled",
		extensions: [".js"],
		presets: [["@babel/preset-env", { targets: { ie: "10" }, loose: true }]]
	})
];

export default [
	{
		input: "lib/index.js",
		output: [
			{ file: "dist/rot.cjs", format: "cjs" },
			{ file: "dist/rot.js", format: "umd", name: "ROT" },
			{ file: "dist/rot.min.js", format: "umd", name: "ROT", plugins: [terser()] }
		],
		plugins
	},
	{
		input: "lib/display-entry.js",
		output: { file: "dist/display.cjs", format: "cjs" },
		plugins
	}
];
