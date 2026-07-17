import type { Collectible } from "@/lib/game/types";

/**
 * The Explorer Mode scavenger hunt items. Each one floats in a section and,
 * when collected, reveals a personality nugget in the stash.
 *
 * These are meant to be edited freely — swap in your own facts. Just keep the
 * `anchor` values pointing at section ids that exist on the homepage
 * (stats, work, about, experience, contact) and `x`/`y` between 0 and 1.
 */
export const COLLECTIBLES: Collectible[] = [
	{
		id: "braces",
		glyph: "{ }",
		title: "Brace yourself",
		body: "I genuinely enjoy refactoring more than writing new code. A clean diff is its own reward.",
		anchor: "stats",
		x: 0.08,
		y: 0.3,
	},
	{
		id: "curiosity",
		glyph: "?",
		title: "Still curious",
		body: "Currently learning Rust on weekends — slowly, and badly, but learning.",
		anchor: "stats",
		x: 0.92,
		y: 0.72,
	},
	{
		id: "tag",
		glyph: "</>",
		title: "Where it started",
		body: "The first site I ever shipped was a fan page. We all start somewhere.",
		anchor: "work",
		x: 0.1,
		y: 0.22,
	},
	{
		id: "semicolon",
		glyph: ";",
		title: "Semicolon",
		body: "I have strong opinions about semicolons. I will not be sharing them here.",
		anchor: "work",
		x: 0.9,
		y: 0.78,
	},
	{
		id: "lambda",
		glyph: "λ",
		title: "Lambda",
		body: "Functional programming quietly rewired how I think about state.",
		anchor: "about",
		x: 0.12,
		y: 0.35,
	},
	{
		id: "coffee",
		glyph: "☕",
		title: "Fuel",
		body: "Flat white, no sugar. The codebase runs on it.",
		anchor: "about",
		x: 0.88,
		y: 0.68,
	},
	{
		id: "command",
		glyph: "⌘",
		title: "Muscle memory",
		body: "First thing on any new machine: rebind caps-lock to escape.",
		anchor: "experience",
		x: 0.9,
		y: 0.4,
	},
	{
		id: "star",
		glyph: "★",
		title: "You made it",
		body: "You found them all. If we work together, this is the kind of attention to detail you get.",
		anchor: "contact",
		x: 0.15,
		y: 0.4,
	},
];

export const TOTAL_COLLECTIBLES = COLLECTIBLES.length;
