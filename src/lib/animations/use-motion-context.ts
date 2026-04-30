import { gsap } from "gsap";

/**
 * Conditions used by every section's matchMedia block. Any caller
 * that adds animations should branch on these two keys so behavior
 * stays consistent across the site.
 */
export const motionConditions = {
	full: "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
	reveal: "(max-width: 768px), (prefers-reduced-motion: reduce)",
} as const;

export type MotionConditionKey = keyof typeof motionConditions;

/**
 * Wraps gsap.matchMedia with the project's standard breakpoints.
 * Pass a callback that receives the matched conditions object;
 * inside, do `if (conditions.full) { ... }` or `if (conditions.reveal) { ... }`.
 */
export function createMotionContext(
	scope: Element | null,
	setup: (mm: gsap.MatchMedia) => void,
) {
	const mm = gsap.matchMedia(scope ?? undefined);
	setup(mm);
	return mm;
}
