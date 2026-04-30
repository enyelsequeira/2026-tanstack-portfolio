export const ease = {
	out: "power3.out",
	soft: "power2.out",
	snap: "back.out(1.4)",
} as const;

export const duration = {
	fast: 0.4,
	base: 0.8,
	slow: 1.2,
} as const;
