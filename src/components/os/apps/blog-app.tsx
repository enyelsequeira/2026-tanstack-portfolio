import {
	Box,
	Group,
	Stack,
	Text,
	Title,
	Typography,
	UnstyledButton,
} from "@mantine/core";
import { allPosts } from "content-collections";
import { useState } from "react";
import { TechTag } from "@/components/ui/tech-tag";
import classes from "./blog-app.module.css";

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export function BlogApp() {
	const [selectedPath, setSelectedPath] = useState<string | null>(null);

	const posts = allPosts
		.filter((post) => post.published)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	const selected = posts.find((post) => post._meta.path === selectedPath);

	if (selected) {
		return (
			<Box pt={24} px={28} pb={32}>
				<UnstyledButton
					onClick={() => setSelectedPath(null)}
					c="brand.9"
					ff="monospace"
					fz={12}
					mb={16}
				>
					← All posts
				</UnstyledButton>
				<Text ff="monospace" fz={11} c="obsidian.3">
					{formatDate(selected.date)}
				</Text>
				<Title order={1} fz={26} fw={400} mt={4} mb={10} c="obsidian.0">
					{selected.title}
				</Title>
				<Group gap={6} mb={18}>
					{selected.tags.map((tag) => (
						<TechTag key={tag} label={tag} />
					))}
				</Group>
				<Typography className={classes.prose}>
					{/* biome-ignore lint/security/noDangerouslySetInnerHtml: content-collections markdown is trusted authored content */}
					<div dangerouslySetInnerHTML={{ __html: selected.html }} />
				</Typography>
			</Box>
		);
	}

	return (
		<Box pt={24} px={28} pb={32}>
			<Stack gap={12}>
				{posts.map((post) => (
					<button
						key={post._meta.path}
						type="button"
						className={classes.card}
						onClick={() => setSelectedPath(post._meta.path)}
					>
						<Text ff="monospace" fz={11} c="obsidian.3">
							{formatDate(post.date)}
						</Text>
						<Text ff="heading" fz={18} c="obsidian.0">
							{post.title}
						</Text>
						<Text fz={12} lh={1.6} c="obsidian.3">
							{post.summary}
						</Text>
					</button>
				))}
			</Stack>
		</Box>
	);
}
