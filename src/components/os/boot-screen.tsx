import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import classes from "./boot-screen.module.css";
import { prefersReducedMotion } from "./motion";

export function BootScreen({ onDone }: { onDone: () => void }) {
	const overlayRef = useRef<HTMLDivElement>(null);
	const timelineRef = useRef<gsap.core.Timeline | null>(null);
	const reduced = prefersReducedMotion();

	useEffect(() => {
		if (reduced) onDone();
	}, [reduced, onDone]);

	useGSAP(
		() => {
			if (reduced || !overlayRef.current) return;
			const tl = gsap.timeline({ onComplete: onDone });
			tl.from(`.${classes.logo}`, {
				opacity: 0,
				scale: 0.9,
				duration: 0.4,
				ease: "power2.out",
			})
				.to(`.${classes.barFill}`, {
					width: "100%",
					duration: 1.1,
					ease: "power1.inOut",
				})
				.to(overlayRef.current, {
					opacity: 0,
					duration: 0.35,
					ease: "power2.in",
				});
			timelineRef.current = tl;
		},
		{ scope: overlayRef },
	);

	useEffect(() => {
		const skip = () => timelineRef.current?.progress(1);
		window.addEventListener("pointerdown", skip);
		window.addEventListener("keydown", skip);
		return () => {
			window.removeEventListener("pointerdown", skip);
			window.removeEventListener("keydown", skip);
		};
	}, []);

	if (reduced) return null;

	return (
		<div ref={overlayRef} className={classes.overlay}>
			<img src="/enyel-logo.png" alt="EnyelOS" className={classes.logo} />
			<div className={classes.bar}>
				<div className={classes.barFill} />
			</div>
			<p className={classes.hint}>click anywhere to skip</p>
		</div>
	);
}
