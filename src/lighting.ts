import type { FOV } from './fov/fov.js';
import {add_ as addColor, fromString} from './color.js';

type LightColor = [number, number, number];

/** Callback to retrieve cell reflectivity (0..1) */
interface ReflectivityCallback {
	(x: number, y: number): number;
}

/** Will be called for every lit cell */
interface LightingCallback {
	(x: number, y: number, color: LightColor): void;
}

interface LightingMap {
	[key: string]: LightColor;
}

interface NumberMap {
	[key: string]: number;
}

interface Options {
	/** Number of passes. 1 equals to simple FOV of all light sources, >1 means a *highly simplified* radiosity-like algorithm. Default = 1 */
	passes: number;
	/** Cells with emissivity > threshold will be treated as light source in the next pass. Default = 100 */
	emissionThreshold: number;
	/** Max light range, default = 10 */
	range: number;
}

/**
 * Lighting computation, based on a traditional FOV for multiple light sources and multiple passes.
 */
export class Lighting {
	private readonly options: Options = {
		passes: 1,
		emissionThreshold: 100,
		range: 10
	};
	private fov?: FOV;
	private lights: LightingMap = {};
	private reflectivityCache: NumberMap = {};
	private fovCache: {[sourceKey: string]: NumberMap} = {};

	constructor(private readonly reflectivityCallback: ReflectivityCallback, options: Partial<Options> = {}) {
		this.setOptions(options);
	}

	/**
	 * Adjust options at runtime
	 */
	setOptions(options: Partial<Options>) {
		const hasRange = Object.prototype.hasOwnProperty.call(options, 'range');
		if (hasRange && (typeof options.range !== 'number' || !Number.isFinite(options.range) || options.range < 0)) {
			throw new RangeError('Lighting range must be a finite non-negative number');
		}

		Object.assign(this.options, options);
		if (hasRange) { this.reset(); }
		return this;
	}

	/**
	 * Set the used Field-Of-View algo
	 */
	setFOV(fov: FOV) {
		this.fov = fov;
		this.fovCache = {};
		return this;
	}

	/**
	 * Set (or remove) a light source
	 */
	setLight(x: number, y: number, color: null | string | LightColor) {
		const key = `${x},${y}`;

		if (color) {
			this.lights[key] = typeof color === 'string' ? fromString(color) : color;
		} else {
			delete this.lights[key];
		}
		return this;
	}

	/**
	 * Remove all light sources
	 */
	clearLights() {
		this.lights = {};
	}

	/**
	 * Reset the pre-computed topology values. Call whenever the underlying map changes its light-passability.
	 */
	reset() {
		this.reflectivityCache = {};
		this.fovCache = {};

		return this;
	}

	/**
	 * Compute the lighting
	 */
	compute(lightingCallback: LightingCallback) {
		const doneCells = new Set<string>();
		let emittingCells: LightingMap = Object.fromEntries(
			Object.entries(this.lights).map(([key, light]) => [key, addColor([0, 0, 0], light)] as const)
		);
		let litCells: LightingMap = {};

		for (let pass = 0; pass < this.options.passes; pass++) {
			litCells = this.emitLight(emittingCells, litCells, doneCells);
			if (pass + 1 === this.options.passes) { continue; }
			emittingCells = this.computeEmitters(litCells, doneCells);
		}

		for (const [key, color] of Object.entries(litCells)) {
			const [rawX, rawY] = key.split(',');
			const x = Math.trunc(Number(rawX));
			const y = Math.trunc(Number(rawY));
			lightingCallback(x, y, color);
		}

		return this;
	}

	/**
	 * Compute one iteration from all emitting cells
	 * @param emittingCells These emit light
	 * @param litCells Add projected light to these
	 * @param doneCells These already emitted, forbid them from further calculations
	 */
	private emitLight(
		emittingCells: LightingMap,
		litCells: LightingMap,
		doneCells: Set<string>
	) {
		return Object.entries(emittingCells).reduce((currentLitCells, [key, color]) => {
			const [rawX, rawY] = key.split(',');
			const x = Math.trunc(Number(rawX));
			const y = Math.trunc(Number(rawY));
			doneCells.add(key);
			return this.emitLightFromCell(x, y, color, currentLitCells);
		}, litCells);
	}

	/**
	 * Prepare a list of emitters for next pass
	 */
	private computeEmitters(litCells: LightingMap, doneCells: Set<string>) {
		return Object.entries(litCells).reduce<LightingMap>((result, [key, color]) => {
			if (doneCells.has(key)) { return result; }

			let reflectivity: number;
			if (Object.prototype.hasOwnProperty.call(this.reflectivityCache, key)) {
				reflectivity = this.reflectivityCache[key];
			} else {
				const [rawX, rawY] = key.split(',');
				const x = Math.trunc(Number(rawX));
				const y = Math.trunc(Number(rawY));
				reflectivity = this.reflectivityCallback(x, y);
				this.reflectivityCache[key] = reflectivity;
			}

			if (reflectivity === 0) { return result; }

			const [red, green, blue] = color.map(channel => Math.round(channel * reflectivity));
			const emission: LightColor = [red, green, blue];
			const intensity = emission.reduce((total, channel) => total + channel, 0);
			if (intensity > this.options.emissionThreshold) { result[key] = emission; }
			return result;
		}, {});
	}

	/**
	 * Compute one iteration from one cell
	 */
	private emitLightFromCell(x: number, y: number, color: LightColor, litCells: LightingMap) {
		const sourceKey = `${x},${y}`;
		let fov: NumberMap;
		if (Object.prototype.hasOwnProperty.call(this.fovCache, sourceKey)) {
			fov = this.fovCache[sourceKey];
		} else {
			fov = this.updateFOV(x, y);
		}

		return Object.entries(fov).reduce((updatedLitCells, [targetKey, formFactor]) => {
			let resultColor: LightColor;
			if (Object.prototype.hasOwnProperty.call(updatedLitCells, targetKey)) {
				resultColor = updatedLitCells[targetKey];
			} else {
				resultColor = [0, 0, 0];
			}

			const [red, green, blue] = resultColor.map((channel, index) =>
				channel + Math.round(color[index] * formFactor)
			);
			updatedLitCells[targetKey] = [red, green, blue];
			return updatedLitCells;
		}, litCells);
	}

	/**
	 * Compute FOV ("form factor") for a potential light source at [x,y]
	 */
	private updateFOV(x: number, y: number) {
		const sourceKey = `${x},${y}`;
		const cache: NumberMap = {};
		this.fovCache[sourceKey] = cache;
		const range = this.options.range;
		const callback = (cellX: number, cellY: number, distance: number, visibility: number) => {
			const targetKey = `${cellX},${cellY}`;
			const formFactor = range === 0 ? (distance === 0 ? visibility : 0) : visibility * (1 - distance / range);
			if (formFactor === 0) { return; }
			cache[targetKey] = formFactor;
		};
		const fov = this.fov;
		if (!fov) { throw new Error('FOV algorithm must be set before computing lighting'); }
		fov.compute(x, y, range, callback);

		return cache;
	}
}
