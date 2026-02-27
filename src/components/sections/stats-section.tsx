import { Container } from "@mantine/core";
import { SectionLabel } from "@/components/ui/section-label";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { StatCard } from "@/components/ui/stat-card";
import { stats } from "@/data/stats";
import classes from "./stats-section.module.css";

export function StatsSection() {
	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
			<SectionWrapper id="stats">
				<div className={classes.section}>
					<SectionLabel>By The Numbers</SectionLabel>
					<div className={classes.grid}>
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
