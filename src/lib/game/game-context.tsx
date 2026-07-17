import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { COLLECTIBLES } from "@/data/collectibles";
import {
	advanceRun,
	type BestTimes,
	betterTime,
	type GameMode,
	type Run,
} from "@/lib/game/timer";
import type { Collectible } from "@/lib/game/types";

const ENABLED_KEY = "explorer:enabled";
const COLLECTED_KEY = "explorer:collected";
const LAYOUT_KEY = "explorer:layout";
const MODE_KEY = "explorer:mode";
const BEST_KEY = "explorer:best";

/** A randomized placement per collectible id: which section + where inside it. */
export type Layout = Record<string, { anchor: string; x: number; y: number }>;

// The distinct sections collectibles can be scattered across, derived from data.
const ANCHORS = [...new Set(COLLECTIBLES.map((c) => c.anchor))];

type GameContextValue = {
	enabled: boolean;
	collected: string[];
	collectedCount: number;
	allFound: boolean;
	recent: Collectible | null;
	stashOpen: boolean;
	layout: Layout;
	mode: GameMode;
	setMode: (mode: GameMode) => void;
	run: Run;
	elapsedMs: number;
	bestTimes: BestTimes;
	beginRun: () => void;
	toggleEnabled: () => void;
	collect: (id: string) => void;
	isCollected: (id: string) => boolean;
	clearRecent: () => void;
	setStashOpen: (open: boolean) => void;
	reset: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

function readCollected(): string[] {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(COLLECTED_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed.filter((v) => typeof v === "string")
			: [];
	} catch {
		return [];
	}
}

function readMode(): GameMode {
	if (typeof window === "undefined") return "classic";
	return window.localStorage.getItem(MODE_KEY) === "snake"
		? "snake"
		: "classic";
}

function readBest(): BestTimes {
	const empty: BestTimes = { classic: null, snake: null };
	if (typeof window === "undefined") return empty;
	try {
		const raw = window.localStorage.getItem(BEST_KEY);
		if (!raw) return empty;
		const parsed = JSON.parse(raw) as Partial<BestTimes>;
		return {
			classic: typeof parsed.classic === "number" ? parsed.classic : null,
			snake: typeof parsed.snake === "number" ? parsed.snake : null,
		};
	} catch {
		return empty;
	}
}

// Deterministic default layout (matches the authored data) so server and the
// first client render agree. Real randomization happens client-side after mount.
function defaultLayout(): Layout {
	const layout: Layout = {};
	for (const c of COLLECTIBLES) {
		layout[c.id] = { anchor: c.anchor, x: c.x, y: c.y };
	}
	return layout;
}

// Fresh placement for every collectible: a shuffled section + a padded random
// spot inside it, so each reset scatters them somewhere genuinely new.
function randomLayout(): Layout {
	// Repeat the anchor list to cover every item, then shuffle for an even spread.
	const pool: string[] = [];
	while (pool.length < COLLECTIBLES.length) pool.push(...ANCHORS);
	for (let i = pool.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[pool[i], pool[j]] = [pool[j], pool[i]];
	}

	const layout: Layout = {};
	COLLECTIBLES.forEach((c, i) => {
		layout[c.id] = {
			anchor: pool[i] ?? c.anchor,
			x: 0.1 + Math.random() * 0.8,
			y: 0.2 + Math.random() * 0.6,
		};
	});
	return layout;
}

function isValidLayout(parsed: unknown): parsed is Layout {
	if (!parsed || typeof parsed !== "object") return false;
	const record = parsed as Record<string, unknown>;
	return COLLECTIBLES.every((c) => {
		const p = record[c.id] as { anchor?: unknown; x?: unknown; y?: unknown };
		return (
			typeof p?.anchor === "string" &&
			typeof p.x === "number" &&
			typeof p.y === "number"
		);
	});
}

function readLayout(): Layout {
	if (typeof window === "undefined") return defaultLayout();
	try {
		const raw = window.localStorage.getItem(LAYOUT_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			// Reuse a stored layout only if it fully matches the current item set;
			// otherwise (legacy or partial data) start fresh.
			if (isValidLayout(parsed)) return parsed;
		}
	} catch {
		// fall through to a fresh layout
	}
	return randomLayout();
}

export function GameProvider({ children }: { children: React.ReactNode }) {
	// Start with SSR-safe defaults so the server and first client render match,
	// then hydrate from localStorage in an effect.
	const [enabled, setEnabled] = useState(false);
	const [collected, setCollected] = useState<string[]>([]);
	const [recent, setRecent] = useState<Collectible | null>(null);
	const [stashOpen, setStashOpenState] = useState(false);
	const [layout, setLayout] = useState<Layout>(defaultLayout);
	const [mode, setModeState] = useState<GameMode>("classic");
	const [run, setRun] = useState<Run>({ startedAt: null, finishedAt: null });
	const [bestTimes, setBestTimes] = useState<BestTimes>({
		classic: null,
		snake: null,
	});
	// Drives the live elapsed clock without storing derived time in state.
	const [nowTick, setNowTick] = useState(0);
	// Latest mode in a ref so collect() can credit the best time without being
	// re-created on every mode change.
	const modeRef = useRef<GameMode>(mode);
	modeRef.current = mode;

	useEffect(() => {
		setEnabled(window.localStorage.getItem(ENABLED_KEY) === "true");
		setCollected(readCollected());
		setModeState(readMode());
		setBestTimes(readBest());
		const stored = readLayout();
		setLayout(stored);
		// Persist the layout so positions stay stable across reloads until reset.
		try {
			window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(stored));
		} catch {
			// ignore write failures
		}
	}, []);

	const persistEnabled = useCallback((value: boolean) => {
		try {
			window.localStorage.setItem(ENABLED_KEY, String(value));
		} catch {
			// ignore write failures (private mode, quota)
		}
	}, []);

	const persistCollected = useCallback((value: string[]) => {
		try {
			window.localStorage.setItem(COLLECTED_KEY, JSON.stringify(value));
		} catch {
			// ignore write failures
		}
	}, []);

	const persistMode = useCallback((value: GameMode) => {
		try {
			window.localStorage.setItem(MODE_KEY, value);
		} catch {
			// ignore write failures
		}
	}, []);

	const persistBest = useCallback((value: BestTimes) => {
		try {
			window.localStorage.setItem(BEST_KEY, JSON.stringify(value));
		} catch {
			// ignore write failures
		}
	}, []);

	const setMode = useCallback(
		(value: GameMode) => {
			setModeState(value);
			persistMode(value);
		},
		[persistMode],
	);

	const toggleEnabled = useCallback(() => {
		setEnabled((prev) => {
			const next = !prev;
			persistEnabled(next);
			if (!next) setStashOpenState(false);
			return next;
		});
	}, [persistEnabled]);

	const collect = useCallback(
		(id: string) => {
			setCollected((prev) => {
				if (prev.includes(id)) return prev;
				const found = COLLECTIBLES.find((c) => c.id === id);
				if (found) setRecent(found);
				const next = [...prev, id];
				persistCollected(next);

				const now = Date.now();
				setRun((prevRun) => {
					const { run: nextRun, durationMs } = advanceRun(
						prevRun,
						next.length,
						COLLECTIBLES.length,
						now,
					);
					if (durationMs != null) {
						const activeMode = modeRef.current;
						setBestTimes((prevBest) => {
							const updated: BestTimes = {
								...prevBest,
								[activeMode]: betterTime(prevBest[activeMode], durationMs),
							};
							persistBest(updated);
							return updated;
						});
					}
					return nextRun;
				});

				return next;
			});
		},
		[persistCollected, persistBest],
	);

	// Start the run clock as soon as a run begins (e.g. the snake starts driving),
	// not only on the first find, so the timer is visibly counting during play.
	const beginRun = useCallback(() => {
		setRun((prev) =>
			prev.startedAt == null
				? { startedAt: Date.now(), finishedAt: null }
				: prev,
		);
	}, []);

	const isCollected = useCallback(
		(id: string) => collected.includes(id),
		[collected],
	);

	const clearRecent = useCallback(() => setRecent(null), []);

	const setStashOpen = useCallback((open: boolean) => {
		setStashOpenState(open);
	}, []);

	const reset = useCallback(() => {
		setCollected([]);
		setRecent(null);
		setRun({ startedAt: null, finishedAt: null });
		persistCollected([]);
		// Shuffle every collectible to a fresh spot for the next run.
		const next = randomLayout();
		setLayout(next);
		try {
			window.localStorage.setItem(LAYOUT_KEY, JSON.stringify(next));
		} catch {
			// ignore write failures
		}
	}, [persistCollected]);

	// Tick a wall-clock value only while a run is in progress.
	useEffect(() => {
		if (run.startedAt == null || run.finishedAt != null) return;
		const id = window.setInterval(() => setNowTick(Date.now()), 250);
		return () => window.clearInterval(id);
	}, [run.startedAt, run.finishedAt]);

	const elapsedMs =
		run.startedAt == null
			? 0
			: (run.finishedAt ?? Math.max(nowTick, run.startedAt)) - run.startedAt;

	const value = useMemo<GameContextValue>(
		() => ({
			enabled,
			collected,
			collectedCount: collected.length,
			allFound: collected.length >= COLLECTIBLES.length,
			recent,
			stashOpen,
			layout,
			mode,
			setMode,
			run,
			elapsedMs,
			bestTimes,
			beginRun,
			toggleEnabled,
			collect,
			isCollected,
			clearRecent,
			setStashOpen,
			reset,
		}),
		[
			enabled,
			collected,
			recent,
			stashOpen,
			layout,
			mode,
			setMode,
			run,
			elapsedMs,
			bestTimes,
			beginRun,
			toggleEnabled,
			collect,
			isCollected,
			clearRecent,
			setStashOpen,
			reset,
		],
	);

	return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
	const ctx = useContext(GameContext);
	if (!ctx) {
		throw new Error("useGame must be used within a GameProvider");
	}
	return ctx;
}
