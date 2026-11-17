import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";

const plugins = [
	babel({
		babelHelpers: "bundled",
		extensions: [".js"],
		presets: [["@babel/preset-env", { targets: { ie: "10" }, loose: true }]]
	})
];

export default {
	input: "lib/index.js",
	output: [
		{ file: "dist/rot.js", format: "umd", name: "ROT" },
		{ file: "dist/rot.min.js", format: "umd", name: "ROT", plugins: [terser()] }
	],
	plugins
};
