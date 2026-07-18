import { useValue } from "@legendapp/state/react";
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
import { prefersReducedMotion } from "./motion";
import { APPS } from "./registry";
import { Springboard } from "./springboard";
import type { AppId } from "./types";
import { OsWindowFrame } from "./window";
import { openWindow, resetWindowStore, windowStore$ } from "./window-store";

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
	// resolved in an effect: server and first client render agree (desktop),
	// so hydration never mismatches; phones swap to the springboard one
	// commit later, before boot starts (bootReady gates it)
	const isMobile = useMediaQuery("(max-width: 62em)");
	const [power, setPower] = useState<"on" | "off">("on");
	const [session, setSession] = useState(0);

	if (isMobile) return <Springboard />;

	if (power === "off") {
		return (
			<div className={classes.powerOff}>
				<button
					type="button"
					className={classes.powerOnButton}
					onClick={() => {
						sessionStorage.removeItem(BOOT_KEY);
						resetWindowStore();
						setSession((s) => s + 1);
						setPower("on");
					}}
					aria-label="Power on EnyelOS"
				>
					⏻
				</button>
			</div>
		);
	}

	return (
		<DesktopShell
			key={session}
			bootReady={!isMobile}
			onShutdown={() => setPower("off")}
		/>
	);
}

type BootPhase = "pending" | "booting" | "done";

function DesktopShell({
	bootReady,
	onShutdown,
}: {
	bootReady: boolean;
	onShutdown: () => void;
}) {
	const order = useValue(windowStore$.order);
	const [boot, setBoot] = useState<BootPhase>("pending");

	useEffect(() => {
		if (!bootReady) return;
		// reduced-motion users skip the boot animation entirely, so the
		// BootScreen never mounts and never has to notify us from an effect
		if (sessionStorage.getItem(BOOT_KEY) || prefersReducedMotion()) {
			setBoot("done");
		} else {
			setBoot("booting");
		}
	}, [bootReady]);

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

			<MenuBar onShutdown={onShutdown} />

			<div className={classes.icons}>
				{DESKTOP_ICON_IDS.map((id) => {
					const app = APPS.find((a) => a.id === id);
					if (!app) return null;
					return (
						<button
							key={app.id}
							type="button"
							className={classes.desktopIcon}
							onClick={() => openWindow(app.id)}
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

			{order.map((appId) => {
				const AppContent = APP_COMPONENTS[appId];
				return (
					<OsWindowFrame key={appId} appId={appId}>
						<AppContent />
					</OsWindowFrame>
				);
			})}

			<Dock />

			{boot === "booting" && <BootScreen onDone={finishBoot} />}
		</div>
	);
}
