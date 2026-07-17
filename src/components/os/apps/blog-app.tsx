import { Typography } from "@mantine/core";
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
			<div className={classes.app}>
				<button
					type="button"
					className={classes.backButton}
					onClick={() => setSelectedPath(null)}
				>
					← All posts
				</button>
				<p className={classes.date}>{formatDate(selected.date)}</p>
				<h1 className={classes.postTitle}>{selected.title}</h1>
				<div className={classes.tags}>
					{selected.tags.map((tag) => (
						<TechTag key={tag} label={tag} />
					))}
				</div>
				<Typography className={classes.prose}>
					{/* biome-ignore lint/security/noDangerouslySetInnerHtml: content-collections markdown is trusted authored content */}
					<div dangerouslySetInnerHTML={{ __html: selected.html }} />
				</Typography>
			</div>
		);
	}

	return (
		<div className={classes.app}>
			<div className={classes.list}>
				{posts.map((post) => (
					<button
						key={post._meta.path}
						type="button"
						className={classes.card}
						onClick={() => setSelectedPath(post._meta.path)}
					>
						<span className={classes.date}>{formatDate(post.date)}</span>
						<span className={classes.cardTitle}>{post.title}</span>
						<span className={classes.summary}>{post.summary}</span>
					</button>
				))}
			</div>
		</div>
	);
}
