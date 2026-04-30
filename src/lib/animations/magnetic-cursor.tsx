import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";
import classes from "./magnetic-cursor.module.css";

export function MagneticCursor() {
	const ref = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const el = ref.current;
			if (!el) return;

			// Hide on touch / reduced-motion: bail out, CSS already hides via media query
			const mq = window.matchMedia(
				"(hover: none), (prefers-reduced-motion: reduce)",
			);
			if (mq.matches) return;

			const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
			const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

			const onMove = (e: MouseEvent) => {
				xTo(e.clientX);
				yTo(e.clientY);

				const target = e.target as Element | null;
				if (!target) return;
				const interactive = target.closest("a, button");
				const card = target.closest("[data-cursor='card']");
				if (card) {
					el.dataset.state = "card";
				} else if (interactive) {
					el.dataset.state = "link";
				} else {
					delete el.dataset.state;
				}
			};

			document.addEventListener("mousemove", onMove);
			return () => document.removeEventListener("mousemove", onMove);
		},
		{ scope: ref },
	);

	return <div ref={ref} className={classes.cursor} aria-hidden="true" />;
}
