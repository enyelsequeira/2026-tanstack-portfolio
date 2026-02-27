export type Project = {
	id: string;
	number: string;
	title: string;
	description: string;
	tech: string[];
	href?: string;
	linkLabel: string;
	featured: boolean;
	role?: string;
	period?: string;
	highlights?: string[];
};

export const projects: Project[] = [
	{
		id: "omegasys",
		number: "01 — Current Role",
		title: "OmegaSys",
		description:
			"Senior Frontend Engineer at a gaming-industry company in Lisbon, leading the design system and frontend architecture across multiple brand properties.",
		tech: ["React", "TypeScript", "Mantine", "Design Systems"],
		linkLabel: "",
		featured: true,
		role: "Senior Frontend Engineer",
		period: "Sep 2022 — Present",
		highlights: [
			"Architected a comprehensive UI design system that standardized components across multiple brand properties, reducing development time",
			"Spearheaded performance optimization resulting in significant improvements in Core Web Vitals and application speed",
			"Established frontend engineering best practices and documentation, improving code quality and team velocity",
			"Collaborated with C-level executives to define UI/UX strategies aligned with business objectives",
			"Orchestrated the integration of multiple payment systems while ensuring a seamless user experience",
		],
	},
	{
		id: "mirror-world",
		number: "02",
		title: "Mirror World Marketplace",
		description:
			"Led frontend development for an NFT marketplace on Solana at Rct.ai, Beijing. Built real-time trading interfaces and wallet integrations.",
		tech: ["Web3", "Solana", "React"],
		href: "https://www.mirrorworld.fun/",
		linkLabel: "View Project",
		featured: false,
	},
	{
		id: "jsmastery",
		number: "03",
		title: "JSMastery Collab",
		description:
			"Co-authored code for a tutorial that reached 2.1M+ views on YouTube. Built a full-stack application demonstrating modern React patterns.",
		tech: ["Next.js", "Open Source"],
		href: "https://www.youtube.com/watch?v=Wn_Kb3MR_cU&t=38s",
		linkLabel: "View on Youtube",
		featured: false,
	},
	{
		id: "tanstack-movies",
		number: "04",
		title: "TanStack Movies",
		description:
			"A movie discovery app built with TanStack Start, showcasing SSR, file-based routing, and modern data fetching patterns.",
		tech: ["TanStack Start", "TypeScript", "SSR"],
		href: "https://github.com/enyelsequeira/tanstack-movies",
		linkLabel: "View on GitHub",
		featured: false,
	},
];
