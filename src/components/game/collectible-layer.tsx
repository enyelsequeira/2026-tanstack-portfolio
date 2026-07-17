import { useCallback, useEffect, useRef } from "react";
import { COLLECTIBLES } from "@/data/collectibles";
import { useGame } from "@/lib/game/game-context";
import classes from "./collectible-layer.module.css";

// Distance (px) at which a collectible starts leaning toward the cursor.
const PULL_RADIUS = 120;
// Distance (px) at which the magnetic cursor auto-grabs it.
const COLLECT_RADIUS = 30;

export function CollectibleLayer() {
	const { enabled, layout, collect, isCollected } = useGame();
	const layerRef = useRef<HTMLDivElement>(null);
	const nodes = useRef(new Map<string, HTMLButtonElement>());
	// Latest layout in a ref so the rAF loop picks up reshuffles without restarting.
	const layoutRef = useRef(layout);
	layoutRef.current = layout;
	const cursor = useRef({ x: -9999, y: -9999 });
	// Ids mid-collection so the rAF loop and click handler don't double-fire.
	const collecting = useRef(new Set<string>());

	// Pop the glyph, then commit the collection (which unmounts it).
	const grab = useCallback(
		(id: string, el: HTMLButtonElement) => {
			if (collecting.current.has(id) || isCollected(id)) return;
			collecting.current.add(id);
			el.dataset.grabbed = "true";
			window.setTimeout(() => {
				collect(id);
				collecting.current.delete(id);
			}, 320);
		},
		[collect, isCollected],
	);

	// Latest grab kept in a ref so the rAF loop can call it without restarting.
	const grabRef = useRef(grab);
	grabRef.current = grab;

	useEffect(() => {
		if (!enabled) return;

		const lite = window.matchMedia(
			"(hover: none), (prefers-reduced-motion: reduce)",
		).matches;

		const onMove = (e: MouseEvent) => {
			cursor.current.x = e.clientX;
			cursor.current.y = e.clientY;
		};

		if (!lite) {
			window.addEventListener("mousemove", onMove, { passive: true });
		}

		let raf = 0;
		const vh = () => window.innerHeight;

		const render = () => {
			const { x: cx, y: cy } = cursor.current;

			for (const c of COLLECTIBLES) {
				const el = nodes.current.get(c.id);
				if (!el || collecting.current.has(c.id)) continue;

				const pos = layoutRef.current[c.id] ?? {
					anchor: c.anchor,
					x: c.x,
					y: c.y,
				};
				const anchor = document.getElementById(pos.anchor);
				if (!anchor) {
					el.style.opacity = "0";
					el.style.pointerEvents = "none";
					continue;
				}

				const r = anchor.getBoundingClientRect();
				const baseX = r.left + pos.x * r.width;
				const baseY = r.top + pos.y * r.height;

				// Only show when its anchor spot is roughly on screen.
				const onScreen = baseY > -80 && baseY < vh() + 80;
				el.style.opacity = onScreen ? "1" : "0";
				el.style.pointerEvents = onScreen ? "auto" : "none";
				if (!onScreen) {
					el.dataset.near = "false";
					continue;
				}

				let tx = baseX;
				let ty = baseY;
				let scale = 1;
				let near = false;

				if (!lite) {
					const dx = cx - baseX;
					const dy = cy - baseY;
					const dist = Math.hypot(dx, dy);
					if (dist < PULL_RADIUS) {
						const pull = 1 - dist / PULL_RADIUS;
						tx = baseX + dx * pull * 0.5;
						ty = baseY + dy * pull * 0.5;
						scale = 1 + pull * 0.45;
						near = true;
						if (dist < COLLECT_RADIUS) {
							grabRef.current(c.id, el);
						}
					}
				}

				el.dataset.near = near ? "true" : "false";
				el.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%) scale(${scale})`;
			}

			raf = requestAnimationFrame(render);
		};

		raf = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("mousemove", onMove);
		};
	}, [enabled]);

	if (!enabled) return null;

	return (
		<div ref={layerRef} className={classes.layer} aria-hidden={false}>
			{COLLECTIBLES.map((c) =>
				isCollected(c.id) ? null : (
					<button
						key={c.id}
						type="button"
						ref={(node) => {
							if (node) nodes.current.set(c.id, node);
							else nodes.current.delete(c.id);
						}}
						className={classes.collectible}
						style={{ opacity: 0 }}
						aria-label={`Collect hidden item: ${c.title}`}
						onClick={(e) => grab(c.id, e.currentTarget)}
					>
						<span className={classes.glyph}>{c.glyph}</span>
						<span className={classes.ring} aria-hidden="true" />
					</button>
				),
			)}
		</div>
	);
}
