import { Box } from "@mantine/core";
import classes from "./stat-card.module.css";

type StatCardProps = {
	value: string;
	suffix: string;
	label: string;
};

export function StatCard({ value, suffix, label }: StatCardProps) {
	return (
		<Box className={classes.card}>
			<div className={classes.number}>
				{value}
				<span className={classes.suffix}>{suffix}</span>
			</div>
			<div className={classes.label}>{label}</div>
		</Box>
	);
}
