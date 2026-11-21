export class TextBuffer {
	private readonly lines: string[] = [];

	constructor(private readonly maximumLines = 100) {
		if (maximumLines < 1) {
			throw new Error('Text buffer maximumLines must be at least 1');
		}
	}

	append(text: string): void {
		this.lines.push(text);
		if (this.lines.length > this.maximumLines) {
			this.lines.splice(0, this.lines.length - this.maximumLines);
		}
	}

	getLines(): string[] {
		return [...this.lines];
	}

	clear(): void {
		this.lines.length = 0;
	}

	toString(): string {
		return this.lines.join('\n');
	}
}
