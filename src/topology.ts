export type Topology = 4 | 6 | 8;

export function assertValidTopology(topology: unknown): asserts topology is Topology {
	if (topology !== 4 && topology !== 6 && topology !== 8) {
		throw new RangeError('Invalid topology: expected 4, 6, or 8');
	}
}
