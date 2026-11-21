import { TileGL } from '@/src/display/tile_gl.js';
import { Term } from '@/src/display/term.js';
import type { DisplayOptions } from '@/src/display/types.js';
import { describe, expect, it, vi } from 'vitest';

function createOptions(layout: DisplayOptions['layout']): DisplayOptions {
	return {
		width: 2,
		height: 2,
		transpose: false,
		layout,
		fontSize: 15,
		spacing: 1,
		border: 0,
		forceSquareRatio: false,
		fontFamily: 'monospace',
		fontStyle: '',
		fg: '#ccc',
		bg: '#000',
		tileWidth: 1,
		tileHeight: 1,
		tileMap: { '@': [0, 0] },
		tileSet: null,
		tileColorize: false
	};
}

describe('Term backend', () => {
	it('writes cursor movement and colors only when they change', () => {
		const backend = new Term();
		backend.options = createOptions('term');
		backend.offset = [0, 0];
		vi.spyOn(backend, 'computeSize').mockReturnValue([2, 2]);
		const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

		try {
			backend.draw([0, 0, '@', '#fff', '#000'], false);
			backend.draw([1, 0, 'x', '#fff', '#000'], false);

			expect(write.mock.calls.map(([value]) => String(value))).toEqual([
				'\u001b[1;1H',
				'\u001b[0;38;5;231;48;5;16m',
				'@',
				'x'
			]);
		} finally {
			write.mockRestore();
		}
	});

	it('does not write cells outside the available terminal area', () => {
		const backend = new Term();
		backend.options = createOptions('term');
		backend.offset = [0, 0];
		vi.spyOn(backend, 'computeSize').mockReturnValue([2, 2]);
		const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

		try {
			backend.draw([2, 0, '@', '#fff', '#000'], false);

			expect(write).not.toHaveBeenCalled();
		} finally {
			write.mockRestore();
		}
	});
});

describe('TileGL backend', () => {
	function createBackend() {
		const backend = Object.create(TileGL.prototype) as TileGL;
		const gl = {
			canvas: { width: 2, height: 2 },
			scissor: vi.fn(),
			clearColor: vi.fn(),
			clear: vi.fn(),
			uniform2fv: vi.fn(),
			uniform1f: vi.fn(),
			uniform4fv: vi.fn(),
			drawArrays: vi.fn(),
			createTexture: vi.fn(),
			bindTexture: vi.fn(),
			texParameteri: vi.fn(),
			pixelStorei: vi.fn(),
			texImage2D: vi.fn(),
			deleteTexture: vi.fn(),
			COLOR_BUFFER_BIT: 0x4000,
			TRIANGLE_STRIP: 5,
			TEXTURE_2D: 0x0de1,
			TEXTURE_MAG_FILTER: 0x2800,
			TEXTURE_MIN_FILTER: 0x2801,
			TEXTURE_WRAP_S: 0x2802,
			TEXTURE_WRAP_T: 0x2803,
			NEAREST: 0x2600,
			REPEAT: 0x2901,
			UNPACK_FLIP_Y_WEBGL: 0x9240,
			RGBA: 0x1908,
			UNSIGNED_BYTE: 0x1401
		} as unknown as WebGLRenderingContext;
		backend.gl = gl;
		backend.options = createOptions('tile-gl');
		backend.uniforms = {};
		return { backend, gl };
	}

	it('passes normalized RGBA foreground and background colors to the tint uniforms', () => {
		const { backend, gl } = createBackend();
		backend.options = { ...backend.options, tileColorize: true };
		backend.uniforms = {
			targetPosRel: null,
			tilesetPosAbs: null,
			colorize: null,
			tint: null,
			bg: null
		};

		backend.draw([0, 0, '@', 'rgba(255,128,64,1)', 'rgba(0,0,0,0.5)'], false);

		expect(gl.uniform4fv).toHaveBeenNthCalledWith(1, null, [1, 128 / 255, 64 / 255, 1]);
		expect(gl.uniform4fv).toHaveBeenNthCalledWith(2, null, [0, 0, 0, 0.5]);
	});

	it('fails explicitly when WebGL initialization fails', () => {
		const initializationError = new Error('WebGL is unavailable');
		const initialize = vi.spyOn(TileGL.prototype, 'initWebGL').mockImplementation(() => {
			throw initializationError;
		});

		try {
			expect(() => new TileGL()).toThrow(initializationError);
		} finally {
			initialize.mockRestore();
		}
	});

	it('reuses a texture for an unchanged tile set and deletes it when replaced', () => {
		const { backend, gl } = createBackend();
		const firstTexture = {} as WebGLTexture;
		const secondTexture = {} as WebGLTexture;
		vi.mocked(gl.createTexture)
			.mockReturnValueOnce(firstTexture)
			.mockReturnValueOnce(secondTexture);
		vi.spyOn(backend, 'updateSize').mockImplementation(() => {});
		const firstTileSet = { complete: true } as HTMLImageElement;
		const secondTileSet = { complete: true } as HTMLImageElement;

		backend.setOptions({ ...backend.options, tileSet: firstTileSet });
		backend.setOptions({ ...backend.options, tileSet: firstTileSet });
		expect(gl.createTexture).toHaveBeenCalledOnce();

		backend.setOptions({ ...backend.options, tileSet: secondTileSet });

		expect(gl.createTexture).toHaveBeenCalledTimes(2);
		expect(gl.deleteTexture).toHaveBeenCalledOnce();
		expect(gl.deleteTexture).toHaveBeenCalledWith(firstTexture);
	});

	it('registers only one load listener for an unchanged pending tile set', () => {
		const { backend } = createBackend();
		vi.spyOn(backend, 'updateSize').mockImplementation(() => {});
		vi.spyOn(backend, 'updateTexture').mockImplementation(() => {});
		const tileSet = {
			complete: false,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn()
		} as unknown as HTMLImageElement;
		const options = { ...backend.options, tileSet };

		backend.setOptions(options);
		backend.setOptions({ ...options, width: 3 });

		expect(tileSet.addEventListener).toHaveBeenCalledOnce();
		const listener = vi.mocked(tileSet.addEventListener).mock.calls[0][1] as EventListener;
		listener(new Event('load'));
		expect(backend.updateTexture).toHaveBeenCalledOnce();
		expect(backend.updateTexture).toHaveBeenCalledWith(tileSet);
	});

	it('clears only the requested tile area before an empty draw', () => {
		const { backend, gl } = createBackend();

		backend.draw([1, 0, null, '#fff', '#123456'], true);

		expect(gl.scissor).toHaveBeenCalledWith(1, 1, 1, 1);
		expect(gl.clearColor).toHaveBeenCalledWith(18 / 255, 52 / 255, 86 / 255, 1);
		expect(gl.clear).toHaveBeenCalledWith(gl.COLOR_BUFFER_BIT);
		expect(gl.drawArrays).not.toHaveBeenCalled();
	});

	it('reports characters that are missing from the tile map', () => {
		const { backend } = createBackend();

		expect(() => backend.draw([0, 0, '?', '#fff', '#000'], false)).toThrow('Char "?" not found in tileMap');
	});
});
