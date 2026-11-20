import { describe, expect, it } from 'vitest';
import { Engine } from '@/src/engine.js';
import { EventQueue } from '@/src/eventqueue.js';
import { StringGenerator } from '@/src/stringgenerator.js';
import { Scheduler } from '@/src/scheduler/scheduler.js';
import { Simple } from '@/src/scheduler/simple.js';
import { Speed } from '@/src/scheduler/speed.js';
import { Action } from '@/src/scheduler/action.js';
import { DiscreteShadowcasting } from '@/src/fov/discrete-shadowcasting.js';
import { PreciseShadowcasting } from '@/src/fov/precise-shadowcasting.js';
import { RecursiveShadowcasting } from '@/src/fov/recursive-shadowcasting.js';
import { Simplex } from '@/src/noise/simplex.js';
import { Dijkstra } from '@/src/path/dijkstra.js';
import { AStar } from '@/src/path/astar.js';
import { Display } from '@/src/display/display.js';
import { Rect } from '@/src/display/rect.js';
import { Hex } from '@/src/display/hex.js';
import { Tile } from '@/src/display/tile.js';
import { TileGL } from '@/src/display/tile-gl.js';
import { Term } from '@/src/display/term.js';

describe('named public exports', () => {
	it('exports core classes by name', () => {
		expect(new Engine(new Scheduler())).toBeInstanceOf(Engine);
		expect(new EventQueue()).toBeInstanceOf(EventQueue);
		expect(new StringGenerator({}).generate).toBeTypeOf('function');
	});

	it('exports scheduler classes by name', () => {
		expect(Simple).toBeTypeOf('function');
		expect(Speed).toBeTypeOf('function');
		expect(Action).toBeTypeOf('function');
	});

	it('exports FOV, noise, and path classes by name', () => {
		expect(DiscreteShadowcasting).toBeTypeOf('function');
		expect(PreciseShadowcasting).toBeTypeOf('function');
		expect(RecursiveShadowcasting).toBeTypeOf('function');
		expect(Simplex).toBeTypeOf('function');
		expect(Dijkstra).toBeTypeOf('function');
		expect(AStar).toBeTypeOf('function');
	});

	it('exports display classes by name', () => {
		expect(Display).toBeTypeOf('function');
		expect(Rect).toBeTypeOf('function');
		expect(Hex).toBeTypeOf('function');
		expect(Tile).toBeTypeOf('function');
		expect(TileGL).toBeTypeOf('function');
		expect(Term).toBeTypeOf('function');
	});
});
