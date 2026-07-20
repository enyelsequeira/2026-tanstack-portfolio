import { useValue } from "@legendapp/state/react";
import { Group, Text, UnstyledButton } from "@mantine/core";
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
		<Group
			component="header"
			className={classes.bar}
			h="var(--os-menubar-height)"
			px={16}
			gap={18}
			align="center"
			wrap="nowrap"
			ff="monospace"
			fz={12}
			c="obsidian.0"
		>
			<UnstyledButton
				className={classes.brand}
				onClick={onShutdown}
				aria-label="Shut down EnyelOS"
				title="Shut down"
				fw={500}
				fz={12}
				ff="monospace"
				lts="0.04em"
			>
				⏻ EnyelOS
			</UnstyledButton>
			<Text ff="monospace" fz={12} c="obsidian.3">
				{focused ? getApp(focused).title : "Desktop"}
			</Text>
			<Text
				ff="monospace"
				fz={12}
				c="obsidian.3"
				ml="auto"
				style={{ fontVariantNumeric: "tabular-nums" }}
				suppressHydrationWarning
			>
				{now}
			</Text>
		</Group>
	);
}
