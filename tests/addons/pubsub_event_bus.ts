import { describe, expect, it, vi } from 'vitest';

import { TypedEventBus } from '@/addons/pubsub/event_bus.js';

describe('typed event bus addon', () => {
	it('publishes typed events only to matching subscribers', () => {
		interface MovedEvent {
			readonly type: 'moved';
			readonly entityId: string;
		}
		interface DamagedEvent {
			readonly type: 'damaged';
			readonly amount: number;
		}
		type TestEvent = MovedEvent | DamagedEvent;

		const events = new TypedEventBus<TestEvent>();
		const moved = vi.fn();

		const unsubscribe = events.subscribe('moved', moved);
		events.emit({type: 'moved', entityId: 'hero'});
		events.emit({type: 'damaged', amount: 3});

		expect(moved).toHaveBeenCalledWith({type: 'moved', entityId: 'hero'});

		unsubscribe();
		events.emit({type: 'moved', entityId: 'monster'});
		expect(moved).toHaveBeenCalledTimes(1);
	});
});
