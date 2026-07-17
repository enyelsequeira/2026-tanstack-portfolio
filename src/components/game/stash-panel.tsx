import { COLLECTIBLES, TOTAL_COLLECTIBLES } from "@/data/collectibles";
import { useGame } from "@/lib/game/game-context";
import { formatClock } from "@/lib/game/timer";
import classes from "./stash-panel.module.css";

export function StashPanel() {
	const {
		stashOpen,
		setStashOpen,
		isCollected,
		collectedCount,
		allFound,
		reset,
		bestTimes,
	} = useGame();

	if (!stashOpen) return null;

	const progress = Math.round((collectedCount / TOTAL_COLLECTIBLES) * 100);

	return (
		<div className={classes.overlay}>
			<button
				type="button"
				className={classes.backdrop}
				onClick={() => setStashOpen(false)}
				aria-label="Close stash"
			/>
			<aside className={classes.panel} aria-label="Explorer stash">
				<header className={classes.header}>
					<div>
						<p className={classes.kicker}>
							<span className={classes.caret}>{">"}</span> stash
						</p>
						<h2 className={classes.heading}>
							{collectedCount}/{TOTAL_COLLECTIBLES} found
						</h2>
					</div>
					<button
						type="button"
						className={classes.close}
						onClick={() => setStashOpen(false)}
						aria-label="Close stash"
					>
						✕
					</button>
				</header>

				<div className={classes.bar} aria-hidden="true">
					<span className={classes.fill} style={{ width: `${progress}%` }} />
				</div>

				<dl className={classes.bests}>
					<div className={classes.best}>
						<dt>classic best</dt>
						<dd>
							{bestTimes.classic == null ? "—" : formatClock(bestTimes.classic)}
						</dd>
					</div>
					<div className={classes.best}>
						<dt>snake best</dt>
						<dd>
							{bestTimes.snake == null ? "—" : formatClock(bestTimes.snake)}
						</dd>
					</div>
				</dl>

				{allFound && (
					<div className={classes.complete}>
						<pre className={classes.ascii}>
							{"┌─ 100% ─┐\n│  ✓ ✓ ✓  │\n└─────────┘"}
						</pre>
						<p>
							You found everything. Thanks for poking around — that curiosity is
							exactly what I bring to a codebase.
						</p>
					</div>
				)}

				<ul className={classes.list}>
					{COLLECTIBLES.map((c) => {
						const found = isCollected(c.id);
						return (
							<li
								key={c.id}
								className={classes.item}
								data-found={found || undefined}
							>
								<span className={classes.itemGlyph}>
									{found ? c.glyph : "?"}
								</span>
								<span className={classes.itemText}>
									<span className={classes.itemTitle}>
										{found ? c.title : "Undiscovered"}
									</span>
									<span className={classes.itemBody}>
										{found ? c.body : "Keep exploring to reveal this one."}
									</span>
								</span>
							</li>
						);
					})}
				</ul>

				{collectedCount > 0 && (
					<button type="button" className={classes.reset} onClick={reset}>
						reset hunt
					</button>
				)}
			</aside>
		</div>
	);
}
