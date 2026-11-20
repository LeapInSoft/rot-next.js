import { Scheduler } from "@/src/scheduler/scheduler.js";

export interface SpeedActor {
	getSpeed: () => number;
}

/**
 * @class Speed-based scheduler
 */
export class Speed<T extends SpeedActor = SpeedActor> extends Scheduler<T> {
	/**
	 * @param {object} item anything with "getSpeed" method
	 * @param {bool} repeat
	 * @param {number} [time=1/item.getSpeed()]
	 * @see ROT.Scheduler#add
	 */
	add(item:T, repeat:boolean, time?:number) {
		this.queue.add(item, time !== undefined ? time : this.getActorTime(item));
		return super.add(item, repeat);
	}

	/**
	 * @see ROT.Scheduler#next
	 */
	next() {
		if (this.current && this.repeat.indexOf(this.current) !== -1) {
			this.queue.add(this.current, this.getActorTime(this.current));
		}
		return super.next();
	}

	private getActorTime(item: T) {
		const speed = item.getSpeed();
		if (speed === 0) { throw new RangeError("Actor speed must be greater than zero"); }
		return 1 / speed;
	}
}
