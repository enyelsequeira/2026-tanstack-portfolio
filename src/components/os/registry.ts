import {
	IconFolder,
	IconMail,
	IconNotebook,
	type IconProps,
	IconTerminal2,
	IconUser,
} from "@tabler/icons-react";
import type { AppId, Rect } from "./types";

export type AppDefinition = {
	id: AppId;
	title: string;
	icon: React.ForwardRefExoticComponent<
		IconProps & React.RefAttributes<SVGSVGElement>
	>;
	defaultRect: Rect;
};

export const APPS: AppDefinition[] = [
	{
		id: "about",
		title: "About Me",
		icon: IconUser,
		defaultRect: { x: 120, y: 80, width: 640, height: 520 },
	},
	{
		id: "projects",
		title: "Projects",
		icon: IconFolder,
		defaultRect: { x: 200, y: 120, width: 720, height: 560 },
	},
	{
		id: "blog",
		title: "Blog",
		icon: IconNotebook,
		defaultRect: { x: 260, y: 100, width: 760, height: 580 },
	},
	{
		id: "contact",
		title: "Contact",
		icon: IconMail,
		defaultRect: { x: 320, y: 160, width: 520, height: 420 },
	},
	{
		id: "terminal",
		title: "Terminal",
		icon: IconTerminal2,
		defaultRect: { x: 380, y: 200, width: 600, height: 400 },
	},
];

export function getApp(id: AppId): AppDefinition {
	const app = APPS.find((a) => a.id === id);
	if (!app) throw new Error(`Unknown app: ${id}`);
	return app;
}
