import gsap from "gsap";
import { useRef } from "react";
import classes from "./dock.module.css";
import { prefersReducedMotion } from "./motion";
import { APPS } from "./registry";
import { useWindowManager } from "./window-manager";

export function Dock() {
	const { state, open } = useWindowManager();
	const iconRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

	const onPointerMove = (e: React.PointerEvent) => {
		if (prefersReducedMotion()) return;
		for (const el of iconRefs.current.values()) {
			const rect = el.getBoundingClientRect();
			const center = rect.left + rect.width / 2;
			const distance = Math.abs(e.clientX - center);
			const scale = Math.max(1, 1.45 - distance / 130);
			gsap.to(el, {
				scale,
				y: -(scale - 1) * 16,
				duration: 0.15,
				ease: "power2.out",
			});
		}
	};

	const onPointerLeave = () => {
		if (prefersReducedMotion()) return;
		for (const el of iconRefs.current.values()) {
			gsap.to(el, { scale: 1, y: 0, duration: 0.25, ease: "power2.out" });
		}
	};

	return (
		<nav
			className={classes.dock}
			onPointerMove={onPointerMove}
			onPointerLeave={onPointerLeave}
			aria-label="Dock"
		>
			{APPS.map((app) => {
				const isOpen = state.windows.some((w) => w.appId === app.id);
				return (
					<button
						key={app.id}
						ref={(el) => {
							if (el) iconRefs.current.set(app.id, el);
							else iconRefs.current.delete(app.id);
						}}
						type="button"
						className={classes.icon}
						data-open={isOpen || undefined}
						onClick={() => open(app.id)}
						aria-label={`Open ${app.title}`}
						title={app.title}
					>
						<app.icon size={26} stroke={1.5} />
						<span className={classes.dot} />
					</button>
				);
			})}
		</nav>
	);
}
