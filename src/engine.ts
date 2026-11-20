import { Scheduler } from "@/src/scheduler/scheduler.js";

/**
 * @class Asynchronous main loop
 * @param {ROT.Scheduler} scheduler
 */

export class Engine {
	scheduler: Scheduler;
	lockCount: number;

	constructor(scheduler: Scheduler) {
		this.scheduler = scheduler;
		this.lockCount = 1;
	}

	/**
	 * Start the main loop. When this call returns, the loop is locked.
	 */
	start() { return this.unlock(); }

	/**
	 * Interrupt the engine by an asynchronous action
	 */
	lock() {
		this.lockCount++;
		return this;
	}

	/**
	 * Resume execution (paused by a previous lock)
	 */
	unlock() {
		if (!this.lockCount) { throw new Error("Cannot unlock unlocked engine"); }
		this.lockCount--;

		while (!this.lockCount) {
			const actor = this.scheduler.next();
			if (!actor) { return this.lock(); } /* no actors */
			let result;
			try {
				result = actor.act();
			} catch (error) {
				if (!this.lockCount) { this.lock(); }
				throw error;
			}
			if (result && result.then) { /* actor returned a "thenable", looks like a Promise */
				this.lock();
				const unlock = this.unlock.bind(this);
				result.then(unlock, unlock);
			}
		}

		return this;
	}
}
