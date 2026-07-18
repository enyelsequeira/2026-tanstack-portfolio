import { useValue } from "@legendapp/state/react";
import { Tooltip } from "@mantine/core";
import gsap from "gsap";
import { useRef } from "react";
import classes from "./dock.module.css";
import { prefersReducedMotion } from "./motion";
import { APPS } from "./registry";
import { openWindow, windowStore$ } from "./window-store";

export function Dock() {
	const order = useValue(windowStore$.order);
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
			<Tooltip.Group openDelay={300} closeDelay={100}>
				{APPS.map((app) => {
					const isOpen = order.includes(app.id);
					return (
						<Tooltip
							key={app.id}
							label={app.title}
							position="top"
							withArrow
							offset={12}
						>
							<button
								ref={(el) => {
									if (el) iconRefs.current.set(app.id, el);
									else iconRefs.current.delete(app.id);
								}}
								type="button"
								className={classes.icon}
								data-open={isOpen || undefined}
								onClick={() => openWindow(app.id)}
								aria-label={`Open ${app.title}`}
							>
								<app.icon size={26} stroke={1.5} />
								<span className={classes.dot} />
							</button>
						</Tooltip>
					);
				})}
			</Tooltip.Group>
		</nav>
	);
}
