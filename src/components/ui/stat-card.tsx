import { Box } from "@mantine/core";
import classes from "./stat-card.module.css";

type StatCardProps = {
	value: string;
	suffix: string;
	label: string;
	ref?: React.Ref<HTMLDivElement>;
};

export function StatCard({ value, suffix, label, ref }: StatCardProps) {
	return (
		<Box ref={ref} className={classes.card}>
			<div className={classes.number}>
				<span data-stat-value>{value}</span>
				<span className={classes.suffix}>{suffix}</span>
			</div>
			<div className={classes.label}>{label}</div>
		</Box>
	);
}
