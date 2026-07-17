import { useMediaQuery } from "@mantine/hooks";
import { type ComponentType, useEffect, useState } from "react";
import { AboutApp } from "./apps/about-app";
import { BlogApp } from "./apps/blog-app";
import { ContactApp } from "./apps/contact-app";
import { ProjectsApp } from "./apps/projects-app";
import { TerminalApp } from "./apps/terminal-app";
import { BootScreen } from "./boot-screen";
import classes from "./desktop.module.css";
import { Dock } from "./dock";
import { MenuBar } from "./menu-bar";
import { APPS } from "./registry";
import { Springboard } from "./springboard";
import type { AppId } from "./types";
import { OsWindowFrame } from "./window";
import { useWindowManager, WindowManagerProvider } from "./window-manager";

const APP_COMPONENTS: Record<AppId, ComponentType> = {
	about: AboutApp,
	projects: ProjectsApp,
	blog: BlogApp,
	contact: ContactApp,
	terminal: TerminalApp,
};

const DESKTOP_ICON_IDS: AppId[] = ["about", "projects", "blog", "terminal"];
const BOOT_KEY = "enyelos-booted";

export function Desktop() {
	const isMobile = useMediaQuery("(max-width: 62em)", false, {
		getInitialValueInEffect: false,
	});

	if (isMobile) return <Springboard />;
	return (
		<WindowManagerProvider>
			<DesktopShell />
		</WindowManagerProvider>
	);
}

type BootPhase = "pending" | "booting" | "done";

function DesktopShell() {
	const { state, open } = useWindowManager();
	const [boot, setBoot] = useState<BootPhase>("pending");

	useEffect(() => {
		if (sessionStorage.getItem(BOOT_KEY)) {
			setBoot("done");
		} else {
			setBoot("booting");
		}
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: welcome window opens exactly once, when boot completes
	useEffect(() => {
		if (boot === "done" && state.windows.length === 0) open("about");
	}, [boot]);

	const finishBoot = () => {
		sessionStorage.setItem(BOOT_KEY, "1");
		setBoot("done");
	};

	return (
		<div className={classes.desktop}>
			<div className={classes.wallpaper} aria-hidden="true">
				<div className={classes.blobIndigo} />
				<div className={classes.blobBlue} />
				<div className={classes.grain} />
			</div>

			<MenuBar />

			<div className={classes.icons}>
				{DESKTOP_ICON_IDS.map((id) => {
					const app = APPS.find((a) => a.id === id);
					if (!app) return null;
					return (
						<button
							key={app.id}
							type="button"
							className={classes.desktopIcon}
							onDoubleClick={() => open(app.id)}
							aria-label={`Open ${app.title}`}
						>
							<span className={classes.desktopIconGlyph}>
								<app.icon size={30} stroke={1.5} />
							</span>
							<span className={classes.desktopIconLabel}>{app.title}</span>
						</button>
					);
				})}
			</div>

			{state.windows.map((win) => {
				const AppContent = APP_COMPONENTS[win.appId];
				return (
					<OsWindowFrame key={win.appId} win={win}>
						<AppContent />
					</OsWindowFrame>
				);
			})}

			<Dock />

			{boot === "booting" && <BootScreen onDone={finishBoot} />}
		</div>
	);
}
