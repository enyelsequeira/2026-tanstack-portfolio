import { useEffect } from "react";
import { useGame } from "@/lib/game/game-context";
import classes from "./reveal-toast.module.css";

export function RevealToast() {
	const { recent, clearRecent } = useGame();

	useEffect(() => {
		if (!recent) return;
		const t = window.setTimeout(clearRecent, 4000);
		return () => window.clearTimeout(t);
	}, [recent, clearRecent]);

	if (!recent) return null;

	return (
		<button
			type="button"
			className={classes.toast}
			onClick={clearRecent}
			aria-label="Dismiss"
		>
			<span className={classes.glyph}>{recent.glyph}</span>
			<span className={classes.text}>
				<span className={classes.title}>{recent.title}</span>
				<span className={classes.body}>{recent.body}</span>
			</span>
		</button>
	);
}
