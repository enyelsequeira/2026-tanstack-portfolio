import { Box, Burger, Drawer, Flex, Stack } from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import { Link } from "@tanstack/react-router";
import classes from "./nav-bar.module.css";

const NAV_ITEMS = [
	{ label: "Work", hash: "work" },
	{ label: "About", hash: "about" },
	{ label: "Experience", hash: "experience" },
	{ label: "Contact", hash: "contact" },
];

export function NavBar() {
	const [scroll] = useWindowScroll();
	const [opened, { toggle, close }] = useDisclosure(false);

	return (
		<>
			<Box
				component="nav"
				className={classes.navbar}
				data-scrolled={scroll.y > 50 || undefined}
			>
				<div className={classes.inner}>
					<Link to="/" className={classes.logo}>
						<img
							src="/enyel-logo.png"
							alt="Enyel Sequeira"
							className={classes.logoImg}
						/>
						<span className={classes.logoText}>
							ES<span className={classes.logoAccent}>.</span>
						</span>
					</Link>
					<ul className={classes.links}>
						{NAV_ITEMS.map((item) => (
							<li key={item.hash}>
								<Link
									to="/"
									hash={item.hash}
									className={classes.link}
								>
									{item.label}
								</Link>
							</li>
						))}
					</ul>
					<Flex gap="md">
						<Link to="/blog" className={classes.ctaGhost}>
							Blog
						</Link>
						<Link to="/" hash="contact" className={classes.cta}>
							Hire me
						</Link>
					</Flex>

					<Burger
						opened={opened}
						onClick={toggle}
						className={classes.burger}
						color="var(--color-text-primary)"
						size="sm"
						aria-label="Toggle navigation"
					/>
				</div>
			</Box>
			<Drawer
				opened={opened}
				onClose={close}
				padding="xl"
				styles={{
					header: {
						background: "var(--color-bg)",
					},
					content: {
						background: "var(--color-bg)",
					},
				}}
			>
				<Stack gap="xl">
					{NAV_ITEMS.map((item) => (
						<Link
							key={item.hash}
							to="/"
							hash={item.hash}
							onClick={close}
							className={classes.link}
							style={{ fontSize: 24 }}
						>
							{item.label}
						</Link>
					))}
					<Link
						to="/blog"
						onClick={close}
						className={classes.ctaGhost}
						style={{ textAlign: "center" }}
					>
						Blog
					</Link>
					<Link
						to="/"
						hash="contact"
						onClick={close}
						className={classes.cta}
						style={{ textAlign: "center" }}
					>
						Hire me
					</Link>
				</Stack>
			</Drawer>
		</>
	);
}
