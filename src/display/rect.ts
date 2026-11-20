import { Canvas } from "@/src/display/canvas.js";
import { DisplayOptions, DisplayData } from "@/src/display/types.js";

/**
 * @class Rectangular backend
 * @private
 */
export class Rect extends Canvas {
	spacingX: number;
	spacingY: number;
	canvasCache: {[key:string]: HTMLCanvasElement};
	options!: DisplayOptions;

	static cache = false;

	constructor() {
		super();
		this.spacingX = 0;
		this.spacingY = 0;
		this.canvasCache = {};
	}

	setOptions(options: DisplayOptions) {
		super.setOptions(options);
		this.canvasCache = {};
	}

	draw(data: DisplayData, clearBefore: boolean) {
		if (Rect.cache) {
			this.drawWithCache(data);
		} else {
			this.drawNoCache(data, clearBefore);
		}
	}

	drawWithCache(data: DisplayData) {
		const [x, y, ch, fg, bg] = data;

		const hash = ""+ch+fg+bg;
		let canvas;
		if (hash in this.canvasCache) {
			canvas = this.canvasCache[hash];
		} else {
			const b = this.options.border;
			canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			if (!ctx) { throw new Error("2D canvas context is unavailable"); }
			canvas.width = this.spacingX;
			canvas.height = this.spacingY;
			ctx.fillStyle = bg;
			ctx.fillRect(b, b, canvas.width-b, canvas.height-b);
			
			if (ch) {
				ctx.fillStyle = fg;
				ctx.font = this.ctx.font;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";

				const chars = ([] as string[]).concat(ch);
				for (const character of chars) {
					ctx.fillText(character, this.spacingX/2, Math.ceil(this.spacingY/2));
				}
			}
			this.canvasCache[hash] = canvas;
		}
		
		this.ctx.drawImage(canvas, x*this.spacingX, y*this.spacingY);
	}

	drawNoCache(data: DisplayData, clearBefore: boolean) {
		const [x, y, ch, fg, bg] = data;

		if (clearBefore) { 
			const b = this.options.border;
			this.ctx.fillStyle = bg;
			this.ctx.fillRect(x*this.spacingX + b, y*this.spacingY + b, this.spacingX - b, this.spacingY - b);
		}
		
		if (!ch) { return; }

		this.ctx.fillStyle = fg;

		const chars = ([] as string[]).concat(ch);
		for (const character of chars) {
			this.ctx.fillText(character, (x+0.5) * this.spacingX, Math.ceil((y+0.5) * this.spacingY));
		}
	}

	computeSize(availWidth: number, availHeight: number): [number, number] {
		const width = Math.floor(availWidth / this.spacingX);
		const height = Math.floor(availHeight / this.spacingY);
		return [width, height];
	}

	computeFontSize(availWidth: number, availHeight: number) {
		const boxWidth = Math.floor(availWidth / this.options.width);
		let boxHeight = Math.floor(availHeight / this.options.height);

		/* compute char ratio */
		const oldFont = this.ctx.font;
		this.ctx.font = "100px " + this.options.fontFamily;
		const width = Math.ceil(this.ctx.measureText("W").width);
		this.ctx.font = oldFont;
		const ratio = width / 100;
			
		const widthFraction = ratio * boxHeight / boxWidth;
		if (widthFraction > 1) { /* too wide with current aspect ratio */
			boxHeight = Math.floor(boxHeight / widthFraction);
		}
		return Math.floor(boxHeight / this.options.spacing);
	}

	normalizedEventToPosition(x:number, y:number): [number, number] {
		return [Math.floor(x/this.spacingX), Math.floor(y/this.spacingY)];
	}

	updateSize() {
		const opts = this.options;
		const charWidth = Math.ceil(this.ctx.measureText("W").width);
		this.spacingX = Math.ceil(opts.spacing * charWidth);
		this.spacingY = Math.ceil(opts.spacing * opts.fontSize);

		if (opts.forceSquareRatio) {
			this.spacingX = this.spacingY = Math.max(this.spacingX, this.spacingY);
		}

		this.ctx.canvas.width = opts.width * this.spacingX;
		this.ctx.canvas.height = opts.height * this.spacingY;
	}
}
