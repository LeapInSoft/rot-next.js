import {describe, expect, it, vi} from 'vitest';

import type {TurnActor} from '@/addons/turns/actor.js';
import {Simple} from '@/src/scheduler/simple.js';

describe('turn actor addon', () => {
	it('uses the core scheduler to register a turn actor', () => {
		const actor: TurnActor = {act: vi.fn()};
		const scheduler = new Simple<TurnActor>();

		scheduler.add(actor, true);

		expect(scheduler.next()).toBe(actor);
	});
});
