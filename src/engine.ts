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
				if (typeof actor !== "object" || actor === null) { return this.lock(); }
				const act = Reflect.get(actor, "act");
				if (typeof act !== "function") { return this.lock(); }
				result = Reflect.apply(act, actor, []);
			} catch (error) {
				if (!this.lockCount) { this.lock(); }
				throw error;
			}
			if (typeof result === "object" && result !== null) { /* actor returned a "thenable", looks like a Promise */
				const then = Reflect.get(result, "then");
				if (typeof then !== "function") { continue; }
				this.lock();
				const unlock = this.unlock.bind(this);
				Reflect.apply(then, result, [unlock, unlock]);
			}
		}

		return this;
	}
}
