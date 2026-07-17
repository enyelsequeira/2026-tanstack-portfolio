export type Dir = "up" | "down" | "left" | "right";

export type Cell = { x: number; y: number };

export const OPPOSITE: Record<Dir, Dir> = {
	up: "down",
	down: "up",
	left: "right",
	right: "left",
};

const DELTA: Record<Dir, Cell> = {
	up: { x: 0, y: -1 },
	down: { x: 0, y: 1 },
	left: { x: -1, y: 0 },
	right: { x: 1, y: 0 },
};

/** Reject a 180° reversal (it would fold the snake onto itself). */
export function nextDir(current: Dir, requested: Dir): Dir {
	return requested === OPPOSITE[current] ? current : requested;
}

/**
 * Advance the head one cell within the play grid.
 * Horizontal moves wrap around the edges; vertical moves clamp at the top and
 * bottom rows (the snake never leaves the viewport on its own). Page scrolling
 * is handled separately by the caller, only while a vertical key is held.
 * The head is always clamped into the current grid first, so a viewport resize
 * (e.g. side-by-side windows) can never strand it out of bounds.
 */
export function stepHead(
	head: Cell,
	dir: Dir,
	cols: number,
	rows: number,
): Cell {
	const x = Math.min(Math.max(head.x, 0), cols - 1);
	const y = Math.min(Math.max(head.y, 0), rows - 1);

	if (dir === "left" || dir === "right") {
		return { x: (x + DELTA[dir].x + cols) % cols, y };
	}
	if (dir === "up") {
		return { x, y: Math.max(0, y - 1) };
	}
	return { x, y: Math.min(rows - 1, y + 1) };
}

/** Build the next snake body: new head in front, tail dropped unless growing. */
export function moveSnake(body: Cell[], head: Cell, grow: boolean): Cell[] {
	const next = [head, ...body];
	if (!grow) next.pop();
	return next;
}
