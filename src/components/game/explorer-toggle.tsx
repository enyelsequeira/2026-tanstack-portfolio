import { useEffect, useState } from "react";
import { TOTAL_COLLECTIBLES } from "@/data/collectibles";
import { useGame } from "@/lib/game/game-context";
import { formatClock } from "@/lib/game/timer";
import classes from "./explorer-toggle.module.css";

export function ExplorerToggle() {
	const {
		enabled,
		collectedCount,
		allFound,
		toggleEnabled,
		setStashOpen,
		mode,
		setMode,
		elapsedMs,
	} = useGame();
	const [booting, setBooting] = useState(false);
	const [hasKeyboard, setHasKeyboard] = useState(false);
	const [hint, setHint] = useState(false);

	useEffect(() => {
		setHasKeyboard(!window.matchMedia("(hover: none)").matches);
	}, []);

	// Brief "boot" flash when the user switches the mode on.
	useEffect(() => {
		if (!enabled) return;
		setBooting(true);
		const t = window.setTimeout(() => setBooting(false), 650);
		return () => window.clearTimeout(t);
	}, [enabled]);

	// Flash a controls hint briefly when snake mode turns on.
	useEffect(() => {
		if (!enabled || mode !== "snake") return;
		setHint(true);
		const t = window.setTimeout(() => setHint(false), 2200);
		return () => window.clearTimeout(t);
	}, [enabled, mode]);

	if (!enabled) {
		return (
			<div className={classes.dock}>
				<button
					type="button"
					className={classes.prompt}
					onClick={toggleEnabled}
					aria-label="Turn on explorer mode — a hidden scavenger hunt"
				>
					<span className={classes.caret}>{">"}</span>
					<span className={classes.cmd}>explorer_mode</span>
					<span className={classes.flag}>--off</span>
					<span className={classes.blink} aria-hidden="true" />
				</button>
			</div>
		);
	}

	return (
		<div className={classes.dock}>
			<div className={classes.hud} data-booting={booting || undefined}>
				{booting ? (
					<span className={classes.booting}>booting explorer…</span>
				) : (
					<>
						{hasKeyboard && (
							<div className={classes.modes}>
								<button
									type="button"
									className={classes.mode}
									data-active={mode === "classic" || undefined}
									aria-pressed={mode === "classic"}
									onClick={() => setMode("classic")}
								>
									classic
								</button>
								<button
									type="button"
									className={classes.mode}
									data-active={mode === "snake" || undefined}
									aria-pressed={mode === "snake"}
									onClick={() => setMode("snake")}
								>
									snake
								</button>
							</div>
						)}
						<span className={classes.timer} role="timer" aria-label="Run time">
							{formatClock(elapsedMs)}
						</span>
						<button
							type="button"
							className={classes.count}
							onClick={() => setStashOpen(true)}
							aria-label="Open your stash of found items"
						>
							<span className={classes.caret}>{">"}</span>
							<span className={classes.label}>
								{allFound ? "all found" : "found"}
							</span>
							<span
								className={classes.score}
								data-complete={allFound || undefined}
							>
								{collectedCount}/{TOTAL_COLLECTIBLES}
							</span>
						</button>
						<button
							type="button"
							className={classes.power}
							onClick={toggleEnabled}
							aria-label="Turn off explorer mode"
							title="Turn off explorer mode"
						>
							✕
						</button>
						{hint && mode === "snake" && (
							<span className={classes.hint}>↑↓←→ / WASD to drive</span>
						)}
					</>
				)}
			</div>
		</div>
	);
}
