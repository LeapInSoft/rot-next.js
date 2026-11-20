import { EventQueue } from "@/src/eventqueue.js";

export class Scheduler<T = unknown> {
	queue: EventQueue<T>;
	repeat: T[];
	current: T | null;

	/**
	 * @class Abstract scheduler
	 */
	constructor() {
		this.queue = new EventQueue<T>();
		this.repeat = [];
		this.current = null;
	}

	/**
	 * @see ROT.EventQueue#getTime
	 */
	getTime() { return this.queue.getTime(); }

	/**
	 * @param {?} item
	 * @param {bool} repeat
	 */
	add(item:T, repeat:boolean) {
		if (repeat) { this.repeat.push(item); }
		return this;
	}

	/**
	 * Get the time the given item is scheduled for
	 * @param {?} item
	 * @returns {number} time
	 */
	getTimeOf(item: T) {
		return this.queue.getEventTime(item);
	}

	/**
	 * Clear all items
	 */
	clear() {
		this.queue.clear();
		this.repeat = [];
		this.current = null;
		return this;
	}

	/**
	 * Remove a previously added item
	 * @param {?} item
	 * @returns {bool} successful?
	 */
	remove(item: T) {
		const result = this.queue.remove(item);

		const index = this.repeat.indexOf(item);
		if (index !== -1) { this.repeat.splice(index, 1); }

		if (this.current === item) { this.current = null; }

		return result;
	}

	/**
	 * Schedule next item
	 * @returns {?}
	 */
	next() {
		this.current = this.queue.get();
		return this.current;
	}
}
