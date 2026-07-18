import { useValue } from "@legendapp/state/react";
import { useEffect, useState } from "react";
import classes from "./menu-bar.module.css";
import { getApp } from "./registry";
import { selectFocusedApp } from "./window-store";

function formatClock(date: Date): string {
	return date.toLocaleString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function MenuBar({ onShutdown }: { onShutdown?: () => void }) {
	const focused = useValue(selectFocusedApp);
	const [now, setNow] = useState<string>("");

	useEffect(() => {
		setNow(formatClock(new Date()));
		const interval = setInterval(() => setNow(formatClock(new Date())), 30_000);
		return () => clearInterval(interval);
	}, []);

	return (
		<header className={classes.bar}>
			<button
				type="button"
				className={classes.brand}
				onClick={onShutdown}
				aria-label="Shut down EnyelOS"
				title="Shut down"
			>
				⏻ EnyelOS
			</button>
			<span className={classes.appTitle}>
				{focused ? getApp(focused).title : "Desktop"}
			</span>
			<span className={classes.clock} suppressHydrationWarning>
				{now}
			</span>
		</header>
	);
}
