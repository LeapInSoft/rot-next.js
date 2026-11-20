import type { Backend } from "@/src/display/backend.js";
import { Hex } from "@/src/display/hex.js";
import { Rect } from "@/src/display/rect.js";
import { Tile } from "@/src/display/tile.js";
import { TileGL } from "@/src/display/tile_gl.js";
import { Term } from "@/src/display/term.js";
import * as Text from "@/src/text.js";
import type { DisplayOptions, DisplayData, LayoutType } from "@/src/display/types.js";
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from "@/src/constants.js";

type BackendConstructor = new () => Backend;

interface TextRenderState {
	cx: number;
	cy: number;
	fg: string|null;
	bg: string|null;
	lines: number;
	isPrevSpace: boolean;
	isPrevFullWidth: boolean;
}

interface TextToken {
	type: number;
	value?: string;
}

const BACKENDS: Record<LayoutType, BackendConstructor> = {
	hex: Hex,
	rect: Rect,
	tile: Tile,
	"tile-gl": TileGL,
	term: Term,
};

const DEFAULT_OPTIONS: DisplayOptions = {
	width: DEFAULT_WIDTH,
	height: DEFAULT_HEIGHT,
	transpose: false,
	layout: "rect",
	fontSize: 15,
	spacing: 1,
	border: 0,
	forceSquareRatio: false,
	fontFamily: "monospace",
	fontStyle: "",
	fg: "#ccc",
	bg: "#000",
	tileWidth: 32,
	tileHeight: 32,
	tileMap: {},
	tileSet: null,
	tileColorize: false,
};

/**
 * @class Visual map display
 */
export class Display {
	private data: Record<string, DisplayData> = {};
	private dirty: boolean|Record<string, boolean> = false;
	private options: DisplayOptions = {...DEFAULT_OPTIONS};
	private backend: Backend;
	private scheduledBackend: Backend;
	private destroyed = false;

	static readonly Rect = Rect;
	static readonly Hex = Hex;
	static readonly Tile = Tile;
	static readonly TileGL = TileGL;
	static readonly Term = Term;

	constructor(options: Partial<DisplayOptions> = {}) {
		this.options = {...DEFAULT_OPTIONS, ...options};
		const BackendCtor = BACKENDS[this.options.layout];
		this.backend = new BackendCtor();
		this.scheduledBackend = this.backend;
		this.backend.setOptions(this.options);
		this.dirty = true;
		this.DEBUG = this.DEBUG.bind(this);
		this.tick = this.tick.bind(this);
		this.scheduleTick();
	}

	/**
	 * Debug helper, ideal as a map generator callback. Always bound to this.
	 * @param {int} x
	 * @param {int} y
	 * @param {int} what
	 */
	DEBUG(x: number, y: number, what: number) {
		const colors = [this.options.bg, this.options.fg];
		this.draw(x, y, null, null, colors[what % colors.length]);
	}

	/**
	 * Clear the whole display (cover it with background color)
	 */
	clear() {
		this.data = {};
		this.dirty = true;
	}

	/**
	 * @see ROT.Display
	 */
	setOptions(options: Partial<DisplayOptions>) {
		Object.assign(this.options, options);
		if (options.layout) {
			const ctor = BACKENDS[options.layout];
			this.backend = new ctor();
		}
		if (Object.keys(options).length === 0) { return this; }
		this.backend.setOptions(this.options);
		this.dirty = true;
		return this;
	}

	/**
	 * Returns currently set options
	 */
	getOptions() {
		return this.options;
	}

	/**
	 * Returns the DOM node of this display
	 */
	getContainer() {
		return this.backend.getContainer();
	}

	/**
	 * Stop the display update loop and cancel its pending callback.
	 */
	destroy() {
		if (this.destroyed) { return; }
		this.destroyed = true;
		this.scheduledBackend.cancelSchedule();
	}

	/**
	 * Compute the maximum width/height to fit into a set of given constraints
	 * @param {int} availWidth Maximum allowed pixel width
	 * @param {int} availHeight Maximum allowed pixel height
	 * @returns {int[2]} cellWidth,cellHeight
	 */
	computeSize(availWidth: number, availHeight: number) {
		return this.backend.computeSize(availWidth, availHeight);
	}

	/**
	 * Compute the maximum font size to fit into a set of given constraints
	 * @param {int} availWidth Maximum allowed pixel width
	 * @param {int} availHeight Maximum allowed pixel height
	 * @returns {int} fontSize
	 */
	computeFontSize(availWidth: number, availHeight: number) {
		return this.backend.computeFontSize(availWidth, availHeight);
	}

	computeTileSize(availWidth: number, availHeight: number) {
		const width = Math.floor(availWidth / this.options.width);
		const height = Math.floor(availHeight / this.options.height);
		return [width, height];		
	}

	/**
	 * Convert a DOM event (mouse or touch) to map coordinates. Uses first touch for multi-touch.
	 * @param {Event} e event
	 * @returns {int[2]} -1 for values outside of the canvas
	 */
	eventToPosition(e: TouchEvent | MouseEvent) {
		if ("touches" in e) {
			const touch = e.touches[0] ?? e.changedTouches[0];
			if (!touch) { return [-1, -1]; }
			return this.backend.eventToPosition(touch.clientX, touch.clientY);
		}

		return this.backend.eventToPosition(e.clientX, e.clientY);
	}

