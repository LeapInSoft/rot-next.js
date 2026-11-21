const fs = require("node:fs");
const path = require("node:path");

for (const directory of ["doc", "dist", "lib"]) {
	const target = path.join(__dirname, "..", directory);
	fs.rmSync(target, { recursive: true, force: true });
	fs.mkdirSync(target);
}

fs.rmSync(path.join(__dirname, "..", ".ts.flag"), { force: true });

fs.rmSync(path.join(__dirname, "..", "examples", "basic-addon", "addons"), {
	recursive: true,
	force: true
});
