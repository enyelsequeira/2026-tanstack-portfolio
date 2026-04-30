import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import { gsap } from "gsap";
import { useRef } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { StatCard } from "@/components/ui/stat-card";
import { stats } from "@/data/stats";
import classes from "./stats-section.module.css";

function parseTarget(value: string): number {
	const n = Number.parseFloat(value);
	return Number.isFinite(n) ? n : 0;
}

export function StatsSection() {
	const sectionRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const grid = gridRef.current;
			const root = sectionRef.current;
			if (!grid || !root) return;

			const cards = Array.from(grid.children) as HTMLElement[];
			const valueEls = root.querySelectorAll<HTMLElement>("[data-stat-value]");
			const reduced = window.matchMedia(
				"(max-width: 768px), (prefers-reduced-motion: reduce)",
			).matches;

			gsap.from(cards, {
				opacity: 0,
				y: reduced ? 16 : 24,
				duration: reduced ? 0.5 : 0.7,
				ease: "power3.out",
				stagger: reduced ? 0.1 : 0.15,
				scrollTrigger: {
					trigger: root,
					start: reduced ? "top 90%" : "top 80%",
					once: true,
				},
			});

			if (!reduced) {
				valueEls.forEach((el, i) => {
					const target = parseTarget(stats[i]?.value ?? "0");
					const isInteger = target % 1 === 0;
					const obj = { val: 0 };
					gsap.to(obj, {
						val: target,
						duration: 1.2,
						ease: "power3.out",
						snap: { val: isInteger ? 1 : 0.1 },
						delay: 0.15 * i,
						onUpdate: () => {
							el.textContent = isInteger
								? Math.round(obj.val).toString()
								: obj.val.toFixed(1);
						},
						scrollTrigger: {
							trigger: root,
							start: "top 80%",
							once: true,
						},
					});
				});
			}
		},
		{ scope: sectionRef },
	);

	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
			<SectionWrapper id="stats">
				<div ref={sectionRef} className={classes.section}>
					<SectionLabel>By The Numbers</SectionLabel>
					<div ref={gridRef} className={classes.grid}>
						{stats.map((stat) => (
							<StatCard
								key={stat.label}
								value={stat.value}
								suffix={stat.suffix}
								label={stat.label}
							/>
						))}
					</div>
				</div>
			</SectionWrapper>
		</Container>
	);
}
