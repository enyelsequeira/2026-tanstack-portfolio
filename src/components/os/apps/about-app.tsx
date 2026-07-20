import { Box, Group, Stack, Text, Title } from "@mantine/core";
import { experiences } from "@/data/experience";
import { skillCategories } from "@/data/skills";
import { stats } from "@/data/stats";
import classes from "./about-app.module.css";

function SectionTitle({ children }: { children: string }) {
	return (
		<Text
			component="h2"
			ff="monospace"
			fz={11}
			fw={500}
			tt="uppercase"
			lts="0.12em"
			c="brand.5"
			mb={12}
		>
			{children}
		</Text>
	);
}

export function AboutApp() {
	return (
		<Box pt={24} px={28} pb={32} c="obsidian.0" fz={14} lh={1.7}>
			<Box component="header" mb={20}>
				<Title order={1} fz={28} fw={400}>
					Enyel Sequeira
				</Title>
				<Text ff="monospace" c="obsidian.3" fz={12} mt={4}>
					Senior Frontend Engineer · Lisbon, Portugal
				</Text>
			</Box>

			<Stack component="section" gap={12} mb={24}>
				<Text c="obsidian.3">
					Full-stack developer from the US, now based in Lisbon, Portugal. Over
					five years of industry experience with a strong focus on frontend
					development — building pixel-perfect, performant experiences for web
					products and applications.
				</Text>
				<Text c="obsidian.3">
					I speak English, Spanish, Portuguese fluently and conversational
					Mandarin Chinese. Currently exploring Rust for JS tooling and Python
					for AI applications.
				</Text>
				<Text c="obsidian.3">
					Hands-on with AI — I've built custom agents and MCP servers that
					integrate LLMs directly into development workflows.
				</Text>
			</Stack>

			<Box component="section" mb={24}>
				<SectionTitle>Stats</SectionTitle>
				<Box className={classes.statsGrid}>
					{stats.map((stat) => (
						<Stack
							key={stat.label}
							gap={0}
							p={12}
							bd="1px solid var(--color-border)"
							bdrs={10}
							bg="rgba(255, 255, 255, 0.03)"
						>
							<Text ff="heading" fz={22}>
								{stat.value}
								{stat.suffix}
							</Text>
							<Text c="obsidian.3" fz={11}>
								{stat.label}
							</Text>
						</Stack>
					))}
				</Box>
			</Box>

			<Box component="section" mb={24}>
				<SectionTitle>Experience</SectionTitle>
				<Stack gap={10}>
					{experiences.map((exp) => (
						<Box key={exp.company} className={classes.expItem}>
							<a href={exp.href} target="_blank" rel="noopener noreferrer">
								{exp.company}
							</a>
							<span className={classes.expRole}>{exp.role}</span>
							<span className={classes.expPeriod}>{exp.period}</span>
						</Box>
					))}
				</Stack>
			</Box>

			<Box component="section" mb={24}>
				<SectionTitle>Skills</SectionTitle>
				{skillCategories.map((cat) => (
					<Group key={cat.label} align="baseline" gap={12} mb={8}>
						<Text ff="monospace" fz={11} c="obsidian.3" miw={90}>
							{cat.label}
						</Text>
						<Group gap={6}>
							{cat.skills.map((skill) => (
								<Box
									key={skill}
									component="span"
									fz={11}
									px={8}
									py={2}
									bdrs={999}
									bd="1px solid var(--color-border)"
									c="obsidian.3"
								>
									{skill}
								</Box>
							))}
						</Group>
					</Group>
				))}
			</Box>
		</Box>
	);
}
