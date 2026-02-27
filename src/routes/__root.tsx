import type { CSSVariablesResolver } from "@mantine/core";
import {
	ColorSchemeScript,
	createTheme,
	DEFAULT_THEME,
	MantineProvider,
	mantineHtmlProps,
} from "@mantine/core";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import ConvexProvider from "../integrations/convex/provider";

import appCss from "../styles.css?url";

const theme = createTheme({
	primaryColor: "brand",
	primaryShade: 5,
	fontFamily: `Outfit, ${DEFAULT_THEME.fontFamily}`,
	fontFamilyMonospace: `DM Mono, ${DEFAULT_THEME.fontFamilyMonospace}`,
	headings: {
		fontFamily: `DM Serif Display, ${DEFAULT_THEME.headings.fontFamily}`,
	},
	colors: {
		brand: [
			"#EEF2FF",
			"#E0E7FF",
			"#C7D2FE",
			"#A5B4FC",
			"#818CF8",
			"#6366F1", // 5 — indigo/pulse
			"#4F46E5",
			"#4338CA",
			"#3730A3",
			"#2563EB", // 9 — electric blue
		],
		obsidian: [
			"#F5F5F5", // 0 — silk white
			"#E2E8F0",
			"#CBD5E1",
			"#94A3B8", // 3 — slate/mist
			"#475569",
			"#334155",
			"#1C1C1C", // 6 — elevated
			"#161616", // 7 — surface
			"#111111",
			"#0F0F0F", // 9 — obsidian base
		],
	},
});

const cssVariablesResolver: CSSVariablesResolver = () => ({
	variables: {
		"--color-border": "rgba(148, 163, 184, 0.12)",
		"--color-bg": "#0F0F0F",
		"--color-surface": "#161616",
		"--color-elevated": "#1C1C1C",
		"--color-text-primary": "#F5F5F5",
		"--color-text-muted": "#94A3B8",
		"--color-accent-primary": "#2563EB",
		"--color-accent-secondary": "#6366F1",
	},
	dark: {},
	light: {},
});

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Enyel Sequeira —  Frontend Engineer" },
			{
				name: "description",
				content:
					"Frontend Engineer building scalable interfaces and design systems. 5+ years across gaming, Web3, and EdTech.",
			},
		],
		links: [
			{ rel: "icon", href: "/enyel-logo.png", type: "image/png" },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@300;400;500&family=Outfit:wght@300;400;500;600;700&display=swap",
			},
			{ rel: "stylesheet", href: appCss },
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" {...mantineHtmlProps}>
			<head>
				<HeadContent />
				<ColorSchemeScript forceColorScheme="dark" />
			</head>
			<body>
				<MantineProvider
					theme={theme}
					forceColorScheme="dark"
					cssVariablesResolver={cssVariablesResolver}
				>
					<ConvexProvider>{children}</ConvexProvider>
					<Scripts />
				</MantineProvider>
			</body>
		</html>
	);
}
