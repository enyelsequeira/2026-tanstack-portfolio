import { TechTag } from "@/components/ui/tech-tag";
import { projects } from "@/data/projects";
import classes from "./projects-app.module.css";

export function ProjectsApp() {
	return (
		<div className={classes.app}>
			{projects.map((project) => (
				<article key={project.id} className={classes.card}>
					<div className={classes.meta}>
						<span className={classes.number}>{project.number}</span>
						{project.period && (
							<span className={classes.period}>{project.period}</span>
						)}
					</div>
					<h2 className={classes.title}>{project.title}</h2>
					{project.role && <p className={classes.role}>{project.role}</p>}
					<p className={classes.description}>{project.description}</p>
					{project.highlights && (
						<ul className={classes.highlights}>
							{project.highlights.map((highlight) => (
								<li key={highlight}>{highlight}</li>
							))}
						</ul>
					)}
					<div className={classes.tags}>
						{project.tech.map((tech) => (
							<TechTag key={tech} label={tech} />
						))}
					</div>
					{project.href && (
						<a
							className={classes.link}
							href={project.href}
							target="_blank"
							rel="noopener noreferrer"
						>
							{project.linkLabel || "Visit"} →
						</a>
					)}
				</article>
			))}
		</div>
	);
}
