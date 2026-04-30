import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { GradientText } from "@/components/ui/gradient-text";
import { TechTag } from "@/components/ui/tech-tag";
import { techTags } from "@/data/skills";
import classes from "./hero-section.module.css";

export function HeroSection() {
	const sectionRef = useRef<HTMLElement>(null);
	const eyebrowRef = useRef<HTMLParagraphElement>(null);
	const headingRef = useRef<HTMLHeadingElement>(null);
	const gradientRef = useRef<HTMLSpanElement>(null);
	const subRef = useRef<HTMLParagraphElement>(null);
	const btnPrimaryRef = useRef<HTMLAnchorElement>(null);
	const btnGhostRef = useRef<HTMLAnchorElement>(null);
	const tagsRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const section = sectionRef.current;
			if (!section) return;

			const reduced = window.matchMedia(
				"(max-width: 768px), (prefers-reduced-motion: reduce)",
			).matches;

			if (reduced) {
				gsap.fromTo(
					section,
					{ opacity: 0 },
					{ opacity: 1, duration: 0.4, ease: "power2.out" },
				);
				return;
			}

			gsap.set(section, { opacity: 1 });

			const heading = headingRef.current;
			const gradient = gradientRef.current;
			const buttons = [btnPrimaryRef.current, btnGhostRef.current].filter(
				Boolean,
			) as HTMLAnchorElement[];
			const tagEls = tagsRef.current
				? (Array.from(tagsRef.current.children) as HTMLElement[])
				: [];

			// Gradient span needs inline-block for transforms to apply.
			if (gradient) {
				gsap.set(gradient, { display: "inline-block" });
			}

			// Split only the non-gradient text; the gradient span animates as a whole
			// because -webkit-background-clip: text doesn't survive splitting into per-char divs.
			const split = heading
				? new SplitText(heading, {
						type: "chars",
						charsClass: "hero-char",
						ignore: gradient ?? undefined,
					})
				: null;

			gsap.from(eyebrowRef.current, {
				opacity: 0,
				y: 8,
				duration: 0.5,
				ease: "power2.out",
			});
			gsap.fromTo(
				eyebrowRef.current,
				{ "--accent-line-width": "0px" },
				{ "--accent-line-width": "24px", duration: 0.5, ease: "power2.out" },
			);

			if (split && split.chars.length > 0) {
				gsap.from(split.chars, {
					yPercent: 100,
					opacity: 0,
					duration: 0.9,
					ease: "back.out(1.4)",
					stagger: 0.04,
					delay: 0.3,
				});
			}

			if (gradient) {
				gsap.from(gradient, {
					yPercent: 100,
					opacity: 0,
					duration: 0.9,
					ease: "back.out(1.4)",
					delay: 0.6,
				});
			}

			gsap.from(subRef.current, {
				opacity: 0,
				y: 16,
				duration: 0.6,
				ease: "power3.out",
				delay: 1.0,
			});

			if (buttons.length > 0) {
				gsap.fromTo(
					buttons,
					{ opacity: 0, y: 16, immediateRender: false },
					{
						opacity: 1,
						y: 0,
						duration: 0.5,
						ease: "power3.out",
						stagger: 0.1,
						delay: 1.4,
						clearProps: "transform,opacity",
					},
				);
			}

			if (tagEls.length > 0) {
				gsap.from(tagEls, {
					opacity: 0,
					y: 12,
					duration: 0.4,
					ease: "power3.out",
					stagger: 0.03,
					delay: 1.6,
				});
			}

			return () => {
				split?.revert();
			};
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
				<p ref={eyebrowRef} className={classes.eyebrow}>
					{" "}
					Frontend Engineer · Remote
				</p>
				<h1
					ref={headingRef}
					className={classes.heading}
					aria-label="Enyel Sequeira"
				>
					Enyel
					<br />
					<GradientText ref={gradientRef}>Sequeira</GradientText>
				</h1>
				<p ref={subRef} className={classes.sub}>
					I build scalable interfaces and design systems that bridge technical
					precision with human experience — 5+ years across gaming, Web3, and
					EdTech. Now building AI agents and MCP integrations to ship smarter
					developer tooling.
				</p>
				<div className={classes.actions}>
					<a ref={btnPrimaryRef} href="#work" className={classes.btnPrimary}>
						View Work →
					</a>
					<a
						ref={btnGhostRef}
						href="/Sequeira_Enyel_resume-2025.pdf"
						download
						className={classes.btnGhost}
					>
						Download CV
					</a>
				</div>
				<div ref={tagsRef} className={classes.tags}>
					{techTags.map((tag) => (
						<TechTag key={tag.label} label={tag.label} variant={tag.variant} />
					))}
				</div>
			</section>
		</Container>
	);
}
