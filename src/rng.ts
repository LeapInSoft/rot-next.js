/**
 * This code is an implementation of Alea algorithm; (C) 2010 Johannes Baagøe.
 * Alea is licensed according to the http://en.wikipedia.org/wiki/MIT_License.
 */

const FRAC = 2.3283064365386963e-10; // 2^-32

class RandomNumberGenerator {
	private seed = 0;
	private state0 = 0;
	private state1 = 0;
	private state2 = 0;
	private carry = 0;

	getSeed() { return this.seed; }

	/**
	 * Seed the number generator
	 */
	setSeed(seed: number) {
		seed = (seed < 1 ? 1/seed : seed);

		this.seed = seed;
		this.state0 = (seed >>> 0) * FRAC;

		seed = (seed*69069 + 1) >>> 0;
		this.state1 = seed * FRAC;

		seed = (seed*69069 + 1) >>> 0;
		this.state2 = seed * FRAC;

		this.carry = 1;
		return this;
	}

	/**
	 * @returns Pseudorandom value [0,1), uniformly distributed
	 */
	getUniform() {
		const t = 2091639 * this.state0 + this.carry * FRAC;
		this.state0 = this.state1;
		this.state1 = this.state2;
		this.carry = t | 0;
		this.state2 = t - this.carry;
		return this.state2;
	}

	/**
	 * @param lowerBound The lower end of the range to return a value from, inclusive
	 * @param upperBound The upper end of the range to return a value from, inclusive
	 * @returns Pseudorandom value [lowerBound, upperBound], using ROT.RNG.getUniform() to distribute the value
	 */
	getUniformInt(lowerBound: number, upperBound: number) {
		const max = Math.max(lowerBound, upperBound);
		const min = Math.min(lowerBound, upperBound);
		return Math.floor(this.getUniform() * (max - min + 1)) + min;
	}

	/**
	 * @param mean Mean value
	 * @param stddev Standard deviation. ~95% of the absolute values will be lower than 2*stddev.
	 * @returns A normally distributed pseudorandom value
	 */
	getNormal(mean = 0, stddev = 1) {
		let u: number;
		let v: number;
		let r: number;
		do {
			u = 2*this.getUniform()-1;
			v = 2*this.getUniform()-1;
			r = u*u + v*v;
		} while (r > 1 || r === 0);

		const gauss = u * Math.sqrt(-2*Math.log(r)/r);
		return mean + gauss*stddev;
	}

	/**
	 * @returns Pseudorandom value [1,100] inclusive, uniformly distributed
	 */
	getPercentage() {
		return 1 + Math.floor(this.getUniform()*100);
	}

	/**
	 * @returns Randomly picked item, null when length=0
	 */
	getItem<T>(array: T[]) {
		if (!array.length) { return null; }
		return array[Math.floor(this.getUniform() * array.length)];
	}

	/**
	 * @returns New array with randomized items
	 */
	shuffle<T>(array: T[]) {
		const result: T[] = [];
		const clone = array.slice();
		while (clone.length) {
			const item = this.getItem(clone);
			if (item === null) { break; }
			const index = clone.indexOf(item);
			if (index === -1) { break; }
			const removed = clone.splice(index, 1)[0];
			result.push(removed);
		}
		return result;
	}

	/**
	 * @param data key=whatever, value=weight (relative probability)
	 * @returns whatever
	 */
	getWeightedValue(data: Record<string, number>): string | undefined {
		let total = 0;
		const ids = Object.keys(data);

		for (const id of ids) {
			total += data[id];
		}
		const random = this.getUniform()*total;

		let part = 0;
		for (const id of ids) {
			part += data[id];
			if (random < part) { return id; }
		}

		// If by some floating-point annoyance we have
		// random >= total, just return the last id.
		return ids[ids.length - 1];
	}

	/**
	 * Get RNG state. Useful for storing the state and re-setting it via setState.
	 * @returns Internal state
	 */
	getState() { return [this.state0, this.state1, this.state2, this.carry]; }

	/**
	 * Set a previously retrieved state.
	 */
	setState(state: number[]) {
		this.state0 = state[0];
		this.state1 = state[1];
		this.state2 = state[2];
		this.carry = state[3];
		return this;
	}

	/**
	 * Returns a cloned RNG
	 */
	clone() {
		const clone = new RandomNumberGenerator();
		return clone.setState(this.getState());
	}
}

export const RNG = new RandomNumberGenerator().setSeed(Date.now());
