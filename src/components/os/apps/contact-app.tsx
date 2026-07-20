import { Stack, Text, Title } from "@mantine/core";
import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandX,
	IconMail,
} from "@tabler/icons-react";
import classes from "./contact-app.module.css";

const LINKS = [
	{
		href: "mailto:enyelsequeira@hotmail.com",
		icon: IconMail,
		label: "enyelsequeira@hotmail.com",
	},
	{
		href: "https://github.com/enyelsequeira",
		icon: IconBrandGithub,
		label: "github.com/enyelsequeira",
	},
	{
		href: "https://www.linkedin.com/in/enyel-sequeira/",
		icon: IconBrandLinkedin,
		label: "linkedin.com/in/enyel-sequeira",
	},
	{
		href: "https://twitter.com/EnyelSequeira",
		icon: IconBrandX,
		label: "@EnyelSequeira",
	},
];

export function ContactApp() {
	return (
		<Stack gap={0} p={28} h="100%">
			<Title order={1} fz={26} fw={400} mb={8} c="obsidian.0">
				Let's work together
			</Title>
			<Text fz={13} lh={1.7} mb={20} c="obsidian.3">
				Open to remote roles and freelance projects. If you have a question or
				would like to collaborate, get in touch.
			</Text>
			<Stack gap={10}>
				{LINKS.map((link) => (
					<a
						key={link.label}
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						className={classes.link}
					>
						<link.icon size={18} stroke={1.5} />
						<span>{link.label}</span>
					</a>
				))}
			</Stack>
			<Text ff="monospace" fz={11} c="obsidian.3" mt="auto" pt={20}>
				Enyel Sequeira · Open to Remote Roles
			</Text>
		</Stack>
	);
}
