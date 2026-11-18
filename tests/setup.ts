import { createCanvas, type Canvas as NativeCanvas, type SKRSContext2D } from "@napi-rs/canvas";

const canvases = new WeakMap<HTMLCanvasElement, { nativeCanvas: NativeCanvas; context: SKRSContext2D }>();

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
	value: function(this: HTMLCanvasElement, contextType: string) {
	if (contextType !== "2d") { return null; }
	const existing = canvases.get(this);
	if (existing) { return existing.context; }

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
	}
});
