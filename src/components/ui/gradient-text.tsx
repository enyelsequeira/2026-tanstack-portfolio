import { Text, type TextProps } from "@mantine/core";
import classes from "./gradient-text.module.css";

type GradientTextProps = TextProps & {
	children: React.ReactNode;
	ref?: React.Ref<HTMLSpanElement>;
};

export function GradientText({ children, ref, ...props }: GradientTextProps) {
	return (
		<Text
			ref={ref}
			component="span"
			inherit
			className={classes.gradient}
			{...props}
		>
			{children}
		</Text>
	);
}
