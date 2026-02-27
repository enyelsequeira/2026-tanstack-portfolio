import { Container } from "@mantine/core";
import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandX,
} from "@tabler/icons-react";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import classes from "./contact-footer.module.css";

const SOCIALS = [
	{
		href: "https://github.com/enyelsequeira",
		icon: IconBrandGithub,
		label: "GitHub",
	},
	{
		href: "https://www.linkedin.com/in/enyel-sequeira/",
		icon: IconBrandLinkedin,
		label: "LinkedIn",
	},
	{
		href: "https://twitter.com/EnyelSequeira",
		icon: IconBrandX,
		label: "X / Twitter",
	},
];

export function ContactFooter() {
	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
			<SectionWrapper id="contact">
				<div className={classes.section}>
					<div className={classes.accentBar} />
					<div className={classes.content}>
						<h2 className={classes.heading}>Let's work together</h2>
						<p className={classes.sub}>
							Open to remote roles and freelance projects. If you have a
							question or would like to collaborate, get in touch.
						</p>
						<div className={classes.actions}>
							<a
								href="mailto:enyelsequeira@hotmail.com"
								className={classes.btnPrimary}
							>
								Say Hello →
							</a>
						</div>
						<div className={classes.socials}>
							{SOCIALS.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className={classes.socialLink}
									aria-label={social.label}
								>
									<social.icon size={18} stroke={1.5} />
								</a>
							))}
						</div>
					</div>
					<p className={classes.footer}>
						Enyel Sequeira · Open to Remote Roles
					</p>
				</div>
			</SectionWrapper>
		</Container>
	);
}
