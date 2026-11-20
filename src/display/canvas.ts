import { Backend } from "@/src/display/backend.js";
import { DisplayOptions } from "@/src/display/types.js";

export abstract class Canvas extends Backend {
	ctx: CanvasRenderingContext2D;
	private animationFrame: number | null = null;

	constructor() {
		super();
		this.ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
	}

	schedule(cb: () => void) { this.animationFrame = requestAnimationFrame(cb); }
	cancelSchedule() {
		if (this.animationFrame === null) { return; }
		cancelAnimationFrame(this.animationFrame);
		this.animationFrame = null;
	}
	getContainer() { return this.ctx.canvas; }

	setOptions(opts: DisplayOptions) {
		super.setOptions(opts);

		const style = (opts.fontStyle ? `${opts.fontStyle} ` : ``);
		const font = `${style} ${opts.fontSize}px ${opts.fontFamily}`;
		this.ctx.font = font;
		this.updateSize();

		this.ctx.font = font;
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
	}

	clear() {
		const oldComposite = this.ctx.globalCompositeOperation;
		this.ctx.globalCompositeOperation = "copy"
		this.ctx.fillStyle = this.options.bg;
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.globalCompositeOperation = oldComposite;
	}

	eventToPosition(x: number, y: number): [number, number] {
		const canvas = this.ctx.canvas;
		const rect = canvas.getBoundingClientRect();
		x -= rect.left;
		y -= rect.top;
		
		x *= canvas.width / rect.width;
		y *= canvas.height / rect.height;

		if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) { return [-1, -1]; }

		return this.normalizedEventToPosition(x, y);
	}

	abstract normalizedEventToPosition(x: number, y: number): [number, number];
	abstract updateSize(): void;
}
