export type Stat = {
	value: string;
	suffix: string;
	label: string;
};

export const stats: Stat[] = [
	{ value: "5", suffix: "+", label: "Years experience" },
	{ value: "2", suffix: ".1M", label: "YouTube tutorial views" },
	{ value: "4", suffix: "×", label: "Languages spoken" },
	{ value: "3", suffix: "+", label: "Industries shipped" },
];
