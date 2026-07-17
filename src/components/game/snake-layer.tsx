import { useEffect, useRef, useState } from "react";
import { useGame } from "@/lib/game/game-context";
import { liveCollectiblePositions } from "@/lib/game/positions";
import {
	type Cell,
	type Dir,
	moveSnake,
	nextDir,
	stepHead,
} from "@/lib/game/snake-core";
import classes from "./snake-layer.module.css";

// Grid cell size in px; snake advances one cell per tick.
const CELL = 28;
// Tick interval (ms) — lower is faster.
const TICK_MS = 110;
// Page scroll step (px) per tick while a vertical key is held at an edge.
const SCROLL_STEP = CELL;
// Eat radius (px) between the head center and a glyph center.
const EAT_RADIUS = 26;
// Fallback top inset (px) when no fixed header is found.
const FALLBACK_TOP_INSET = 64;

const KEY_TO_DIR: Record<string, Dir> = {
	ArrowUp: "up",
	ArrowDown: "down",
	ArrowLeft: "left",
	ArrowRight: "right",
	w: "up",
	s: "down",
	a: "left",
	d: "right",
	W: "up",
	S: "down",
	A: "left",
	D: "right",
};

export function SnakeLayer() {
	const { enabled, mode, layout, collect, isCollected, beginRun, allFound } =
		useGame();
	const active = enabled && mode === "snake";

	const layerRef = useRef<HTMLDivElement>(null);
	const dir = useRef<Dir>("right");
	const queued = useRef<Dir | null>(null);
	const body = useRef<Cell[]>([]);
	const grow = useRef(0);
	// Which vertical keys are currently held, so the page scrolls only while the
	// player actively presses up/down at an edge (never on its own).
	const heldVertical = useRef({ up: false, down: false });

	// Latest layout/isCollected/collect in refs so the loop never restarts.
	const layoutRef = useRef(layout);
	layoutRef.current = layout;
	const isCollectedRef = useRef(isCollected);
	isCollectedRef.current = isCollected;
	const collectRef = useRef(collect);
	collectRef.current = collect;
	const beginRunRef = useRef(beginRun);
	beginRunRef.current = beginRun;
	// When the hunt is complete the snake freezes in place (the run is over).
	const allFoundRef = useRef(allFound);
	allFoundRef.current = allFound;

	const [hasKeyboard, setHasKeyboard] = useState(false);

	useEffect(() => {
		setHasKeyboard(!window.matchMedia("(hover: none)").matches);
	}, []);

	useEffect(() => {
		if (!active || !hasKeyboard) return;

		// Keep the play area below any fixed header so the snake never hides
		// behind it (which made the top edge look "stuck").
		const headerEl =
			document.querySelector("nav") ?? document.querySelector("header");
		const topInset = headerEl
			? Math.round(headerEl.getBoundingClientRect().height)
			: FALLBACK_TOP_INSET;

		const cols = () => Math.max(1, Math.floor(window.innerWidth / CELL));
		const rows = () =>
			Math.max(1, Math.floor((window.innerHeight - topInset) / CELL));

		// Start the timer the moment a snake run begins (unless the hunt is
		// already complete from a previous session).
		if (!allFoundRef.current) beginRunRef.current();

		// Seed the snake near the left-center of the play area.
		dir.current = "right";
		queued.current = null;
		grow.current = 0;
		heldVertical.current = { up: false, down: false };
		const startY = Math.floor(rows() / 2);
		body.current = [
			{ x: 3, y: startY },
			{ x: 2, y: startY },
			{ x: 1, y: startY },
		];

		const onKeyDown = (e: KeyboardEvent) => {
			const requested = KEY_TO_DIR[e.key];
			if (!requested) return;
			e.preventDefault();
			queued.current = nextDir(dir.current, requested);
			if (requested === "up") heldVertical.current.up = true;
			if (requested === "down") heldVertical.current.down = true;
		};
		const onKeyUp = (e: KeyboardEvent) => {
			const released = KEY_TO_DIR[e.key];
			if (released === "up") heldVertical.current.up = false;
			if (released === "down") heldVertical.current.down = false;
		};
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);

		const layer = layerRef.current;

		const paint = () => {
			if (!layer) return;
			const segs = layer.children;
			// Ensure there are enough segment nodes.
			while (segs.length < body.current.length) {
				const s = document.createElement("span");
				s.className = classes.segment;
				layer.appendChild(s);
			}
			while (segs.length > body.current.length) {
				layer.removeChild(layer.lastChild as Node);
			}
			body.current.forEach((cell, i) => {
				const node = segs[i] as HTMLElement;
				node.style.transform = `translate(${cell.x * CELL}px, ${topInset + cell.y * CELL}px)`;
				node.dataset.head = i === 0 ? "true" : "false";
			});
		};

		const tick = () => {
			// Hunt complete: stop the snake and freeze the run.
			if (allFoundRef.current) {
				if (layer) layer.dataset.done = "true";
				return;
			}
			// Resumed (e.g. after a reset): clear the frozen state and start a
			// fresh run clock.
			if (layer?.dataset.done) {
				delete layer.dataset.done;
				beginRunRef.current();
			}
			if (queued.current) {
				dir.current = queued.current;
				queued.current = null;
			}
			const r = rows();
			const nextHead = stepHead(body.current[0], dir.current, cols(), r);

			// Scroll the page only while the player holds up/down at that edge.
			if (heldVertical.current.down && nextHead.y >= r - 1) {
				window.scrollBy(0, SCROLL_STEP);
			} else if (heldVertical.current.up && nextHead.y <= 0) {
				window.scrollBy(0, -SCROLL_STEP);
			}

			const willGrow = grow.current > 0;
			if (willGrow) grow.current -= 1;
			body.current = moveSnake(body.current, nextHead, willGrow);

			// Eat any glyph the head overlaps (head center in viewport px).
			const hx = nextHead.x * CELL + CELL / 2;
			const hy = topInset + nextHead.y * CELL + CELL / 2;
			const positions = liveCollectiblePositions(
				layoutRef.current,
				isCollectedRef.current,
			);
			for (const p of positions) {
				if (Math.hypot(p.x - hx, p.y - hy) < EAT_RADIUS) {
					grow.current += 1;
					collectRef.current(p.id);
				}
			}

			paint();
		};

		paint();
		const interval = window.setInterval(tick, TICK_MS);
		return () => {
			window.clearInterval(interval);
			window.removeEventListener("keydown", onKeyDown);
			window.removeEventListener("keyup", onKeyUp);
			if (layer) layer.replaceChildren();
		};
	}, [active, hasKeyboard]);

	if (!active || !hasKeyboard) return null;

	return <div ref={layerRef} className={classes.layer} aria-hidden="true" />;
}
