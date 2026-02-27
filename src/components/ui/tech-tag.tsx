import { Box } from "@mantine/core";
import classes from "./tech-tag.module.css";

type TechTagProps = {
	label: string;
	variant?: "blue" | "indigo" | "slate";
};

export function TechTag({ label, variant = "slate" }: TechTagProps) {
	return (
		<Box component="span" className={classes.tag} data-variant={variant}>
			{label}
		</Box>
	);
}
