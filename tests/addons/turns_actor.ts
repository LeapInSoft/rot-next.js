import { describe, expect, it, vi } from 'vitest';

import { registerTurnActor } from '@/addons/turns/actor.js';

describe('turn actor addon', () => {
	it('registers a turn-aware actor once with a compatible scheduler', () => {
		interface TestScheduler {
			add(actor: {act(): void}, repeat: boolean): this;
		}

		const actor = {act: vi.fn()};
		const scheduler: TestScheduler = {
			add: vi.fn().mockReturnThis(),
		};

		expect(registerTurnActor(scheduler, actor)).toBe(scheduler);
		expect(scheduler.add).toHaveBeenCalledWith(actor, true);
	});
});
