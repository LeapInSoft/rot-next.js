import { Display } from 'rot-next.js/display';
import type { DisplayCanvas, DisplayOptions } from 'rot-next.js/display';

declare const options: Partial<DisplayOptions>;
const display = new Display(options);
const canvas: DisplayCanvas | null = display.getContainer();
canvas?.width;
display.eventToPosition({ clientX: 10, clientY: 20 });
display.draw(1, 1, '@');
display.draw(1, 1, '@', '#0f0');
display.destroy();
