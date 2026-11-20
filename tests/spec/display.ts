import * as ROT from "@/src";
import { createCanvas } from "@napi-rs/canvas";
import { describe, expect, it, vi } from "vitest";
import { Tile } from "@/src/display/tile.js";
import { TileGL } from "@/src/display/tile_gl.js";
import { Display as NamedDisplay } from "@/src/display/display.js";
import type { DisplayOptions } from "@/src/display/types.js";

describe("Display", function() {
	describe("public API", function() {
		it("should export the Display class by name", function() {
			expect(NamedDisplay).toBe(ROT.Display);
		});

		it("should cancel a pending animation frame when destroyed", function() {
			let pendingCallback: FrameRequestCallback | undefined;
			const requestFrame = vi.fn((callback: FrameRequestCallback) => {
				pendingCallback = callback;
				return 17;
			});
			const cancelFrame = vi.fn();
			vi.stubGlobal("requestAnimationFrame", requestFrame);
			vi.stubGlobal("cancelAnimationFrame", cancelFrame);

			try {
				const display = new ROT.Display();
				const destroy = Reflect.get(display, "destroy");
				expect(destroy).toBeTypeOf("function");
				if (typeof destroy !== "function") { return; }

				destroy.call(display);
				pendingCallback?.(0);

				expect(cancelFrame).toHaveBeenCalledWith(17);
				expect(requestFrame).toHaveBeenCalledTimes(1);
			} finally {
				vi.unstubAllGlobals();
			}
		});

		it("should cancel a pending timeout when destroyed", function() {
			let pendingCallback: (() => void) | undefined;
			const requestTimeout = vi.fn((callback: () => void) => {
				pendingCallback = callback;
				return 17;
			});
			const cancelTimeout = vi.fn();
			vi.stubGlobal("setTimeout", requestTimeout);
			vi.stubGlobal("clearTimeout", cancelTimeout);

			try {
				const display = new ROT.Display({layout:"term"});
				const destroy = Reflect.get(display, "destroy");
				expect(destroy).toBeTypeOf("function");
				if (typeof destroy !== "function") { return; }

				destroy.call(display);
				pendingCallback?.();

				expect(cancelTimeout).toHaveBeenCalledWith(17);
				expect(requestTimeout).toHaveBeenCalledTimes(1);
			} finally {
				vi.unstubAllGlobals();
			}
		});

		it("should use the exported default dimensions", function() {
			const display = new ROT.Display();

			expect(display.getOptions().width).toBe(ROT.DEFAULT_WIDTH);
			expect(display.getOptions().height).toBe(ROT.DEFAULT_HEIGHT);
		});

		it("should update layout options", function() {
			const display = new ROT.Display({layout:"rect"});
			display.setOptions({layout:"hex"});

			expect(display.getOptions().layout).toBe("hex");
		});

		it("should preserve defaults and unrelated options after partial updates", function() {
			const display = new ROT.Display({width:12, fg:"#123456"});
			const options = display.getOptions();

			display.setOptions({height:7});

			expect(display.getOptions()).toEqual({
				...options,
				height:7
			});
			expect(display.getOptions().width).toBe(12);
			expect(display.getOptions().fg).toBe("#123456");
			expect(display.getOptions().layout).toBe("rect");
		});

		it("should switch backends while preserving full display options", function() {
			const display = new ROT.Display({width:4, height:3, layout:"rect", fontSize:18});

			display.setOptions({layout:"tile", tileWidth:8, tileHeight:9});

			const options = display.getOptions();
			expect(options.layout).toBe("tile");
			expect(options.width).toBe(4);
			expect(options.height).toBe(3);
			expect(options.fontSize).toBe(18);
			expect(options.tileWidth).toBe(8);
			expect(options.tileHeight).toBe(9);
		});

		it("should update tile dimensions after construction", function() {
			const display = new ROT.Display({
				width:2,
				height:2,
				layout:"tile",
				tileWidth:10,
				tileHeight:20,
			});
			display.setOptions({tileWidth:30, tileHeight:40});
			const canvas = display.getContainer();

			expect(canvas).toBeInstanceOf(HTMLCanvasElement);
			expect((canvas as HTMLCanvasElement).width).toBe(60);
			expect((canvas as HTMLCanvasElement).height).toBe(80);
		});

		it("should update the tile set after construction", function() {
			const initialTileSet = createCanvas(1, 1);
			const nextTileSet = createCanvas(1, 1);
			const display = new ROT.Display({
				width:1,
				height:1,
				layout:"tile",
				tileWidth:1,
				tileHeight:1,
				tileMap:{a:[0, 0]},
				tileSet:initialTileSet as unknown as HTMLCanvasElement,
			});
			display.setOptions({tileSet:nextTileSet as unknown as HTMLCanvasElement});
			const backend = (display as unknown as {backend:Tile}).backend;

			expect(backend.options.tileSet).toBe(nextTileSet);
		});
	});

	const canvasFor = function(display: InstanceType<typeof ROT.Display>) {
		const canvas = display.getContainer();
		if (!(canvas instanceof HTMLCanvasElement)) { throw new Error("Display did not create a canvas"); }
		return canvas;
	}

	const eventToPosition = function(display: InstanceType<typeof ROT.Display>, event: {clientX:number; clientY:number} | {touches:{clientX:number; clientY:number}[]; changedTouches?:{clientX:number; clientY:number}[]}) {
		return display.eventToPosition(event as MouseEvent | TouchEvent);
	}

	describe("eventToPosition", function() {
		const appendToBody = function(display: InstanceType<typeof ROT.Display>) {
			const c = canvasFor(display);
			c.style.position = "absolute";
			c.style.left = "100px";
			c.style.top = "100px";
			c.style.visibility = "hidden";
			Object.defineProperties(c, {
				offsetWidth: { configurable: true, get: function() { return parseFloat(c.style.width) || c.width; } },
				offsetHeight: { configurable: true, get: function() { return parseFloat(c.style.height) || c.height; } }
			});
			c.getBoundingClientRect = function() {
				const scale = Number((c.style.transform.match(/^scale\(([^)]+)\)$/) || [])[1]) || 1;
				const width = c.offsetWidth * scale;
				const height = c.offsetHeight * scale;
				return new DOMRect(parseFloat(c.style.left) || 0, parseFloat(c.style.top) || 0, width, height);
			};
			document.body.appendChild(c);
			document.body.scrollLeft = 0;
			document.body.scrollTop = 0;
			document.documentElement.scrollLeft = 0;
			document.documentElement.scrollTop = 0;
		}

		const unlink = function(display: InstanceType<typeof ROT.Display>) {
			const c = canvasFor(display);
			c.parentNode.removeChild(c);
		}

		describe("rectangular layout", function() {
			it("should normalize an empty touch event to an outside position", function() {
				const d = new ROT.Display({width:10, height:10});
				appendToBody(d);

				const pos = eventToPosition(d, {touches:[], changedTouches:[]});

				expect(pos).toEqual([-1, -1]);
				unlink(d);
			});

			it("should compute inside canvas", function() {
				const d = new ROT.Display({width:10, height:10});
				appendToBody(d);
				const node = canvasFor(d);
				const cellW = node.offsetWidth/10;
				const cellH = node.offsetHeight/10;
				const e = {clientX: 100 + 1.5*cellW, clientY: 100 + 2.5*cellH};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(1);
				expect(pos[1]).toBe(2);
				unlink(d);
			});
			it("should work with touch events as well", function() {
				const d = new ROT.Display({width:10, height:10});
				appendToBody(d);
				const node = canvasFor(d);
				const cellW = node.offsetWidth/10;
				const cellH = node.offsetHeight/10;
				const touch1 = {clientX: 100 + 1.5*cellW, clientY: 100 + 2.5*cellH};
				const touch2 = {clientX: 0, clientY: 0};
				const e = {touches:[touch1, touch2]};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(1);
				expect(pos[1]).toBe(2);
				unlink(d);
			});
			it("should use the ended touch for touchend events", function() {
				const d = new ROT.Display({width:10, height:10});
				appendToBody(d);
				const node = canvasFor(d);
				const cellW = node.offsetWidth/10;
				const cellH = node.offsetHeight/10;
				const endedTouch = {clientX: 100 + 1.5*cellW, clientY: 100 + 2.5*cellH};
				const e: {touches:{clientX:number; clientY:number}[]; changedTouches:{clientX:number; clientY:number}[]} = {
					touches:[],
					changedTouches:[endedTouch]
				};
				const pos = eventToPosition(d, e);

				expect(pos).toEqual([1, 2]);
				unlink(d);
			});
			it("should fail outside of canvas (left top)", function() {
				const d = new ROT.Display({width:10, height:10});
				appendToBody(d);
				const e = {clientX: 10, clientY: 10};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(-1);
				expect(pos[1]).toBe(-1);
				unlink(d);
			});
			it("should fail outside of canvas (right bottom)", function() {
				const d = new ROT.Display({width:10, height:10});
				appendToBody(d);
				const e = {clientX: 1000, clientY: 1000};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(-1);
				expect(pos[1]).toBe(-1);
				unlink(d);
			});
			it("should work with css width/height scaling", function() {
				const d = new ROT.Display({width:10, height:10});
				appendToBody(d);
				const node = canvasFor(d);
				const scale = 2;
				node.style.width = (node.width*scale)+"px";
				node.style.height = (node.height*scale)+"px";

				const cellW = node.offsetWidth/10;
				const cellH = node.offsetHeight/10;

				const e = {clientX: 100 + node.width*scale - 1, clientY: 100 + node.height*scale - 1};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(9);
				expect(pos[1]).toBe(9);
				unlink(d);
			});

			it("should work with css transform scaling", function() {
				const d = new ROT.Display({width:10, height:10});
				appendToBody(d);
				const node = canvasFor(d);
				const scale = 2;
				node.style.transform = "scale(" + scale + ")";
				node.style.transformOrigin = "0 0";

				const cellW = node.offsetWidth/10;
				const cellH = node.offsetHeight/10;

				const e = {clientX: 100 + node.width*scale - 1, clientY: 100 + node.height*scale - 1};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(9);
				expect(pos[1]).toBe(9);
				unlink(d);
			});
		});

		describe("hex layout", function() {
			it("should compute inside canvas - odd row", function() {
				const d = new ROT.Display({width:10, height:10, layout:"hex"});
				appendToBody(d);
				const node = canvasFor(d);
				const cellH = node.offsetHeight/10;
				const cellW = node.offsetWidth/5.5;
				const e = {clientX: 100 + 1.5*cellW, clientY: 100 + 2.5*cellH};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(2);
				expect(pos[1]).toBe(2);
				unlink(d);
			});
			it("should compute inside canvas - even row", function() {
				const d = new ROT.Display({width:10, height:10, layout:"hex"});
				appendToBody(d);
				const node = canvasFor(d);
				const cellH = node.offsetHeight/10;
				const cellW = node.offsetWidth/5.5;
				const e = {clientX: 100 + 2*cellW, clientY: 100 + 1.5*cellH};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(3);
				expect(pos[1]).toBe(1);
				unlink(d);
			});
		});

		describe("hex layout (transposed)", function() {
			it("should compute inside canvas - odd column", function() {
				const d = new ROT.Display({width:10, height:10, layout:"hex", transpose:true});
				appendToBody(d);
				const node = canvasFor(d);
				const cellH = node.offsetHeight/5.5;
				const cellW = node.offsetWidth/10;
				const e = {clientX: 100 + 2.5*cellW, clientY: 100 + 1.5*cellH};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(2);
				expect(pos[1]).toBe(2);
				unlink(d);
			});
			it("should compute inside canvas - even column", function() {
				const d = new ROT.Display({width:10, height:10, layout:"hex", transpose:true});
				appendToBody(d);
				const node = canvasFor(d);
				const cellH = node.offsetHeight/5.5;
				const cellW = node.offsetWidth/10;
				const e = {clientX: 100 + 1.5*cellW, clientY: 100 + 2*cellH};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(3);
				expect(pos[1]).toBe(1);
				unlink(d);
			});
			it("should compute inside canvas - issue #94", function() {
				const d = new ROT.Display({width:10, height:4, layout:"hex", spacing: 2.5, border: 1, transpose:true});
				appendToBody(d);
				const node = canvasFor(d);
				const cellW = node.offsetWidth/4;
				const cellH = node.offsetHeight/5.5; // 63 89
				const e = {clientX: 100 + 3.5*cellW, clientY: 100 + 2*cellH};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(3);
				expect(pos[1]).toBe(3);
				unlink(d);
			});
		});
		describe("tile layout", function() {
			it("should compute inside canvas", function() {
				const d = new ROT.Display({width:64, height:64, layout:"tile", tileWidth:32, tileHeight:32});
				appendToBody(d);
				const node = canvasFor(d);
				const e = {clientX: 100+10, clientY: 100+40};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(0);
				expect(pos[1]).toBe(1);
				unlink(d);
			});
			it("should fail outside of canvas (left top)", function() {
				const d = new ROT.Display({width:64, height:64, layout:"tile", tileWidth:32, tileHeight:32});
				appendToBody(d);
				const e = {clientX: 10, clientY: 10};
				const pos = eventToPosition(d, e);
				expect(pos[0]).toBe(-1);
				expect(pos[1]).toBe(-1);
				unlink(d);
			});
		});

	});

	describe("drawText", function() {
		it("should provide default maxWidth", function() {
			const d = new ROT.Display({width:10, height:10});
			const lines = d.drawText(7, 0, "aaaaaa");
			expect(lines).toBe(2);
		});

		it("should not draw text when x is outside the display", function() {
			const d = new ROT.Display({width:10, height:10});
			const lines = d.drawText(11, 0, "text");
			expect(lines).toBe(0);
		});

		it("should not draw text when x is at the display width", function() {
			const d = new ROT.Display({width:10, height:10});
			const lines = d.drawText(10, 0, "text");
			expect(lines).toBe(0);
		});
	});

	describe("tile colorization", function() {
		it("should reuse cell colors for every character in the canvas tile backend", function() {
			const render = function(chars: string[]) {
				const tileSet = createCanvas(1, 1);
				const tileContext = tileSet.getContext("2d");
				const image = tileContext.createImageData(1, 1);
				image.data.set([255, 255, 255, 128]);
				tileContext.putImageData(image, 0, 0);

				const display = new ROT.Display({
					width:1,
					height:1,
					layout:"tile",
					tileWidth:1,
					tileHeight:1,
					tileMap:{a:[0, 0], b:[0, 0]},
					tileSet:tileSet as unknown as HTMLCanvasElement,
					tileColorize:true
				});
				const backend = new Tile();
				backend.setOptions(display.getOptions());
				vi.spyOn(backend.ctx, "drawImage").mockImplementation(() => {});
				backend.draw([0, 0, chars, "#ff0000", "#0000ff"], true);
				const context = backend.colorCanvas.getContext("2d") as CanvasRenderingContext2D;
				return Array.from(context.getImageData(0, 0, 1, 1).data);
			}

			expect(render(["a", "b"])).toEqual(render(["a"]));
		});

		it("should reuse cell colors for every character in the WebGL tile backend", function() {
			const backend = Object.create(TileGL.prototype) as TileGL;
			const gl = {
				canvas:{width:1, height:1},
				scissor:vi.fn(),
				clearColor:vi.fn(),
				clear:vi.fn(),
				uniform2fv:vi.fn(),
				uniform1f:vi.fn(),
				uniform4fv:vi.fn(),
				drawArrays:vi.fn(),
				COLOR_BUFFER_BIT:0x4000,
				TRIANGLE_STRIP:5
			} as unknown as WebGLRenderingContext;
			backend.gl = gl;
			backend.options = {
				width:1,
				height:1,
				transpose:false,
				layout:"tile-gl",
				fontSize:15,
				spacing:1,
				border:0,
				forceSquareRatio:false,
				fontFamily:"monospace",
				fontStyle:"",
				fg:"#ccc",
				bg:"#000",
				tileWidth:1,
				tileHeight:1,
				tileMap:{a:[0, 0], b:[0, 0]},
				tileSet:null,
				tileColorize:true
			} satisfies DisplayOptions;
			backend.uniforms = {
				targetPosRel:null,
				tilesetPosAbs:null,
				colorize:null,
				tint:null,
				bg:null
			};

			backend.draw([0, 0, ["a", "b"], "#ff0000", "#0000ff"], false);

			expect(gl.uniform4fv).toHaveBeenNthCalledWith(3, null, [1, 0, 0, 1]);
			expect(gl.uniform4fv).toHaveBeenNthCalledWith(4, null, [0, 0, 1, 1]);
		});
	});

	describe("computeSize", function() {
		describe("rectangular layout", function() {
			const d1 = new ROT.Display({fontSize:18, spacing:1});
			const d2 = new ROT.Display({fontSize:18, spacing:1.2});

			it("should compute integer size for spacing 1", function() {
				const size = d1.computeSize(1/0, 180);
				expect(size[1]).toBe(10);
			});

			it("should compute fractional size for spacing 1", function() {
				const size = d1.computeSize(1/0, 170);
				expect(size[1]).toBe(9);
			});

			it("should compute integer size for spacing >1", function() {
				const size = d2.computeSize(1/0, 220);
				expect(size[1]).toBe(10);
			});

			it("should compute fractional size for spacing >1", function() {
				const size = d2.computeSize(1/0, 210);
				expect(size[1]).toBe(9);
			});
		});

		describe("hex layout", function() {
			const d1 = new ROT.Display({fontSize:18, spacing:1, layout:"hex"});
			const d2 = new ROT.Display({fontSize:18, spacing:1.2, layout:"hex"});

			it("should compute size for spacing 1", function() {
				const size = d1.computeSize(1/0, 96);
				expect(size[1]).toBe(5);
			});

			it("should compute size for spacing >1", function() {
				const size = d2.computeSize(1/0, 96);
				expect(size[1]).toBe(4);
			});
		});

		describe("tile layout", function() {
			const d = new ROT.Display({layout:"tile", tileWidth:32, tileHeight:16});

			it("should compute proper size", function() {
				const size = d.computeSize(200, 300);
				expect(size[0]).toBe(6);
				expect(size[1]).toBe(18);
			});
		});
	});

	describe("computeFontSize", function() {
		describe("rectangular layout", function() {
			const d1 = new ROT.Display({width:100, height:20, spacing:1});
			const d2 = new ROT.Display({width:100, height:20, spacing:1.2});

			it("should compute integer size for spacing 1", function() {
				const size = d1.computeFontSize(1/0, 180);
				expect(size).toBe(9);
			});

			it("should compute fractional size for spacing 1", function() {
				const size = d1.computeFontSize(1/0, 170);
				expect(size).toBe(8);
			});

			it("should compute integer size for spacing >1", function() {
				const size = d2.computeFontSize(1/0, 180);
				expect(size).toBe(7);
			});

			it("should compute fractional size for spacing >1", function() {
				const size = d2.computeFontSize(1/0, 170);
				expect(size).toBe(6);
			});
		});

		describe("hex layout", function() {
			const d1 = new ROT.Display({width:100, height:5, spacing:1, layout:"hex"});
			const d2 = new ROT.Display({width:100, height:5, spacing:1.3, layout:"hex"});

			it("should compute size for spacing 1", function() {
				const size = d1.computeFontSize(1/0, 96);
				expect(size).toBe(19);
			});

			it("should compute size for spacing >1", function() {
				const size = d2.computeFontSize(1/0, 96);
				expect(size).toBe(14);
			});
		});
	});

	describe("computeTileSize", function() {
		describe("tile layout", function() {
			const d = new ROT.Display({layout:"tile", width:6, height:18});

			it("should compute proper tile size", function() {
				const size = d.computeTileSize(200, 300);
				expect(size[0]).toBe(33);
				expect(size[1]).toBe(16);
			});
		});
	});
});
