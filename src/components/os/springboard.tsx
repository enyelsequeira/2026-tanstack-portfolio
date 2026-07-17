import { type ComponentType, useState } from "react";
import { AboutApp } from "./apps/about-app";
import { BlogApp } from "./apps/blog-app";
import { ContactApp } from "./apps/contact-app";
import { ProjectsApp } from "./apps/projects-app";
import { TerminalApp } from "./apps/terminal-app";
import { APPS, getApp } from "./registry";
import classes from "./springboard.module.css";
import type { AppId } from "./types";
import { WindowManagerProvider } from "./window-manager";

const APP_COMPONENTS: Record<AppId, ComponentType> = {
	about: AboutApp,
	projects: ProjectsApp,
	blog: BlogApp,
	contact: ContactApp,
	terminal: TerminalApp,
};

export function Springboard() {
	const [openApp, setOpenApp] = useState<AppId | null>(null);
	const AppContent = openApp ? APP_COMPONENTS[openApp] : null;

	return (
		<WindowManagerProvider>
			<div className={classes.screen}>
				<div className={classes.wallpaper} aria-hidden="true" />
				<header className={classes.statusBar}>⏻ EnyelOS</header>

				<div className={classes.grid}>
					{APPS.map((app) => (
						<button
							key={app.id}
							type="button"
							className={classes.icon}
							onClick={() => setOpenApp(app.id)}
							aria-label={`Open ${app.title}`}
						>
							<span className={classes.iconGlyph}>
								<app.icon size={30} stroke={1.5} />
							</span>
							<span className={classes.iconLabel}>{app.title}</span>
						</button>
					))}
				</div>

				{openApp && AppContent && (
					<div className={classes.sheet}>
						<header className={classes.sheetHeader}>
							<span className={classes.sheetTitle}>
								{getApp(openApp).title}
							</span>
							<button
								type="button"
								className={classes.closeButton}
								onClick={() => setOpenApp(null)}
								aria-label="Close app"
							>
								✕
							</button>
						</header>
						<div className={classes.sheetContent}>
							{openApp === "terminal" ? (
								<TerminalApp onOpenApp={setOpenApp} />
							) : (
								<AppContent />
							)}
						</div>
					</div>
				)}
			</div>
		</WindowManagerProvider>
	);
}
