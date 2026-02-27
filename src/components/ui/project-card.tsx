import { Box } from "@mantine/core";
import type { Project } from "@/data/projects";
import classes from "./project-card.module.css";
import { TechTag } from "./tech-tag";

type ProjectCardProps = {
	project: Project;
};

function getTagVariant(tech: string): "blue" | "indigo" | "slate" {
	const blueItems = ["React", "TypeScript", "Next.js", "Solana"];
	const indigoItems = ["Web3", "TanStack Start", "SSR"];
	if (blueItems.includes(tech)) return "blue";
	if (indigoItems.includes(tech)) return "indigo";
	return "slate";
}

export function ProjectCard({ project }: ProjectCardProps) {
	if (project.featured) {
		return (
			<Box className={`${classes.card} ${classes.featured}`}>
				<div>
					<div className={classes.number}>{project.number}</div>
					<h3 className={classes.title}>{project.title}</h3>
					<p className={classes.description}>{project.description}</p>
					<div className={classes.tags}>
						{project.tech.map((t) => (
							<TechTag key={t} label={t} variant={getTagVariant(t)} />
						))}
					</div>
				</div>
				{project.highlights && (
					<div className={classes.highlights}>
						<div className={classes.roleHeader}>
							<span className={classes.roleTitle}>{project.role}</span>
							<span className={classes.rolePeriod}>{project.period}</span>
						</div>
						<ul className={classes.highlightsList}>
							{project.highlights.map((h) => (
								<li key={h} className={classes.highlightItem}>
									{h}
								</li>
							))}
						</ul>
					</div>
				)}
			</Box>
		);
	}

	return (
		<Box
			component="a"
			href={project.href}
			target="_blank"
			rel="noopener noreferrer"
			className={classes.card}
			style={{ textDecoration: "none" }}
		>
			<div className={classes.number}>{project.number}</div>
			<h3 className={classes.title}>{project.title}</h3>
			<p className={classes.description}>{project.description}</p>
			<div className={classes.tags}>
				{project.tech.map((t) => (
					<TechTag key={t} label={t} variant={getTagVariant(t)} />
				))}
			</div>
			<span className={classes.link}>
				{project.linkLabel}
				<span className={classes.arrow}>→</span>
			</span>
		</Box>
	);
}
