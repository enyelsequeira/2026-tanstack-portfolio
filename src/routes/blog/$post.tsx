import { Container, Typography } from "@mantine/core";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { NavBar } from "@/components/sections/nav-bar";
import { TechTag } from "@/components/ui/tech-tag";
import classes from "./post.module.css";

function getTagVariant(tag: string): "blue" | "indigo" | "slate" {
	const blueItems = ["react", "typescript", "next.js", "javascript"];
	const indigoItems = ["webdev", "tutorial", "ssr"];
	if (blueItems.includes(tag.toLowerCase())) return "blue";
	if (indigoItems.includes(tag.toLowerCase())) return "indigo";
	return "slate";
}

function formatDate(dateStr: string) {
	const date = new Date(dateStr);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

export const Route = createFileRoute("/blog/$post")({
	component: RouteComponent,
	loader: ({ params }) => {
		const post = allPosts.find((p) => p._meta.path === params.post);
		if (!post) {
			throw redirect({ to: "/blog" });
		}
		return post;
	},
});

function RouteComponent() {
	const post = Route.useLoaderData();

	return (
		<>
			<NavBar />
			<Container size={800} className={classes.page}>
				<Link to="/blog" className={classes.backLink}>
					<span aria-hidden="true">&larr;</span> Back to blog
				</Link>

				<p className={classes.date}>{formatDate(post.date)}</p>
				<h1 className={classes.title}>{post.title}</h1>

				<div className={classes.tags}>
					{post.tags.map((tag) => (
						<TechTag key={tag} label={tag} variant={getTagVariant(tag)} />
					))}
				</div>

				<div className={classes.divider} />

				<Typography className={classes.prose}>
					{/* biome-ignore lint/security/noDangerouslySetInnerHtml: content-collections markdown is trusted authored content */}
					<div dangerouslySetInnerHTML={{ __html: post.html }} />
				</Typography>

				<footer className={classes.footer}>
					<div className={classes.footerDivider} />
					<Link to="/blog" className={classes.footerLink}>
						<span aria-hidden="true">&larr;</span> Back to all posts
					</Link>
				</footer>
			</Container>
		</>
	);
}
