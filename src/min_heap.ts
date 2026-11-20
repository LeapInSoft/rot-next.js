export interface HeapWrapper<T> {
	key: number,
	timestamp : number,
	value: T
}

export class MinHeap<T> {
	private heap: HeapWrapper<T>[];
	private timestamp : number;
	/* Logical keys are stored as heap keys plus this shared offset. */
	private offset: number;
	constructor() {
		this.heap = [];
		this.timestamp=0;
		this.offset=0;
	}
	lessThan(a:HeapWrapper<T>,b:HeapWrapper<T>){
		return a.key===b.key?a.timestamp<b.timestamp:a.key<b.key;
	}
	shift(v: number) {
		this.offset += v;
	}
	len() {
		return this.heap.length;
	}
	push(value: T,key : number) {
		this.timestamp+=1;
		const loc = this.len();
		this.heap.push({value,timestamp : this.timestamp,key: key - this.offset});
		this.updateUp(loc);
	}
	pop(): HeapWrapper<T> {
		if (this.len() === 0) {
			throw new Error("no element to pop");
		}
		const top = this.heap[0];
		if (this.len() > 1) {
			const replacement = this.heap.pop();
			if (!replacement) { throw new Error("heap replacement is unavailable"); }
			this.heap[0] = replacement;
			this.updateDown(0);
		} else {
			this.heap.pop();
		}
		return { ...top, key: top.key + this.offset };
	}
	find(v: T): HeapWrapper<T> | null {
		const index = this.findIndex(v);
		return index === -1 ? null : { ...this.heap[index], key: this.heap[index].key + this.offset };
	}
	remove(v: T) {
		const index = this.findIndex(v);
		if (index === -1) { return false; }

		const lastIndex = this.len() - 1;
		if (index === lastIndex) {
			this.heap.pop();
			return true;
		}

		const last = this.heap.pop();
		if (!last) { return false; }
		this.heap[index] = last;
		if (index > 0 && this.lessThan(last, this.heap[this.parentNode(index)])) {
			this.updateUp(index);
		} else {
			this.updateDown(index);
		}
		return true;
	}
	private findIndex(v: T): number {
		let index = -1;
		for (let i = 0; i < this.len(); i++) {
			if (v === this.heap[i].value && (index === -1 || this.heap[i].timestamp < this.heap[index].timestamp)) {
				index = i;
			}
		}
		return index;
	}
	private parentNode(x: number): number {
		return Math.floor((x - 1) / 2);
	}
	private leftChildNode(x: number): number {
		return 2 * x + 1;
	}
	private rightChildNode(x: number): number {
		return 2 * x + 2;
	}
	private existNode(x: number): boolean {
		return x >= 0 && x < this.heap.length;
	}
	private swap(x: number, y: number) {
		const t = this.heap[x];
		this.heap[x] = this.heap[y];
		this.heap[y] = t;
	}
	private minNode(numbers: number[]) {
		const validnumbers = numbers.filter(this.existNode.bind(this));
		let minimal = validnumbers[0];
		for (const i of validnumbers) {
			if (this.lessThan(this.heap[i],this.heap[minimal])) {
				minimal = i;
			}
		}
		return minimal;
	}
	private updateUp(x: number) {
		if (x === 0) {
			return;
		}
		const parent = this.parentNode(x);
		if (this.existNode(parent) && this.lessThan(this.heap[x],this.heap[parent])) {
			this.swap(x, parent);
			this.updateUp(parent);
		}
	}
	private updateDown(x: number) {
		const leftChild = this.leftChildNode(x);
		const rightChild = this.rightChildNode(x);
		if (!this.existNode(leftChild)) {
			return;
		}
		const m = this.minNode([x, leftChild, rightChild]);
		if (m !== x) {
			this.swap(x, m);
			this.updateDown(m);
		}
	}
	debugPrint() {
		console.log(this.heap.map(({ key, value, timestamp }) => ({ key: key + this.offset, value, timestamp })));
	}

}

