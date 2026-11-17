import { createCanvas } from "@napi-rs/canvas";
import * as ROT from "../src/index.ts";

const canvases = new WeakMap();

HTMLCanvasElement.prototype.getContext = function(contextType) {
	if (contextType !== "2d") { return null; }
	if (canvases.has(this)) { return canvases.get(this).context; }

	const element = this;
	const nativeCanvas = createCanvas(element.width, element.height);
	Object.defineProperties(element, {
		width: {
			configurable: true,
			get: () => nativeCanvas.width,
			set: value => { nativeCanvas.width = value; }
		},
		height: {
			configurable: true,
			get: () => nativeCanvas.height,
			set: value => { nativeCanvas.height = value; }
		}
	});

	const context = new Proxy(nativeCanvas.getContext("2d"), {
		get(target, property) {
			if (property === "canvas") { return element; }
			const value = Reflect.get(target, property, target);
			return typeof value === "function" ? value.bind(target) : value;
		},
		set(target, property, value) {
			return Reflect.set(target, property, value, target);
		}
	});
	canvases.set(element, { nativeCanvas, context });
	return context;
};

globalThis.ROT = ROT;
