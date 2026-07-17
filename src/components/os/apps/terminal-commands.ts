import { APPS } from "../registry";
import type { AppId } from "../types";

export type TerminalAction = { type: "open"; appId: AppId } | { type: "clear" };

export type TerminalResult = {
	output: string[];
	action?: TerminalAction;
};

const APP_IDS = APPS.map((app) => app.id);

export function runCommand(input: string): TerminalResult {
	const trimmed = input.trim();
	if (trimmed === "") return { output: [] };
	const [cmd, ...args] = trimmed.split(/\s+/);
	switch (cmd) {
		case "help":
			return {
				output: [
					"Available commands:",
					"  help          show this message",
					"  whoami        who is this guy?",
					"  ls            list installed apps",
					"  open <app>    open an app window",
					"  clear         clear the terminal",
				],
			};
		case "whoami":
			return {
				output: [
					"enyel — Senior Frontend Engineer, Lisbon 🇵🇹",
					"5+ years across gaming, Web3, and EdTech.",
				],
			};
		case "ls":
			return { output: APP_IDS.map((id) => `${id}.app`) };
		case "open": {
			const target = (args[0] ?? "").replace(/\.app$/, "");
			const appId = APP_IDS.find((id) => id === target);
			if (!appId) {
				return { output: [`open: no such app: ${args[0] ?? ""}`] };
			}
			return {
				output: [`Opening ${appId}.app…`],
				action: { type: "open", appId },
			};
		}
		case "clear":
			return { output: [], action: { type: "clear" } };
		case "sudo":
			return { output: ["sudo: permission denied — nice try 😏"] };
		default:
			return { output: [`zsh: command not found: ${cmd}`] };
	}
}
