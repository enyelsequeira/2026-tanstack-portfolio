import { experiences } from "@/data/experience";
import { skillCategories } from "@/data/skills";
import { stats } from "@/data/stats";
import classes from "./about-app.module.css";

export function AboutApp() {
	return (
		<div className={classes.app}>
			<header className={classes.header}>
				<h1 className={classes.name}>Enyel Sequeira</h1>
				<p className={classes.role}>
					Senior Frontend Engineer · Lisbon, Portugal
				</p>
			</header>

			<section className={classes.section}>
				<p>
					Full-stack developer from the US, now based in Lisbon, Portugal. Over
					five years of industry experience with a strong focus on frontend
					development — building pixel-perfect, performant experiences for web
					products and applications.
				</p>
				<p>
					I speak English, Spanish, Portuguese fluently and conversational
					Mandarin Chinese. Currently exploring Rust for JS tooling and Python
					for AI applications.
				</p>
				<p>
					Hands-on with AI — I've built custom agents and MCP servers that
					integrate LLMs directly into development workflows.
				</p>
			</section>

			<section className={classes.section}>
				<h2 className={classes.sectionTitle}>Stats</h2>
				<div className={classes.statsGrid}>
					{stats.map((stat) => (
						<div key={stat.label} className={classes.stat}>
							<span className={classes.statValue}>
								{stat.value}
								{stat.suffix}
							</span>
							<span className={classes.statLabel}>{stat.label}</span>
						</div>
					))}
				</div>
			</section>

			<section className={classes.section}>
				<h2 className={classes.sectionTitle}>Experience</h2>
				<ul className={classes.expList}>
					{experiences.map((exp) => (
						<li key={exp.company} className={classes.expItem}>
							<a href={exp.href} target="_blank" rel="noopener noreferrer">
								{exp.company}
							</a>
							<span className={classes.expRole}>{exp.role}</span>
							<span className={classes.expPeriod}>{exp.period}</span>
						</li>
					))}
				</ul>
			</section>

			<section className={classes.section}>
				<h2 className={classes.sectionTitle}>Skills</h2>
				{skillCategories.map((cat) => (
					<div key={cat.label} className={classes.skillGroup}>
						<span className={classes.skillLabel}>{cat.label}</span>
						<div className={classes.skillTags}>
							{cat.skills.map((skill) => (
								<span key={skill} className={classes.skillTag}>
									{skill}
								</span>
							))}
						</div>
					</div>
				))}
			</section>
		</div>
	);
}
