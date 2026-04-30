import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { GradientText } from "@/components/ui/gradient-text";
import gradientClasses from "@/components/ui/gradient-text.module.css";
import { TechTag } from "@/components/ui/tech-tag";
import { techTags } from "@/data/skills";
import { motionConditions } from "@/lib/animations/use-motion-context";
import classes from "./hero-section.module.css";

export function HeroSection() {
	const sectionRef = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			const root = sectionRef.current;
			if (!root) return;

			const eyebrow = root.querySelector(`.${classes.eyebrow}`);
			const heading = root.querySelector<HTMLElement>(`.${classes.heading}`);
			const gradientSpan = heading?.querySelector<HTMLElement>(
				`.${gradientClasses.gradient}`,
			);
			const sub = root.querySelector(`.${classes.sub}`);
			const actions = root.querySelector(`.${classes.actions}`);
			const tags = root.querySelectorAll(`.${classes.tags} > *`);

			const mm = gsap.matchMedia();

			mm.add(motionConditions.full, () => {
				gsap.set(root, { opacity: 1 });

				// Split only the non-gradient text; the gradient span animates as a whole
				// so the -webkit-background-clip: text gradient stays intact.
				const split = heading
					? new SplitText(heading, {
							type: "chars",
							charsClass: "char",
							ignore: gradientSpan ?? undefined,
						})
					: null;

				if (split) {
					gsap.set(split.chars, { y: "100%", opacity: 0 });
				}
				if (gradientSpan) {
					gsap.set(gradientSpan, {
						display: "inline-block",
						yPercent: 100,
						opacity: 0,
					});
				}

				const tl = gsap.timeline();
				tl.from(
					eyebrow,
					{
						opacity: 0,
						y: 8,
						duration: 0.5,
						ease: "power2.out",
					},
					0,
				).fromTo(
					eyebrow,
					{ "--accent-line-width": "0px" },
					{
						"--accent-line-width": "24px",
						duration: 0.5,
						ease: "power2.out",
					},
					0,
				);

				if (split && split.chars.length > 0) {
					tl.to(
						split.chars,
						{
							y: "0%",
							opacity: 1,
							duration: 0.9,
							ease: "back.out(1.4)",
							stagger: 0.04,
						},
						0.3,
					);
				}

				if (gradientSpan) {
					tl.to(
						gradientSpan,
						{
							yPercent: 0,
							opacity: 1,
							duration: 0.9,
							ease: "back.out(1.4)",
						},
						0.6,
					);
				}

				tl.from(
					sub,
					{
						opacity: 0,
						y: 16,
						duration: 0.6,
						ease: "power3.out",
					},
					1.0,
				)
					.from(
						actions ? actions.children : [],
						{
							opacity: 0,
							y: 16,
							duration: 0.5,
							ease: "power3.out",
							stagger: 0.1,
						},
						1.4,
					)
					.from(
						tags,
						{
							opacity: 0,
							y: 12,
							duration: 0.4,
							ease: "power3.out",
							stagger: 0.03,
						},
						1.6,
					);

				return () => {
					split?.revert();
				};
			});

			mm.add(motionConditions.reveal, () => {
				gsap.fromTo(
					root,
					{ opacity: 0 },
					{ opacity: 1, duration: 0.4, ease: "power2.out" },
				);
			});
		},
		{ scope: sectionRef },
	);

	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			<section
				ref={sectionRef}
				className={classes.hero}
				data-anim-gate
				style={{ opacity: 0 }}
			>
				<p className={classes.eyebrow}> Frontend Engineer · Remote</p>
				<h1 className={classes.heading} aria-label="Enyel Sequeira">
					Enyel
					<br />
					<GradientText>Sequeira</GradientText>
				</h1>
				<p className={classes.sub}>
					I build scalable interfaces and design systems that bridge technical
					precision with human experience — 5+ years across gaming, Web3, and
					EdTech. Now building AI agents and MCP integrations to ship smarter
					developer tooling.
				</p>
				<div className={classes.actions}>
					<a href="#work" className={classes.btnPrimary}>
						View Work →
					</a>
					<a
						href="/Sequeira_Enyel_resume-2025.pdf"
						download
						className={classes.btnGhost}
					>
						Download CV
					</a>
				</div>
				<div className={classes.tags}>
					{techTags.map((tag) => (
						<TechTag key={tag.label} label={tag.label} variant={tag.variant} />
					))}
				</div>
			</section>
		</Container>
	);
}
