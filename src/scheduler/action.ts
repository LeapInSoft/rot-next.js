import Scheduler from './scheduler.js';

/** Action-based scheduler. */
export class Action<T = unknown> extends Scheduler<T> {
	private readonly defaultDuration = 1;
	private duration = this.defaultDuration;

	/**
	 * @param item Item to schedule.
	 * @param repeat Whether to schedule the item repeatedly.
	 * @param time Delay before the item is scheduled.
	 * @see ROT.Scheduler#add
	 */
	add(item: T, repeat: boolean, time?: number) {
		this._queue.add(item, time !== undefined ? time : this.defaultDuration);
		return super.add(item, repeat);
	}

	clear() {
		this.duration = this.defaultDuration;
		return super.clear();
	}

	remove(item: T) {
		if (item === this._current) { this.duration = this.defaultDuration; }
		return super.remove(item);
	}

	/**
	 * @see ROT.Scheduler#next
	 */
	next() {
		if (this._current !== null && this._repeat.indexOf(this._current) !== -1) {
			this._queue.add(this._current, this.duration || this.defaultDuration);
			this.duration = this.defaultDuration;
		}
		return super.next();
	}

	/**
	 * Set duration for the active item
	 */
	setDuration(time: number) {
		if (this._current) { this.duration = time; }
		return this;
	}
}
