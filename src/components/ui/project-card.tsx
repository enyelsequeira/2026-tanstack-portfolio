import { useGSAP } from "@gsap/react";
import { Box } from "@mantine/core";
import { gsap } from "gsap";
import { useRef } from "react";
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
	const cardRef = useRef<HTMLDivElement & HTMLAnchorElement>(null);
	const titleRef = useRef<HTMLHeadingElement>(null);

	useGSAP(
		() => {
			const card = cardRef.current;
			const title = titleRef.current;
			if (!card) return;

			const reduced = window.matchMedia(
				"(hover: none), (max-width: 768px), (prefers-reduced-motion: reduce)",
			).matches;
			if (reduced) return;

			const rotXTo = gsap.quickTo(card, "rotateX", {
				duration: 0.4,
				ease: "power3.out",
			});
			const rotYTo = gsap.quickTo(card, "rotateY", {
				duration: 0.4,
				ease: "power3.out",
			});
			const titleZTo = title
				? gsap.quickTo(title, "z", { duration: 0.4, ease: "power3.out" })
				: null;

			let rect: DOMRect | null = null;

			const onEnter = () => {
				rect = card.getBoundingClientRect();
				card.dataset.cursor = "card";
				gsap.set(card, {
					transformStyle: "preserve-3d",
					willChange: "transform",
				});
			};
			const onMove = (e: MouseEvent) => {
				if (!rect) return;
				const x = (e.clientX - rect.left) / rect.width - 0.5;
				const y = (e.clientY - rect.top) / rect.height - 0.5;
				rotXTo(-y * 12);
				rotYTo(x * 12);
				titleZTo?.(20);
			};
			const onLeave = () => {
				rect = null;
				delete card.dataset.cursor;
				rotXTo(0);
				rotYTo(0);
				titleZTo?.(0);
				gsap.set(card, { willChange: "auto" });
			};

			card.addEventListener("mouseenter", onEnter);
			card.addEventListener("mousemove", onMove);
			card.addEventListener("mouseleave", onLeave);
			return () => {
				card.removeEventListener("mouseenter", onEnter);
				card.removeEventListener("mousemove", onMove);
				card.removeEventListener("mouseleave", onLeave);
			};
		},
		{ scope: cardRef },
	);

	if (project.featured) {
		return (
			<Box ref={cardRef} className={`${classes.card} ${classes.featured}`}>
				<div>
					<div className={classes.number}>{project.number}</div>
					<h3 ref={titleRef} className={classes.title}>
						{project.title}
					</h3>
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
			ref={cardRef}
			component="a"
			href={project.href}
			target="_blank"
			rel="noopener noreferrer"
			className={classes.card}
			style={{ textDecoration: "none" }}
		>
			<div className={classes.number}>{project.number}</div>
			<h3 ref={titleRef} className={classes.title}>
				{project.title}
			</h3>
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
