const { readdirSync, readFileSync, writeFileSync } = require("node:fs");
const path = require("node:path");

const outputDirectory = path.resolve(__dirname, "..", "lib");

const listFiles = (directory) =>
	readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const entryPath = path.join(directory, entry.name);
		return entry.isDirectory() ? listFiles(entryPath) : [entryPath];
	});

const relativeOutputPrefix = (filePath) => {
	const relativeDirectory = path.relative(path.dirname(filePath), outputDirectory) || ".";
	return `${relativeDirectory.split(path.sep).join("/")}/`;
};

listFiles(outputDirectory)
	.filter((filePath) => filePath.endsWith(".js") || filePath.endsWith(".d.ts"))
	.forEach((filePath) => {
		const content = readFileSync(filePath, "utf8");
		const rewrittenContent = content.replace(/@\/src\//g, relativeOutputPrefix(filePath));

		if (content !== rewrittenContent) {
			writeFileSync(filePath, rewrittenContent);
		}
	});
