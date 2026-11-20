import { Scheduler } from "@/src/scheduler/scheduler.js";

/**
 * @class Simple fair scheduler (round-robin style)
 */
export class Simple<T = unknown> extends Scheduler<T> {
	add(item: T, repeat: boolean) {
		this.queue.add(item, 0);
		return super.add(item, repeat);
	}

	next() {
		if (this.current !== null && this.repeat.indexOf(this.current) !== -1) {
			this.queue.add(this.current, 0);
		}
		return super.next();
	}
}
