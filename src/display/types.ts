export type LayoutType = "hex" | "rect" | "tile" | "tile-gl" | "term";

/** DOM-neutral dimensions exposed by a display backend's rendered canvas. */
export interface DisplayCanvas {
	width: number;
	height: number;
}

export interface DisplayEventCoordinates {
	clientX: number;
	clientY: number;
}

export interface DisplayTouchEventCoordinates {
	touches: ArrayLike<DisplayEventCoordinates>;
	changedTouches: ArrayLike<DisplayEventCoordinates>;
}

/** Shared dimensions of browser image sources accepted by tile backends. */
interface DisplayTileSetDimensions {
	width: number;
	height: number;
}

interface DisplayCanvasTileSet extends DisplayTileSetDimensions {
	getContext(contextId: "2d"): unknown;
}

interface DisplayImageTileSet extends DisplayTileSetDimensions {
	complete: boolean;
	naturalWidth: number;
	naturalHeight: number;
}

interface DisplayVideoTileSet extends DisplayTileSetDimensions {
	videoWidth: number;
	videoHeight: number;
	readyState: number;
}

interface DisplayBitmapTileSet extends DisplayTileSetDimensions {
	close(): void;
}

/** A DOM-neutral structural type for supported canvas, image, video, or bitmap tile sets. */
export type DisplayTileSet = DisplayCanvasTileSet | DisplayImageTileSet | DisplayVideoTileSet | DisplayBitmapTileSet;

export interface DisplayOptions {
	width: number;
	height: number;
	transpose: boolean;
	layout: LayoutType;
	fontSize: number;
	spacing: number;
	border: number;
	forceSquareRatio: boolean;
	fontFamily: string;
	fontStyle: string;
	fg: string;
	bg: string;
	tileWidth: number;
	tileHeight: number;
	tileMap: { [key: string]: [number, number] };
	tileSet: DisplayTileSet | null;
	tileColorize: boolean;
}

export type DisplayData = [number, number, string | string[] | null, string, string];
