import { Box } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import classes from "./section-wrapper.module.css";

type SectionWrapperProps = {
	id?: string;
	children: React.ReactNode;
};

export function SectionWrapper({ id, children }: SectionWrapperProps) {
	const { ref, entry } = useIntersection({ threshold: 0.1 });

	return (
		<Box
			id={id}
			ref={ref}
			className={classes.wrapper}
			data-visible={entry?.isIntersecting || undefined}
		>
			{children}
		</Box>
	);
}
