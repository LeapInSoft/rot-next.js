import type { DisplayTileSet } from "@/src/display/types.js";

export function getCanvasImageSource(tileSet: DisplayTileSet | null): CanvasImageSource {
	// Keep the browser-specific assertion out of the Node-facing declaration surface.
	return tileSet as unknown as CanvasImageSource;
}

export function getWebGLImageSource(tileSet: DisplayTileSet): TexImageSource {
	return tileSet as unknown as TexImageSource;
}
