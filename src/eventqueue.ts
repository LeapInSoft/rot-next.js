import {MinHeap} from "@/src/min_heap.js";

export class EventQueue<T = unknown> {
	time: number;
	events: MinHeap<T>;

	/**
	 * @class Generic event queue: stores events and retrieves them based on their time
	 */
	constructor() {
		this.time = 0;
		this.events = new MinHeap();
	}

	/**
	 * @returns {number} Elapsed time
	 */
	getTime() { return this.time; }

	/**
	 * Clear all scheduled events
	 */
	clear() {
		this.events = new MinHeap();
		return this;
	}

	/**
	 * @param {?} event
	 * @param {number} time
	 */
	add(event: T, time: number) {
		this.events.push(event,time);
	}

	/**
	 * Locates the nearest event, advances time if necessary. Returns that event and removes it from the queue.
	 * @returns {? || null} The event previously added by addEvent, null if no event available
	 */
	get() {
		if (!this.events.len()) { return null; }

		const { key: time, value: event } = this.events.pop();
		if (time > 0) { /* advance */
			this.time += time;
			this.events.shift(-time);
		}

		return event;
	}

	/**
	 * Get the time associated with the given event
	 * @param {?} event
	 * @returns {number} time
	 */
	getEventTime(event: T) {
		const r = this.events.find(event);
		if (r) {
			const { key } = r;
			return key;
		}
		return undefined;
	}

	/**
	 * Remove an event from the queue
	 * @param {?} event
	 * @returns {bool} success?
	 */
	remove(event: T) {
		return this.events.remove(event);
	};
}

