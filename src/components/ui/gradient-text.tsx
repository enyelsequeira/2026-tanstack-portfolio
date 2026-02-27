import { Text, type TextProps } from "@mantine/core";
import classes from "./gradient-text.module.css";

type GradientTextProps = TextProps & {
	children: React.ReactNode;
};

export function GradientText({ children, ...props }: GradientTextProps) {
	return (
		<Text component="span" inherit className={classes.gradient} {...props}>
			{children}
		</Text>
	);
}
