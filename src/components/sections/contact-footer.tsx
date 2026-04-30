import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandX,
} from "@tabler/icons-react";
import { gsap } from "gsap";
import { useRef } from "react";
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
	const sectionRef = useRef<HTMLDivElement>(null);
	const accentBarRef = useRef<HTMLDivElement>(null);
	const headingRef = useRef<HTMLHeadingElement>(null);
	const subRef = useRef<HTMLParagraphElement>(null);
	const ctaRef = useRef<HTMLAnchorElement>(null);
	const socialsRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const root = sectionRef.current;
			const accentBar = accentBarRef.current;
			const heading = headingRef.current;
			const sub = subRef.current;
			const cta = ctaRef.current;
			const socials = socialsRef.current;
			if (!root) return;

			const reduced = window.matchMedia(
				"(max-width: 768px), (prefers-reduced-motion: reduce)",
			).matches;
			const socialLinks = socials
				? (Array.from(socials.children) as HTMLElement[])
				: [];

			const trigger = { trigger: root, start: "top 80%", once: true };

			if (accentBar) {
				gsap.fromTo(
					accentBar,
					{ scaleX: 0, immediateRender: false },
					{
						scaleX: 1,
						duration: reduced ? 0.5 : 0.8,
						ease: "power3.out",
						scrollTrigger: trigger,
					},
				);
			}
			if (heading) {
				gsap.fromTo(
					heading,
					{ opacity: 0, y: 16, immediateRender: false },
					{
						opacity: 1,
						y: 0,
						duration: 0.5,
						ease: "power3.out",
						delay: 0.2,
						scrollTrigger: trigger,
						clearProps: "transform,opacity",
					},
				);
			}
			if (sub) {
				gsap.fromTo(
					sub,
					{ opacity: 0, y: 12, immediateRender: false },
					{
						opacity: 1,
						y: 0,
						duration: 0.5,
						ease: "power3.out",
						delay: 0.35,
						scrollTrigger: trigger,
						clearProps: "transform,opacity",
					},
				);
			}
			if (cta) {
				gsap.fromTo(
					cta,
					{ opacity: 0, y: 12, immediateRender: false },
					{
						opacity: 1,
						y: 0,
						duration: 0.4,
						ease: "power3.out",
						delay: 0.5,
						scrollTrigger: trigger,
						clearProps: "transform,opacity",
					},
				);
			}
			if (socialLinks.length > 0) {
				gsap.fromTo(
					socialLinks,
					{ opacity: 0, y: 8, immediateRender: false },
					{
						opacity: 1,
						y: 0,
						duration: 0.3,
						ease: "power2.out",
						stagger: 0.05,
						delay: 0.65,
						scrollTrigger: trigger,
						clearProps: "transform,opacity",
					},
				);
			}

			if (!reduced && cta) {
				const xTo = gsap.quickTo(cta, "x", {
					duration: 0.3,
					ease: "power3.out",
				});
				const yTo = gsap.quickTo(cta, "y", {
					duration: 0.3,
					ease: "power3.out",
				});
				const onMove = (e: MouseEvent) => {
					const rect = cta.getBoundingClientRect();
					const cx = rect.left + rect.width / 2;
					const cy = rect.top + rect.height / 2;
					const dx = e.clientX - cx;
					const dy = e.clientY - cy;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < 120) {
						const pull = 1 - dist / 120;
						xTo(dx * 0.2 * pull);
						yTo(dy * 0.2 * pull);
					} else {
						xTo(0);
						yTo(0);
					}
				};
				const onLeave = () => {
					xTo(0);
					yTo(0);
				};
				document.addEventListener("mousemove", onMove);
				cta.addEventListener("mouseleave", onLeave);
				return () => {
					document.removeEventListener("mousemove", onMove);
					cta.removeEventListener("mouseleave", onLeave);
				};
			}
		},
		{ scope: sectionRef },
	);

	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
			<SectionWrapper id="contact">
				<div ref={sectionRef} className={classes.section}>
					<div ref={accentBarRef} className={classes.accentBar} />
					<div className={classes.content}>
						<h2 ref={headingRef} className={classes.heading}>
							Let's work together
						</h2>
						<p ref={subRef} className={classes.sub}>
							Open to remote roles and freelance projects. If you have a
							question or would like to collaborate, get in touch.
						</p>
						<div className={classes.actions}>
							<a
								ref={ctaRef}
								href="mailto:enyelsequeira@hotmail.com"
								className={classes.btnPrimary}
							>
								Say Hello →
							</a>
						</div>
						<div ref={socialsRef} className={classes.socials}>
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