	/**
	 * @param {int} x
	 * @param {int} y
	 * @param {string || string[]} ch One or more chars (will be overlapping themselves)
	 * @param {string} [fg] foreground color
	 * @param {string} [bg] background color
	 */
	draw(x: number, y: number, ch: string | string[] | null, fg: string | null, bg: string | null) {
		if (!fg) { fg = this.options.fg; }
		if (!bg) { bg = this.options.bg; }
		const key = `${x},${y}`;
		this.data[key] = [x, y, ch, fg, bg];
		if (this.dirty === true) { return; }
		if (!this.dirty) { this.dirty = {}; }
		this.dirty[key] = true;
	}

	/**
	 * @param {int} x
	 * @param {int} y
	 * @param {string || string[]} ch One or more chars (will be overlapping themselves)
	 * @param {string || null} [fg] foreground color
	 * @param {string || null} [bg] background color
	 */
	drawOver(
		x: number,
		y: number,
		ch: string | null,
		fg: string | null,
		bg: string | null
	) {
		const key = `${x},${y}`;
		const existing = this.data[key];
		if (existing) {
			this.draw(x, y, ch || existing[2], fg || existing[3], bg || existing[4]);
		} else {
			this.draw(x, y, ch, fg, bg);
		}
	}

	/**
	 * Draws a text at given position. Optionally wraps at a maximum length. Currently does not work with hex layout.
	 * @param {int} x
	 * @param {int} y
	 * @param {string} text May contain color/background format specifiers, %c{name}/%b{name}, both optional. %c{}/%b{} resets to default.
	 * @param {int} [maxWidth] wrap at what width?
	 * @returns {int} lines drawn
	 */
	drawText(x:number, y:number, text:string, maxWidth?:number) {
		if (!maxWidth && x >= this.options.width) { return 0; }
		if (!maxWidth) { maxWidth = this.options.width-x; }

		const tokens = Text.tokenize(text, maxWidth) as TextToken[];
		const initialState: TextRenderState = {
			cx:x,
			cy:y,
			fg:null,
			bg:null,
			lines:1,
			isPrevSpace:false,
			isPrevFullWidth:false,
		};
		const finalState = tokens.reduce((state: TextRenderState, token) => {
			switch (token.type) {
				case Text.TYPE_TEXT: {
					return Array.from(token.value ?? '').reduce((characterState: TextRenderState, c) => {
						const cc = c.charCodeAt(0);
						if (this.options.layout === "term") {
							const cch = cc >> 8;
							const isCJK = cch === 0x11 || (cch >= 0x2e && cch <= 0x9f) || (cch >= 0xac && cch <= 0xd7) || (cc >= 0xA960 && cc <= 0xA97F);
							if (isCJK) {
								// side-effect
								this.draw(characterState.cx, characterState.cy, c, characterState.fg, characterState.bg);
								this.draw(characterState.cx + 1, characterState.cy, "\t", characterState.fg, characterState.bg);
								return {...characterState, cx:characterState.cx + 2};
							}
						}
						const isFullWidth = (cc > 0xff00 && cc < 0xff61) || (cc > 0xffdc && cc < 0xffe8) || cc > 0xffee;
						const isSpace = c.charCodeAt(0) === 0x20 || c.charCodeAt(0) === 0x3000;
						let cx = characterState.cx;
						if (characterState.isPrevFullWidth && !isFullWidth && !isSpace) { cx++; }
						if (isFullWidth && !characterState.isPrevSpace) { cx++; }
						// side-effect
						this.draw(cx, characterState.cy, c, characterState.fg, characterState.bg);
						return {
							...characterState,
							cx:cx + 1,
							isPrevSpace:isSpace,
							isPrevFullWidth:isFullWidth,
						};
					}, state);
				}
				case Text.TYPE_FG:
					return {...state, fg:token.value || null};
				case Text.TYPE_BG:
					return {...state, bg:token.value || null};
				case Text.TYPE_NEWLINE:
					return {...state, cx:x, cy:state.cy + 1, lines:state.lines + 1};
				default:
					return state;
			}
		}, initialState);
		return finalState.lines;
	}

	/**
	 * Timer tick: update dirty parts
	 */
	private tick() {
		if (this.destroyed) { return; }
		this.scheduleTick();
		if (!this.dirty) { return; }
		if (this.dirty === true) {
			this.backend.clear();
			// side-effect
			Object.keys(this.data).forEach(id => { this.drawCell(id, false); });
		} else {
			// side-effect
			Object.keys(this.dirty).forEach(key => { this.drawCell(key, true); });
		}
		this.dirty = false;
	}

	private scheduleTick() {
		this.scheduledBackend = this.backend;
		this.backend.schedule(this.tick);
	}

	/**
	 * @param {string} key What to draw
	 * @param {boolean} clearBefore Is it necessary to clean before?
	 */
	private drawCell(key: string, clearBefore: boolean) {
		const data = this.data[key];
		if (data[4] !== this.options.bg) { clearBefore = true; }
		this.backend.draw(data, clearBefore);
	}
}
