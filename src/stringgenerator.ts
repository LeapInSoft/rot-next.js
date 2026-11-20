import { RNG } from '@/src/rng.js';

interface Options {
	/** Use word mode? */
	words: boolean;
	/** Order, default = 3 */
	order: number;
	/** Prior value, default = 0.001 */
	prior: number;
}

type Events = { [key:string]: number };

/**
 * @class (Markov process)-based string generator. 
 * Copied from a <a href="http://roguebasin.com/index.php/Names_from_a_high_order_Markov_Process_and_a_simplified_Katz_back-off_scheme">RogueBasin article</a>. 
 * Offers configurable order and prior.
 */
export class StringGenerator {
	options: Options;
	boundary: string;
	suffix: string;
	prefix: string[];
	priorValues: { [key:string]: number };
	data: { [key:string]: Events };

	constructor(options: Partial<Options>) {
		this.options = {
			words: false,
			order: 3,
			prior: 0.001
		};
		Object.assign(this.options, options);

		this.boundary = String.fromCharCode(0);
		this.suffix = this.boundary;
		this.prefix = [];
		for (let i=0;i<this.options.order;i++) { this.prefix.push(this.boundary); }

		this.priorValues = {};
		this.priorValues[this.boundary] = this.options.prior;

		this.data = {};
	}

	/**
	 * Remove all learning data
	 */
	clear() {
		this.data = {};
		this.priorValues = {};
		this.priorValues[this.boundary] = this.options.prior;
	}

	/**
	 * @returns {string} Generated string
	 */
	generate() {
		if (Object.keys(this.data).length === 0) { return ""; }

		const result: string[] = [];
		const first = this.sample(this.prefix);
		if (first === undefined) { return ""; }
		result.push(first);
		while (true) {
			const last = result[result.length - 1];
			if (last === undefined || last === this.boundary) { break; }
			const next = this.sample(result);
			if (next === undefined) { break; }
			result.push(next);
		}
		return this.join(result.slice(0, -1));
	}

	/**
	 * Observe (learn) a string from a training set
	 */
	observe(string: string) {
		let tokens = this.split(string);

		for (let i=0; i<tokens.length; i++) {
			this.priorValues[tokens[i]] = this.options.prior;
		}

		tokens = this.prefix.concat(tokens).concat(this.suffix); /* add boundary symbols */

		for (let i=this.options.order; i<tokens.length; i++) {
			const context = tokens.slice(i-this.options.order, i);
			const event = tokens[i];
			for (let j=0; j<context.length; j++) {
				const subcontext = context.slice(j);
				this.observeEvent(subcontext, event);
			}
		}
	}

	getStats() {
		const parts = [];

		let priorCount = Object.keys(this.priorValues).length;
		priorCount--; // boundary
		parts.push("distinct samples: " + priorCount);

		const dataCount = Object.keys(this.data).length;
		let eventCount = 0;
		for (const p in this.data) {
			eventCount += Object.keys(this.data[p]).length;
		}
		parts.push("dictionary size (contexts): " + dataCount);
		parts.push("dictionary size (events): " + eventCount);

		return parts.join(", ");
	}

	/**
	 * @param {string}
	 * @returns {string[]}
	 */
	split(str: string) {
		return str.split(this.options.words ? /\s+/ : "");
	}

	/**
	 * @param {string[]}
	 * @returns {string} 
	 */
	join(arr: string[]) {
		return arr.join(this.options.words ? " " : "");
	}

	/**
	 * @param {string[]} context
	 * @param {string} event
	 */
	observeEvent(context: string[], event: string) {
		const key = this.join(context);
		if (!(key in this.data)) { this.data[key] = {}; }
		const data = this.data[key];

		if (!(event in data)) { data[event] = 0; }
		data[event]++;
	}

	/**
	 * @param {string[]}
	 * @returns {string}
	 */
	sample(context: string[]) {
		context = this.backoff(context);
		const key = this.join(context);
		const data = this.data[key];

		let available : Events = {};

		if (this.options.prior) {
			for (const event in this.priorValues) { available[event] = this.priorValues[event]; }
			for (const event in data) { available[event] += data[event]; }
		} else { 
			available = data;
		}

		return RNG.getWeightedValue(available);
	}

	/**
	 * @param {string[]}
	 * @returns {string[]}
	 */
	backoff(context: string[]) {
		if (context.length > this.options.order) {
			context = context.slice(-this.options.order);
		} else if (context.length < this.options.order) {
			context = this.prefix.slice(0, this.options.order - context.length).concat(context);
		}

		while (!(this.join(context) in this.data) && context.length > 0) { context = context.slice(1); }

		return context;
	}
}
