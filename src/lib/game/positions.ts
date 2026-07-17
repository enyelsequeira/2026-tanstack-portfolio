import { COLLECTIBLES } from "@/data/collectibles";
import type { Layout } from "@/lib/game/game-context";

export type RectLike = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export type ScreenPos = { id: string; x: number; y: number };

/** Map a collectible's normalized (x, y) into viewport pixels within a rect. */
export function anchorPoint(
	rect: RectLike,
	x: number,
	y: number,
): { x: number; y: number } {
	return { x: rect.left + x * rect.width, y: rect.top + y * rect.height };
}

/**
 * Current viewport positions of every un-collected collectible whose anchor
 * section is in the DOM. Reads layout (section + normalized offset) and the
 * live rect of each anchor, so positions track page scroll. Browser-only.
 */
export function liveCollectiblePositions(
	layout: Layout,
	isCollected: (id: string) => boolean,
): ScreenPos[] {
	const out: ScreenPos[] = [];
	for (const c of COLLECTIBLES) {
		if (isCollected(c.id)) continue;
		const pos = layout[c.id] ?? { anchor: c.anchor, x: c.x, y: c.y };
		const anchor = document.getElementById(pos.anchor);
		if (!anchor) continue;
		const rect = anchor.getBoundingClientRect();
		const point = anchorPoint(rect, pos.x, pos.y);
		out.push({ id: c.id, x: point.x, y: point.y });
	}
	return out;
}
