import {
	Box,
	Group,
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
	UnstyledButton,
} from "@mantine/core";
import { type ComponentType, useState } from "react";
import { AboutApp } from "./apps/about-app";
import { BlogApp } from "./apps/blog-app";
import { ContactApp } from "./apps/contact-app";
import { ProjectsApp } from "./apps/projects-app";
import { TerminalApp } from "./apps/terminal-app";
import { APPS, getApp } from "./registry";
import classes from "./springboard.module.css";
import type { AppId } from "./types";

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
		<Box pos="fixed" inset={0} bg="obsidian.9" style={{ overflow: "hidden" }}>
			<div className={classes.wallpaper} aria-hidden="true" />
			<Box
				component="header"
				pos="relative"
				pt={14}
				px={18}
				pb={8}
				ff="monospace"
				fz={12}
				c="obsidian.0"
			>
				⏻ EnyelOS
			</Box>

			<SimpleGrid
				cols={4}
				spacing={8}
				verticalSpacing={20}
				px={18}
				py={26}
				pos="relative"
			>
				{APPS.map((app) => (
					<UnstyledButton
						key={app.id}
						onClick={() => setOpenApp(app.id)}
						aria-label={`Open ${app.title}`}
						c="obsidian.0"
					>
						<Stack gap={6} align="center">
							<Box className={classes.iconGlyph}>
								<app.icon size={30} stroke={1.5} />
							</Box>
							<Text className={classes.iconLabel}>{app.title}</Text>
						</Stack>
					</UnstyledButton>
				))}
			</SimpleGrid>

			{openApp && AppContent && (
				<div className={classes.sheet}>
					<Group
						component="header"
						justify="space-between"
						align="center"
						wrap="nowrap"
						px={18}
						py={14}
						style={{ borderBottom: "1px solid var(--glass-border)" }}
					>
						<Text ff="monospace" fz={13} c="obsidian.0">
							{getApp(openApp).title}
						</Text>
						<button
							type="button"
							className={classes.closeButton}
							onClick={() => setOpenApp(null)}
							aria-label="Close app"
						>
							✕
						</button>
					</Group>
					<ScrollArea style={{ flex: 1 }}>
						{openApp === "terminal" ? (
							<TerminalApp onOpenApp={setOpenApp} />
						) : (
							<AppContent />
						)}
					</ScrollArea>
				</div>
			)}
		</Box>
	);
}
