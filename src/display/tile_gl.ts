import { Backend } from "@/src/display/backend.js";
import { DisplayOptions, DisplayData } from "@/src/display/types.js";
import * as Color from "@/src/color.js";

/**
 * @class Tile backend
 * @private
 */
export class TileGL extends Backend {
	gl!: WebGLRenderingContext;
	program!: WebGLProgram;
	uniforms: {[key:string]: WebGLUniformLocation | null};
	private texture: WebGLTexture | null = null;
	private tileSet: DisplayOptions["tileSet"] | undefined;
	private tileSetLoadListener: { tileSet: HTMLImageElement; listener: () => void } | null = null;
	private animationFrame: number | null = null;

	static isSupported() {
		return !!document.createElement("canvas").getContext("webgl2", {preserveDrawingBuffer:true});
	}

	constructor() {
		super();
		this.uniforms = {};
		this.gl = this.initWebGL();
	}

	schedule(cb: () => void) { this.animationFrame = requestAnimationFrame(cb); }
	cancelSchedule() {
		if (this.animationFrame === null) { return; }
		cancelAnimationFrame(this.animationFrame);
		this.animationFrame = null;
	}
	getContainer() {
		if (!(this.gl.canvas instanceof HTMLCanvasElement)) { throw new Error("WebGL canvas is unavailable"); }
		return this.gl.canvas;
	}

	setOptions(opts: DisplayOptions) {
		super.setOptions(opts);

		this.updateSize();
		this.setTileSet(opts.tileSet);
	}


	draw(data: DisplayData, clearBefore: boolean) {
		const gl = this.gl;
		const opts = this.options;
		const [x, y, ch, fg, bg] = data;

		const scissorY = gl.canvas.height - (y+1)*opts.tileHeight;
		gl.scissor(x*opts.tileWidth, scissorY, opts.tileWidth, opts.tileHeight);

		if (clearBefore) {
			if (opts.tileColorize) {
				gl.clearColor(0, 0, 0, 0);
			} else {
				gl.clearColor(...parseColor(bg));
			}
			gl.clear(gl.COLOR_BUFFER_BIT);
		}

		if (!ch) { return; }

		const chars = ([] as string[]).concat(ch);
		const bgs = ([] as string[]).concat(bg);
		const fgs = ([] as string[]).concat(fg);

		gl.uniform2fv(this.uniforms["targetPosRel"], [x, y]);

		for (let i=0;i<chars.length;i++) {
			const tile = this.options.tileMap[chars[i]];
			if (!tile) { throw new Error(`Char "${chars[i]}" not found in tileMap`); }

			gl.uniform1f(this.uniforms["colorize"], opts.tileColorize ? 1 : 0);
			gl.uniform2fv(this.uniforms["tilesetPosAbs"], tile);

			if (opts.tileColorize) {
				gl.uniform4fv(this.uniforms["tint"], parseColor(fgs[i] || fgs[0]));
				gl.uniform4fv(this.uniforms["bg"], parseColor(bgs[i] || bgs[0]));
			}

			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		}


	}

	clear() {
		const gl = this.gl;

		gl.clearColor(...parseColor(this.options.bg));
		gl.scissor(0, 0, gl.canvas.width, gl.canvas.height);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	computeSize(availWidth: number, availHeight: number): [number, number] {
		const width = Math.floor(availWidth / this.options.tileWidth);
		const height = Math.floor(availHeight / this.options.tileHeight);
		return [width, height];
	}

	computeFontSize(): number {
		throw new Error("Tile backend does not understand font size");
	}

	eventToPosition(x: number, y: number): [number, number] {
		const canvas = this.gl.canvas;
		if (!(canvas instanceof HTMLCanvasElement)) { throw new Error("WebGL canvas is unavailable"); }
		const rect = canvas.getBoundingClientRect();
		x -= rect.left;
		y -= rect.top;

		x *= canvas.width / rect.width;
		y *= canvas.height / rect.height;

		if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) { return [-1, -1]; }

		return this.normalizedEventToPosition(x, y);
	}

	initWebGL() {
		const gl = document.createElement("canvas").getContext("webgl2", {preserveDrawingBuffer:true});
		if (!gl) { throw new Error("WebGL2 is not supported"); }
		const program = createProgram(gl, VS, FS);
		gl.useProgram(program);
		createQuad(gl);

		UNIFORMS.forEach(name => this.uniforms[name] = gl.getUniformLocation(program, name));
		this.program = program;

		gl.enable(gl.BLEND);
  		gl.blendFuncSeparate(
  			gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA,
  			gl.ONE, gl.ONE_MINUS_SRC_ALPHA
  		);
  		gl.enable(gl.SCISSOR_TEST)
		return gl;
	}

	normalizedEventToPosition(x:number, y:number): [number, number] {
		return [Math.floor(x/this.options.tileWidth), Math.floor(y/this.options.tileHeight)];
	}

	updateSize() {
		const gl = this.gl;

		const opts = this.options;
		const canvasSize = [opts.width * opts.tileWidth, opts.height * opts.tileHeight];
		gl.canvas.width = canvasSize[0];
		gl.canvas.height = canvasSize[1];

		gl.viewport(0, 0, canvasSize[0], canvasSize[1]);
		gl.uniform2fv(this.uniforms["tileSize"], [opts.tileWidth, opts.tileHeight]);
		gl.uniform2fv(this.uniforms["targetSize"], canvasSize);
	}

