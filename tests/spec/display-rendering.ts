import * as ROT from '@/src';
import { describe, expect, it, vi } from 'vitest';

describe('Display rendering', () => {
	it('renders cells on the initial frame and redraws an overlaid cell', () => {
		const schedule = vi.spyOn(ROT.Display.Rect.prototype, 'schedule').mockImplementation(() => {});
		const draw = vi.spyOn(ROT.Display.Rect.prototype, 'draw');
		const display = new ROT.Display({ width: 3, height: 2 });

		try {
			display.draw(1, 1, 'a', null, null);
			schedule.mock.calls[0][0]();

			expect(draw).toHaveBeenNthCalledWith(1, [1, 1, 'a', '#ccc', '#000'], false);

			display.drawOver(1, 1, 'b', '#f00', null);
			schedule.mock.calls[1][0]();

			expect(draw).toHaveBeenNthCalledWith(2, [1, 1, 'b', '#f00', '#000'], true);
		} finally {
			schedule.mockRestore();
			draw.mockRestore();
		}
	});

	it('clears and redraws all stored cells after clearing the display', () => {
		const schedule = vi.spyOn(ROT.Display.Rect.prototype, 'schedule').mockImplementation(() => {});
		const clear = vi.spyOn(ROT.Display.Rect.prototype, 'clear');
		const draw = vi.spyOn(ROT.Display.Rect.prototype, 'draw');
		const display = new ROT.Display({ width: 3, height: 2 });

		try {
			display.draw(2, 1, 'x', null, null);
			schedule.mock.calls[0][0]();
			display.clear();
			schedule.mock.calls[1][0]();

			expect(clear).toHaveBeenCalledTimes(2);
			expect(draw).toHaveBeenCalledTimes(1);
		} finally {
			schedule.mockRestore();
			clear.mockRestore();
			draw.mockRestore();
		}
	});
});
