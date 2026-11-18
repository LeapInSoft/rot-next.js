import tsParser from "@typescript-eslint/parser";

export default [
	{
		files: ["src/**/*.ts", "tests/**/*.ts"],
		languageOptions: {
			parser: tsParser
		},
		rules: {
			"no-var": "error",
			"prefer-const": "error"
		}
	}
];
