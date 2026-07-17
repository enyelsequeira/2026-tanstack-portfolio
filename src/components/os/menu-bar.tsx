import { useEffect, useState } from "react";
import classes from "./menu-bar.module.css";
import { getApp } from "./registry";
import { selectFocusedApp, useWindowManager } from "./window-manager";

function formatClock(date: Date): string {
	return date.toLocaleString("en-US", {
		weekday: "short",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function MenuBar() {
	const { state } = useWindowManager();
	const focused = selectFocusedApp(state);
	const [now, setNow] = useState<string>("");

	useEffect(() => {
		setNow(formatClock(new Date()));
		const interval = setInterval(() => setNow(formatClock(new Date())), 30_000);
		return () => clearInterval(interval);
	}, []);

	return (
		<header className={classes.bar}>
			<span className={classes.brand}>⏻ EnyelOS</span>
			<span className={classes.appTitle}>
				{focused ? getApp(focused).title : "Desktop"}
			</span>
			<span className={classes.clock} suppressHydrationWarning>
				{now}
			</span>
		</header>
	);
}
