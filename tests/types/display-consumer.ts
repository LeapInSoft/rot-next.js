import { Display } from '../../lib/display/display.js';
import type { DisplayCanvas, DisplayOptions } from '../../lib/display/types.js';

declare const options: Partial<DisplayOptions>;
const display = new Display(options);
const canvas: DisplayCanvas | null = display.getContainer();
canvas?.width;
display.eventToPosition({ clientX: 10, clientY: 20 });
display.destroy();
