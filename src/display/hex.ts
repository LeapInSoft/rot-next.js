import { Canvas } from "@/src/display/canvas.js";
import { DisplayData } from "@/src/display/types.js";
import { mod } from "@/src/util.js";

/**
 * @class Hexagonal backend
 * @private
 */
export class Hex extends Canvas {
	spacingX: number;
	spacingY: number;
	hexSize: number;

	constructor() {
		super();
		this.spacingX = 0;
		this.spacingY = 0;
		this.hexSize = 0;
	}

	draw(data: DisplayData, clearBefore: boolean) {
		const [x, y, ch, fg, bg] = data;

		const px = [
			(x+1) * this.spacingX,
			y * this.spacingY + this.hexSize
		];
		if (this.options.transpose) { px.reverse(); }

		if (clearBefore) {
			this.ctx.fillStyle = bg;
			this.fill(px[0], px[1]);
		}

		if (!ch) { return; }

		this.ctx.fillStyle = fg;

		const chars = ([] as string[]).concat(ch);
		for (const character of chars) {
			this.ctx.fillText(character, px[0], Math.ceil(px[1]));
		}
	}

	computeSize(availWidth: number, availHeight: number): [number, number] {
		if (this.options.transpose) {
			availWidth += availHeight;
			availHeight = availWidth - availHeight;
			availWidth -= availHeight;
		}

		const width = Math.floor(availWidth / this.spacingX) - 1;
		const height = Math.floor((availHeight - 2*this.hexSize) / this.spacingY + 1);
		return [width, height];
	}

	computeFontSize(availWidth: number, availHeight: number) {
		if (this.options.transpose) {
			availWidth += availHeight;
			availHeight = availWidth - availHeight;
			availWidth -= availHeight;
		}

		const hexSizeWidth = 2*availWidth / ((this.options.width+1) * Math.sqrt(3)) - 1;
		const hexSizeHeight = availHeight / (2 + 1.5*(this.options.height-1));
		let hexSize = Math.min(hexSizeWidth, hexSizeHeight);

		// compute char ratio
		const oldFont = this.ctx.font;
		this.ctx.font = "100px " + this.options.fontFamily;
		const width = Math.ceil(this.ctx.measureText("W").width);
		this.ctx.font = oldFont;
		const ratio = width / 100;

		hexSize = Math.floor(hexSize)+1; // closest larger hexSize

		// FIXME char size computation does not respect transposed hexes
		const fontSize = 2*hexSize / (this.options.spacing * (1 + ratio / Math.sqrt(3)));

		// closest smaller fontSize
		return Math.ceil(fontSize)-1;
	}

	normalizedEventToPosition(x: number, y: number): [number, number] {
		let nodeSize;
		if (this.options.transpose) {
			x += y;
			y = x-y;
			x -= y;
			nodeSize = this.ctx.canvas.width;
		} else {
			nodeSize = this.ctx.canvas.height;
		}
		const size = nodeSize / this.options.height;
		y = Math.floor(y/size);

		if (mod(y, 2)) { /* odd row */
			x -= this.spacingX;
			x = 1 + 2*Math.floor(x/(2*this.spacingX));
		} else {
			x = 2*Math.floor(x/(2*this.spacingX));
		}

		return [x, y];
	}

	/**
	 * Arguments are pixel values. If "transposed" mode is enabled, then these two are already swapped.
	 */
	fill(cx: number, cy: number) {
		const a = this.hexSize;
		const b = this.options.border;
		const ctx = this.ctx;

		ctx.beginPath();

		if (this.options.transpose) {
			ctx.moveTo(cx-a+b,		cy);
			ctx.lineTo(cx-a/2+b,	cy+this.spacingX-b);
			ctx.lineTo(cx+a/2-b,	cy+this.spacingX-b);
			ctx.lineTo(cx+a-b,		cy);
			ctx.lineTo(cx+a/2-b,	cy-this.spacingX+b);
			ctx.lineTo(cx-a/2+b,	cy-this.spacingX+b);
			ctx.lineTo(cx-a+b,		cy);
		} else {
			ctx.moveTo(cx,					cy-a+b);
			ctx.lineTo(cx+this.spacingX-b,	cy-a/2+b);
			ctx.lineTo(cx+this.spacingX-b,	cy+a/2-b);
			ctx.lineTo(cx,					cy+a-b);
			ctx.lineTo(cx-this.spacingX+b,	cy+a/2-b);
			ctx.lineTo(cx-this.spacingX+b,	cy-a/2+b);
			ctx.lineTo(cx,					cy-a+b);
		}
		ctx.fill();
	}

	updateSize() {
		const opts = this.options;
		const charWidth = Math.ceil(this.ctx.measureText("W").width);
		this.hexSize = Math.floor(opts.spacing * (opts.fontSize + charWidth/Math.sqrt(3)) / 2);
		this.spacingX = this.hexSize * Math.sqrt(3) / 2;
		this.spacingY = this.hexSize * 1.5;

		let xprop: "width" | "height";
		let yprop: "width" | "height";
		if (opts.transpose) {
			xprop = "height";
			yprop = "width";
		} else {
			xprop = "width";
			yprop = "height";
		}
		this.ctx.canvas[xprop] = Math.ceil( (opts.width + 1) * this.spacingX );
		this.ctx.canvas[yprop] = Math.ceil( (opts.height - 1) * this.spacingY + 2*this.hexSize );

	}
}
