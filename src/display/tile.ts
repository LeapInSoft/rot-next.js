import { Canvas } from "@/src/display/canvas.js";
import type { DisplayData } from "@/src/display/types.js";
import { getCanvasImageSource } from "@/src/display/tile-source.js";

/**
 * @class Tile backend
 * @private
 */
export class Tile extends Canvas {
	colorCanvas: HTMLCanvasElement;

	constructor() {
		super();
		this.colorCanvas = document.createElement("canvas");
	}

	draw(data: DisplayData, clearBefore: boolean) {
		const [x, y, ch, fg, bg] = data;

		const tileWidth = this.options.tileWidth;
		const tileHeight = this.options.tileHeight;

		if (clearBefore) {
			if (this.options.tileColorize) {
				this.ctx.clearRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
			} else {
				this.ctx.fillStyle = bg;
				this.ctx.fillRect(x*tileWidth, y*tileHeight, tileWidth, tileHeight);
			}
		}

		if (!ch) { return; }

		const imageSource = getCanvasImageSource(this.options.tileSet);
		const chars = ([] as string[]).concat(ch);
		const fgs = ([] as string[]).concat(fg);
		const bgs = ([] as string[]).concat(bg);

		for (const [i, character] of chars.entries()) {
			const tile = this.options.tileMap[character];
			if (!tile) { throw new Error(`Char "${character}" not found in tileMap`); }
			
			if (this.options.tileColorize) { // apply colorization
				const canvas = this.colorCanvas;
				const context = canvas.getContext("2d");
				if (!context) { throw new Error("2D canvas context is unavailable"); }
				context.globalCompositeOperation = "source-over";
				context.clearRect(0, 0, tileWidth, tileHeight);

				const fg = fgs[i] || fgs[0];
				const bg = bgs[i] || bgs[0];

				context.drawImage(
					imageSource,
					tile[0], tile[1], tileWidth, tileHeight,
					0, 0, tileWidth, tileHeight
				);

				if (fg !== "transparent") {
					context.fillStyle = fg;
					context.globalCompositeOperation = "source-atop";
					context.fillRect(0, 0, tileWidth, tileHeight);
				}

				if (bg !== "transparent") {
					context.fillStyle = bg;
					context.globalCompositeOperation = "destination-over";
					context.fillRect(0, 0, tileWidth, tileHeight);
				}

				this.ctx.drawImage(canvas, x*tileWidth, y*tileHeight, tileWidth, tileHeight);
			} else { // no colorizing, easy
				this.ctx.drawImage(
					imageSource,
					tile[0], tile[1], tileWidth, tileHeight,
					x*tileWidth, y*tileHeight, tileWidth, tileHeight
				);
			}
		}
	}

	computeSize(availWidth: number, availHeight: number): [number, number] {
		const width = Math.floor(availWidth / this.options.tileWidth);
		const height = Math.floor(availHeight / this.options.tileHeight);
		return [width, height];
	}

	computeFontSize(): number {
		throw new Error("Tile backend does not understand font size");
	}

	normalizedEventToPosition(x:number, y:number): [number, number] {
		return [Math.floor(x/this.options.tileWidth), Math.floor(y/this.options.tileHeight)];
	}

	updateSize() {
		const opts = this.options;
		this.ctx.canvas.width = opts.width * opts.tileWidth;
		this.ctx.canvas.height = opts.height * opts.tileHeight;
		this.colorCanvas.width = opts.tileWidth;
		this.colorCanvas.height = opts.tileHeight;
	}
}
