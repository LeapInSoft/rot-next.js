import TileGL from '@/src/display/tile-gl.js';
import Term from '@/src/display/term.js';
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
		backend._options = createOptions('term');
		backend._offset = [0, 0];
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
		backend._options = createOptions('term');
		backend._offset = [0, 0];
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
			COLOR_BUFFER_BIT: 0x4000,
			TRIANGLE_STRIP: 5
		} as unknown as WebGLRenderingContext;
		backend._gl = gl;
		backend._options = createOptions('tile-gl');
		backend._uniforms = {};
		return { backend, gl };
	}

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
