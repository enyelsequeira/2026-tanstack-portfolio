import { Container } from "@mantine/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { allPosts } from "content-collections";
import { NavBar } from "@/components/sections/nav-bar";
import { SectionLabel } from "@/components/ui/section-label";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { TechTag } from "@/components/ui/tech-tag";
import classes from "./blog.module.css";

export const Route = createFileRoute("/blog/")({
	component: BlogIndexPage,
	loader: () => allPosts,
});

function getTagVariant(tag: string): "blue" | "indigo" | "slate" {
	const blueItems = ["React", "TypeScript", "Next.js", "JavaScript"];
	const indigoItems = ["Web3", "SSR", "Performance", "Architecture"];
	if (blueItems.includes(tag)) return "blue";
	if (indigoItems.includes(tag)) return "indigo";
	return "slate";
}

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function BlogIndexPage() {
	const posts = Route.useLoaderData();

	const publishedPosts = posts
		.filter((post) => post.published)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return (
		<>
			<NavBar />
			<Container size={1100} px={{ base: 20, sm: 40 }}>
				<div className={classes.page}>
					<SectionWrapper>
						<div className={classes.header}>
							<SectionLabel>Blog</SectionLabel>
							<h1 className={classes.title}>Thoughts & Learnings</h1>
							<p className={classes.subtitle}>
								Writing about frontend architecture, React patterns, and lessons
								learned building products across gaming, Web3, and EdTech.
							</p>
						</div>

						{publishedPosts.length > 0 ? (
							<div className={classes.list}>
								{publishedPosts.map((post) => (
									<Link
										key={post._meta.path}
										to="/blog/$post"
										params={{ post: post._meta.path }}
										className={classes.card}
									>
										<div className={classes.date}>{formatDate(post.date)}</div>
										<h2 className={classes.postTitle}>{post.title}</h2>
										<p className={classes.summary}>{post.summary}</p>
										<div className={classes.tags}>
											{post.tags.map((tag) => (
												<TechTag
													key={tag}
													label={tag}
													variant={getTagVariant(tag)}
												/>
											))}
										</div>
										<span className={classes.readMore}>
											Read article
											<span className={classes.arrow}>&rarr;</span>
										</span>
									</Link>
								))}
							</div>
						) : (
							<div className={classes.empty}>
								<h2 className={classes.emptyTitle}>No posts yet</h2>
								<p className={classes.emptyText}>
									New articles are on the way. Check back soon.
								</p>
							</div>
						)}
					</SectionWrapper>
				</div>
			</Container>
		</>
	);
}
