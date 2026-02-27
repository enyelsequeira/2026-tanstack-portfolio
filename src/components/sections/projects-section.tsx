import { Container } from "@mantine/core";
import { ProjectCard } from "@/components/ui/project-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { projects } from "@/data/projects";
import classes from "./projects-section.module.css";

export function ProjectsSection() {
	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
			<SectionWrapper id="work">
				<div className={classes.section}>
					<SectionLabel>Work</SectionLabel>
					<div className={classes.grid}>
						{projects.map((project) => (
							<ProjectCard key={project.id} project={project} />
						))}
					</div>
				</div>
			</SectionWrapper>
		</Container>
	);
}
