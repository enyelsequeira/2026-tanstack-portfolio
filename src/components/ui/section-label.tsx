import { Box } from "@mantine/core";
import classes from "./section-label.module.css";

type SectionLabelProps = {
	children: React.ReactNode;
};

export function SectionLabel({ children }: SectionLabelProps) {
	return <Box className={classes.label}>{children}</Box>;
}
