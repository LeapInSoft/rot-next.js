import { Display } from "../../lib/index.js";

const displayOptions = {
	width: 11,
	height: 5
};
const display = new Display(displayOptions);
document.body.appendChild(display.getContainer());

for (let x = 0; x < displayOptions.width; x++) {
	for (let y = 0; y < displayOptions.height; y++) {
		// side-effect: draw the room into the browser display.
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
