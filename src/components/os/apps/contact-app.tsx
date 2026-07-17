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
		<div className={classes.app}>
			<h1 className={classes.heading}>Let's work together</h1>
			<p className={classes.sub}>
				Open to remote roles and freelance projects. If you have a question or
				would like to collaborate, get in touch.
			</p>
			<ul className={classes.links}>
				{LINKS.map((link) => (
					<li key={link.label}>
						<a
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							className={classes.link}
						>
							<link.icon size={18} stroke={1.5} />
							<span>{link.label}</span>
						</a>
					</li>
				))}
			</ul>
			<p className={classes.footer}>Enyel Sequeira · Open to Remote Roles</p>
		</div>
	);
}
