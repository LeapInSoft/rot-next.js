export interface GridCoordinate {
	readonly x: number;
	readonly y: number;
}

export function createGridCoordinate(x: number, y: number): GridCoordinate {
	return Object.freeze({x, y});
}

export function gridKey({x, y}: GridCoordinate): string {
	return `${x},${y}`;
}

export function manhattanDistance(left: GridCoordinate, right: GridCoordinate): number {
	return Math.abs(left.x - right.x) + Math.abs(left.y - right.y);
}
