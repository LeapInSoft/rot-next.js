const { readdir, readFile, writeFile } = require("node:fs/promises");
const { dirname, join, relative, sep } = require("node:path");

const libDirectory = join(process.cwd(), "lib");

async function getJavaScriptFiles(directory) {
	const entries = await readdir(directory, { withFileTypes: true });
	const nestedFiles = await Promise.all(entries.map(async (entry) => {
		const path = join(directory, entry.name);
		return entry.isDirectory()
			? getJavaScriptFiles(path)
			: entry.isFile() && entry.name.endsWith(".js")
				? [path]
				: [];
	}));

	return nestedFiles.flat();
}

(async () => {
	for (const filePath of await getJavaScriptFiles(libDirectory)) {
		const source = await readFile(filePath, "utf8");
		const rewritten = source.replace(/(["'])@\/src\/([^"']+)\1/g, (_match, quote, target) => {
			const targetPath = join(process.cwd(), "lib", target);
			let relativePath = relative(dirname(filePath), targetPath).split(sep).join("/");
			if (!relativePath.startsWith(".")) {
				relativePath = `./${relativePath}`;
			}
			return `${quote}${relativePath}${quote}`;
		});

		await writeFile(filePath, rewritten);
	}
})();
