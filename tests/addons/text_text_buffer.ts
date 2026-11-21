import { describe, expect, it } from 'vitest';

import { TextBuffer } from '@/addons/text/text_buffer.js';

describe('text buffer addon', () => {
	it('appends, caps, formats, and clears text buffer lines', () => {
		const buffer = new TextBuffer(2);

		buffer.append('first');
		buffer.append('second');
		buffer.append('third');

		expect(buffer.getLines()).toEqual(['second', 'third']);
		expect(buffer.toString()).toBe('second\nthird');
		buffer.clear();
		expect(buffer.getLines()).toEqual([]);
	});
});
