import { Box } from "@mantine/core";
import classes from "./tech-tag.module.css";

type TechTagProps = {
	label: string;
	variant?: "blue" | "indigo" | "slate";
};

export function TechTag({ label, variant = "slate" }: TechTagProps) {
	return (
		<Box
			component="span"
			className={classes.tag}
			data-variant={variant}
			display="inline-flex"
			px={14}
			py={6}
			bdrs={2}
			ff="monospace"
			fz={11}
			lts="0.08em"
			tt="uppercase"
			style={{ alignItems: "center" }}
		>
			{label}
		</Box>
	);
}
