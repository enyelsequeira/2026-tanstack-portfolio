import { Box, Burger, Drawer, Stack } from "@mantine/core";
import { useDisclosure, useWindowScroll } from "@mantine/hooks";
import classes from "./nav-bar.module.css";

const NAV_ITEMS = [
	{ label: "Work", href: "#work" },
	{ label: "About", href: "#about" },
	{ label: "Experience", href: "#experience" },
	{ label: "Contact", href: "#contact" },
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
					<a href="#top" className={classes.logo}>
						<img
							src="/enyel-logo.png"
							alt="Enyel Sequeira"
							className={classes.logoImg}
						/>
						<span className={classes.logoText}>
							ES<span className={classes.logoAccent}>.</span>
						</span>
					</a>
					<ul className={classes.links}>
						{NAV_ITEMS.map((item) => (
							<li key={item.href}>
								<a href={item.href} className={classes.link}>
									{item.label}
								</a>
							</li>
						))}
					</ul>
					<a href="#contact" className={classes.cta}>
						Hire me
					</a>
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
						<a
							key={item.href}
							href={item.href}
							onClick={close}
							className={classes.link}
							style={{ fontSize: 24 }}
						>
							{item.label}
						</a>
					))}
					{/* biome-ignore lint/a11y/useValidAnchor: navigation link with onClick for drawer close */}
					<a
						href="#contact"
						onClick={close}
						className={classes.cta}
						style={{ textAlign: "center" }}
					>
						Hire me
					</a>
				</Stack>
			</Drawer>
		</>
	);
}
