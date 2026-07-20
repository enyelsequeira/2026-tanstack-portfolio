import { Anchor, Box, Group, Stack, Text, Title } from "@mantine/core";
import { TechTag } from "@/components/ui/tech-tag";
import { projects } from "@/data/projects";

export function ProjectsApp() {
	return (
		<Stack gap={20} px={28} pt={24} pb={32}>
			{projects.map((project) => (
				<Box
					key={project.id}
					component="article"
					py={18}
					px={20}
					bd="1px solid var(--color-border)"
					bdrs={12}
					bg="rgba(255, 255, 255, 0.03)"
				>
					<Group justify="space-between" mb={6}>
						<Text
							ff="monospace"
							fz={11}
							lts="0.08em"
							c="var(--color-accent-secondary)"
						>
							{project.number}
						</Text>
						{project.period && (
							<Text
								ff="monospace"
								fz={11}
								lts="0.08em"
								c="var(--color-text-muted)"
							>
								{project.period}
							</Text>
						)}
					</Group>
					<Title
						order={2}
						ff="heading"
						fz={22}
						fw={400}
						c="var(--color-text-primary)"
					>
						{project.title}
					</Title>
					{project.role && (
						<Text
							ff="monospace"
							fz={12}
							mt={2}
							mb={8}
							c="var(--color-text-muted)"
						>
							{project.role}
						</Text>
					)}
					<Text fz={13} lh={1.7} mb={10} c="var(--color-text-muted)">
						{project.description}
					</Text>
					{project.highlights && (
						<Box
							component="ul"
							fz={12}
							lh={1.7}
							mb={12}
							pl={18}
							c="var(--color-text-muted)"
						>
							{project.highlights.map((highlight) => (
								<li key={highlight}>{highlight}</li>
							))}
						</Box>
					)}
					<Group gap={6} mb={10}>
						{project.tech.map((tech) => (
							<TechTag key={tech} label={tech} />
						))}
					</Group>
					{project.href && (
						<Anchor
							href={project.href}
							target="_blank"
							rel="noopener noreferrer"
							fz={12}
							fw={500}
							underline="hover"
							c="var(--color-accent-primary)"
						>
							{project.linkLabel || "Visit"} →
						</Anchor>
					)}
				</Box>
			))}
		</Stack>
	);
}
