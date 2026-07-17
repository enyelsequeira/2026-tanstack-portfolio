export type Collectible = {
	/** Stable unique id, also used as the localStorage key entry. */
	id: string;
	/** The glyph shown floating in the page. */
	glyph: string;
	/** Short headline shown when collected. */
	title: string;
	/** The personality nugget revealed on pickup. */
	body: string;
	/** Section id this collectible is anchored to (must exist in the DOM). */
	anchor: string;
	/** Horizontal position within the anchor, 0 (left) to 1 (right). */
	x: number;
	/** Vertical position within the anchor, 0 (top) to 1 (bottom). */
	y: number;
};