	setTileSet(tileSet: DisplayOptions["tileSet"]) {
		if (tileSet === this.tileSet) { return; }

		this.removeTileSetLoadListener();
		this.tileSet = tileSet;

		if (!tileSet) {
			this.clearTexture();
			return;
		}

		if ("complete" in tileSet && !tileSet.complete) {
			const image = tileSet;
			if (!("addEventListener" in image) || typeof image.addEventListener !== "function") {
				throw new Error("Pending tile set cannot receive load events");
			}
			const listener = () => {
				if (this.tileSet !== image) { return; }
				this.tileSetLoadListener = null;
				this.updateTexture(image);
			};
			this.tileSetLoadListener = { tileSet: image, listener };
			image.addEventListener("load", listener, { once: true });
			return;
		}

		this.updateTexture(tileSet);
	}

	removeTileSetLoadListener() {
		if (!this.tileSetLoadListener) { return; }
		const { tileSet, listener } = this.tileSetLoadListener;
		tileSet.removeEventListener("load", listener);
		this.tileSetLoadListener = null;
	}

	updateTexture(tileSet: Exclude<DisplayOptions["tileSet"], null>) {
		const texture = createTexture(this.gl, tileSet);
		if (this.texture) { this.gl.deleteTexture(this.texture); }
		this.texture = texture;
	}

	clearTexture() {
		if (!this.texture) { return; }
		this.gl.deleteTexture(this.texture);
		this.texture = null;
	}
}

const UNIFORMS = ["targetPosRel", "tilesetPosAbs", "tileSize", "targetSize", "colorize", "bg", "tint"];

const VS = `
#version 300 es

in vec2 tilePosRel;
out vec2 tilesetPosPx;

uniform vec2 tilesetPosAbs;
uniform vec2 tileSize;
uniform vec2 targetSize;
uniform vec2 targetPosRel;

void main() {
	vec2 targetPosPx = (targetPosRel + tilePosRel) * tileSize;
	vec2 targetPosNdc = ((targetPosPx / targetSize)-0.5)*2.0;
	targetPosNdc.y *= -1.0;

	gl_Position = vec4(targetPosNdc, 0.0, 1.0);
	tilesetPosPx = tilesetPosAbs + tilePosRel * tileSize;
}`.trim()

const FS = `
#version 300 es
precision highp float;

in vec2 tilesetPosPx;
out vec4 fragColor;
uniform sampler2D image;
uniform bool colorize;
uniform vec4 bg;
uniform vec4 tint;

void main() {
	fragColor = vec4(0, 0, 0, 1);

	vec4 texel = texelFetch(image, ivec2(tilesetPosPx), 0);

	if (colorize) {
		texel.rgb = tint.a * tint.rgb + (1.0-tint.a) * texel.rgb;
		fragColor.rgb = texel.a*texel.rgb + (1.0-texel.a)*bg.rgb;
		fragColor.a = texel.a + (1.0-texel.a)*bg.a;
	} else {
		fragColor = texel;
	}
}`.trim()

function createProgram(gl: WebGLRenderingContext, vss: string, fss: string) {
	const vs = gl.createShader(gl.VERTEX_SHADER);
	if (!vs) { throw new Error("Unable to create WebGL vertex shader"); }
	gl.shaderSource(vs, vss);
	gl.compileShader(vs);
	if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(vs) || ""); }

	const fs = gl.createShader(gl.FRAGMENT_SHADER);
	if (!fs) { throw new Error("Unable to create WebGL fragment shader"); }
	gl.shaderSource(fs, fss);
	gl.compileShader(fs);
	if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(fs) || ""); }

	const p = gl.createProgram();
	if (!p) { throw new Error("Unable to create WebGL program"); }
	gl.attachShader(p, vs);
	gl.attachShader(p, fs);
	gl.linkProgram(p);
	if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { throw new Error(gl.getProgramInfoLog(p) || ""); }

	return p;
}

function createQuad(gl: WebGLRenderingContext) {
	const pos = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
	const buf = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buf);
	gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
}

function createTexture(gl: WebGLRenderingContext, data: TexImageSource) {
	const t = gl.createTexture();
	if (!t) { throw new Error("Unable to create WebGL texture"); }
	gl.bindTexture(gl.TEXTURE_2D, t);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, data);
	return t;
}

type GLColor = [number, number, number, number];
const colorCache: {[key:string]: GLColor} = {};

function parseColor(color: string) {
	if (!(color in colorCache)) {
		let parsed: GLColor;
		if (color === "transparent") {
			parsed = [0, 0, 0, 0];
		} else if (color.indexOf("rgba") > -1) {
			const matches = color.match(/[\d.]+/g);
			if (!matches || matches.length < 3) { throw new Error(`Invalid RGBA color: ${color}`); }
			const channels = matches.slice(0, 4).map(Number);
			parsed = [channels[0] / 255, channels[1] / 255, channels[2] / 255, (channels[3] ?? 255) / 255];
			for (let i=0;i<3;i++) { parsed[i] = parsed[i]/255; }
		} else {
			const [red, green, blue] = Color.fromString(color);
			parsed = [red / 255, green / 255, blue / 255, 1];
		}
		colorCache[color] = parsed;
	}

	return colorCache[color];
}
