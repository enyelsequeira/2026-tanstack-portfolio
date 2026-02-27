import { Container } from "@mantine/core";
import { GradientText } from "@/components/ui/gradient-text";
import { TechTag } from "@/components/ui/tech-tag";
import { techTags } from "@/data/skills";
import classes from "./hero-section.module.css";

export function HeroSection() {
	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			<section className={classes.hero}>
				<p className={classes.eyebrow}> Frontend Engineer · Remote</p>
				<h1 className={classes.heading}>
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
