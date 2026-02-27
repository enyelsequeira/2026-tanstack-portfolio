import { Container } from "@mantine/core";
import { SectionLabel } from "@/components/ui/section-label";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { TechTag } from "@/components/ui/tech-tag";
import { experiences } from "@/data/experience";
import { skillCategories } from "@/data/skills";
import classes from "./about-section.module.css";

export function AboutSection() {
	return (
		<Container id={"about"} size={1100} px={{ base: 20, sm: 40 }}>
			<SectionWrapper>
				<div className={classes.section}>
					<SectionLabel>About</SectionLabel>

					<div className={classes.bioGrid}>
						<div className={classes.bioText}>
							<p>
								Full-stack developer from the US, now based in Lisbon, Portugal.
								Over five years of industry experience with a strong focus on
								frontend development — building pixel-perfect, performant
								experiences for web products and applications.
							</p>
							<p>
								I speak English, Spanish, Portuguese fluently and conversational
								Mandarin Chinese. Currently exploring Rust for JS tooling and
								Python for AI applications.
							</p>
							<p>
								Hands-on with AI — I've built custom agents and MCP (Model
								Context Protocol) servers that integrate LLMs directly into
								development workflows, from automated code review to intelligent
								task orchestration.
							</p>
							<p>
								Collaborated with JSMastery to write code for a YouTube video
								that has accumulated over 2.1+ million views.
							</p>
						</div>
						<div className={classes.skillGroups}>
							{skillCategories.map((category) => (
								<div key={category.label}>
									<div className={classes.skillGroupLabel}>
										{category.label}
									</div>
									<div className={classes.skillTags}>
										{category.skills.map((skill) => (
											<TechTag key={skill} label={skill} variant="slate" />
										))}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
					<div className={classes.experienceList} id="experience">
						<SectionLabel>Experience</SectionLabel>
						{experiences.map((exp) => (
							<div key={exp.company} className={classes.experienceItem}>
								<a
									href={exp.href}
									target="_blank"
									rel="noopener noreferrer"
									className={classes.expCompany}
								>
									{exp.company}
								</a>
								<span className={classes.expRole}>{exp.role}</span>
								<span className={classes.expPeriod}>{exp.period}</span>
							</div>
						))}
					</div>
				</div>
			</SectionWrapper>
		</Container>
	);
}
