import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import { gsap } from "gsap";
import { useRef } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { TechTag } from "@/components/ui/tech-tag";
import { experiences } from "@/data/experience";
import { skillCategories } from "@/data/skills";
import classes from "./about-section.module.css";

export function AboutSection() {
	const sectionRef = useRef<HTMLDivElement>(null);
	const bioRef = useRef<HTMLDivElement>(null);
	const skillGroupsRef = useRef<HTMLDivElement>(null);
	const experienceListRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const root = sectionRef.current;
			const bio = bioRef.current;
			const skillGroups = skillGroupsRef.current;
			const experienceList = experienceListRef.current;
			if (!root || !bio || !skillGroups || !experienceList) return;

			const bioParagraphs = Array.from(bio.children) as HTMLElement[];
			const categoryEls = Array.from(skillGroups.children) as HTMLElement[];
			const experienceItems = Array.from(experienceList.children).filter((el) =>
				(el as HTMLElement).classList.contains(classes.experienceItem),
			) as HTMLElement[];

			const reduced = window.matchMedia(
				"(max-width: 768px), (prefers-reduced-motion: reduce)",
			).matches;

			if (reduced) {
				gsap.from([...bioParagraphs, ...categoryEls, ...experienceItems], {
					opacity: 0,
					y: 12,
					duration: 0.4,
					ease: "power2.out",
					stagger: 0.05,
					scrollTrigger: { trigger: root, start: "top 90%", once: true },
				});
				return;
			}

			gsap.from(bioParagraphs, {
				opacity: 0,
				y: 16,
				duration: 0.6,
				ease: "power3.out",
				stagger: 0.15,
				scrollTrigger: { trigger: root, start: "top 75%", once: true },
			});

			categoryEls.forEach((cat, i) => {
				const tags = cat.querySelectorAll(`.${classes.skillTags} > *`);
				if (tags.length === 0) return;
				gsap.from(tags, {
					opacity: 0,
					scale: 0.7,
					duration: 0.5,
					ease: "back.out(1.4)",
					stagger: 0.02,
					delay: 0.2 * i,
					scrollTrigger: { trigger: cat, start: "top 85%", once: true },
				});
			});

			if (experienceItems.length > 0) {
				gsap.from(experienceItems, {
					opacity: 0,
					x: -20,
					duration: 0.5,
					ease: "power3.out",
					stagger: 0.1,
					scrollTrigger: {
						trigger: experienceList,
						start: "top 80%",
						once: true,
					},
				});
			}
		},
		{ scope: sectionRef },
	);

	return (
		<Container id={"about"} size={1100} px={{ base: 20, sm: 40 }}>
			<SectionWrapper>
				<div ref={sectionRef} className={classes.section}>
					<SectionLabel>About</SectionLabel>

					<div className={classes.bioGrid}>
						<div ref={bioRef} className={classes.bioText}>
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
						<div ref={skillGroupsRef} className={classes.skillGroups}>
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
					<div
						ref={experienceListRef}
						className={classes.experienceList}
						id="experience"
					>
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
