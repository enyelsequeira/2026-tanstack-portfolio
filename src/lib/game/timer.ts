export type GameMode = "classic" | "snake";

export type Run = {
	startedAt: number | null;
	finishedAt: number | null;
};

export type BestTimes = {
	classic: number | null;
	snake: number | null;
};

/** Render elapsed milliseconds as mm:ss (minutes are not capped). */
export function formatClock(ms: number): string {
	const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${pad(minutes)}:${pad(seconds)}`;
}

/** The faster of an existing best (possibly null) and a new candidate time. */
export function betterTime(current: number | null, candidate: number): number {
	return current == null ? candidate : Math.min(current, candidate);
}

/**
 * Advance the run clock in response to a collection event.
 * Starts on the first find; finishes (and reports duration) on the last find.
 */
export function advanceRun(
	run: Run,
	countAfter: number,
	total: number,
	now: number,
): { run: Run; durationMs: number | null } {
	if (countAfter === 1 && run.startedAt == null) {
		return { run: { startedAt: now, finishedAt: null }, durationMs: null };
	}
	if (countAfter >= total && run.startedAt != null && run.finishedAt == null) {
		return {
			run: { startedAt: run.startedAt, finishedAt: now },
			durationMs: now - run.startedAt,
		};
	}
	return { run, durationMs: null };
}
