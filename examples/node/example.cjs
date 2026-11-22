#!/usr/bin/env node

const ROT = require("../..");

const displayOptions = {
	width: 11,
	height: 5,
	layout: "term"
};
const display = new ROT.Display(displayOptions);

for (let x = 0; x < displayOptions.width; x++) {
	for (let y = 0; y < displayOptions.height; y++) {
		// side-effect: draw the room into the terminal display.
		const isBorder = x === 0
			|| y === 0
			|| x + 1 === displayOptions.width
			|| y + 1 === displayOptions.height;
		isBorder
			? display.draw(x, y, "#", "gray")
			: display.draw(x, y, ".", "#666");
	}
}

display.draw(
	displayOptions.width >> 1,
	displayOptions.height >> 1,
	"@",
	"goldenrod"
);
