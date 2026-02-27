export type SkillCategory = {
	label: string;
	skills: string[];
};

export const skillCategories: SkillCategory[] = [
	{
		label: "Frontend",
		skills: ["React", "Vue", "Svelte", "UI Frameworks"],
	},
	{
		label: "Backend",
		skills: ["Node.js", "Python", "Java(Learning)"],
	},
	{
		label: "Data & Cloud",
		skills: ["PostgreSQL", "SQL", "Mongo", "Cloudflare Workers", "Vercel"],
	},
	{
		label: "Web3",
		skills: ["Solana", "Solidity"],
	},
	{
		label: "AI & Agents",
		skills: ["LLM Agents", "MCP Servers", "AI Tooling"],
	},
];

export const techTags = [
	{ label: "TypeScript", variant: "blue" as const },
	{ label: "React", variant: "blue" as const },
	{ label: "AI Agents", variant: "indigo" as const },
	{ label: "Web3", variant: "indigo" as const },
	{ label: "UI/UX Design", variant: "slate" as const },
	{ label: "UI Frameworks", variant: "slate" as const },
];
