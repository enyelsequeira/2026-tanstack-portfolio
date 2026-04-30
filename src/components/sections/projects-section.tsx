import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import { gsap } from "gsap";
import { useRef } from "react";
import { ProjectCard } from "@/components/ui/project-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { projects } from "@/data/projects";
import classes from "./projects-section.module.css";

export function ProjectsSection() {
	const sectionRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const grid = gridRef.current;
			const root = sectionRef.current;
			if (!grid || !root) return;

			const cards = Array.from(grid.children) as HTMLElement[];
			const reduced = window.matchMedia(
				"(max-width: 768px), (prefers-reduced-motion: reduce)",
			).matches;

			gsap.from(cards, {
				opacity: 0,
				y: reduced ? 16 : 32,
				duration: reduced ? 0.5 : 0.8,
				ease: "power3.out",
				stagger: reduced ? 0.08 : 0.1,
				scrollTrigger: {
					trigger: root,
					start: reduced ? "top 90%" : "top 80%",
					once: true,
				},
			});
		},
		{ scope: sectionRef },
	);

	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
			<SectionWrapper id="work">
				<div ref={sectionRef} className={classes.section}>
					<SectionLabel>Work</SectionLabel>
					<div ref={gridRef} className={classes.grid}>
						{projects.map((project) => (
							<ProjectCard key={project.id} project={project} />
						))}
					</div>
				</div>
			</SectionWrapper>
		</Container>
	);
}
