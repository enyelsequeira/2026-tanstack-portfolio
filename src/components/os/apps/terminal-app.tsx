import { useEffect, useRef, useState } from "react";
import type { AppId } from "../types";
import { useWindowManager } from "../window-manager";
import classes from "./terminal-app.module.css";
import { runCommand, suggestCommands } from "./terminal-commands";

type HistoryEntry = {
	id: number;
	command: string;
	output: string[];
};

const WELCOME = ["EnyelOS Terminal — type `help` to get started."];

export function TerminalApp({
	onOpenApp,
}: {
	onOpenApp?: (appId: AppId) => void;
}) {
	const { open } = useWindowManager();
	const openApp = onOpenApp ?? open;
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [input, setInput] = useState("");
	const nextId = useRef(1);
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: re-run on new history entries to auto-scroll
	useEffect(() => {
		scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
	}, [history]);

	const suggestions = suggestCommands(input);

	const acceptSuggestion = (e: React.KeyboardEvent) => {
		if (e.key !== "Tab") return;
		e.preventDefault();
		const first = suggestions[0];
		if (!first) return;
		const base = input.trimStart();
		if (!base.includes(" ")) {
			setInput(`${first} `);
		} else {
			setInput(`${base.slice(0, base.indexOf(" ") + 1)}${first}`);
		}
	};

	const submit = (e: React.FormEvent) => {
		e.preventDefault();
		const result = runCommand(input);
		if (result.action?.type === "clear") {
			setHistory([]);
		} else {
			setHistory((prev) => [
				...prev,
				{ id: nextId.current++, command: input, output: result.output },
			]);
		}
		if (result.action?.type === "open") openApp(result.action.appId);
		setInput("");
	};

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: focus proxy for the prompt input
		// biome-ignore lint/a11y/useKeyWithClickEvents: focus proxy has no independent keyboard affordance
		<div
			className={classes.app}
			ref={scrollRef}
			onClick={() => inputRef.current?.focus()}
		>
			{WELCOME.map((line) => (
				<div key={line} className={classes.line}>
					{line}
				</div>
			))}
			{history.map((entry) => (
				<div key={entry.id}>
					<div className={classes.line}>
						<span className={classes.prompt}>enyel@os ~ %</span> {entry.command}
					</div>
					{entry.output.map((line, index) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: output lines are static per entry
						<div key={index} className={classes.output}>
							{line}
						</div>
					))}
				</div>
			))}
			<form onSubmit={submit} className={classes.inputLine}>
				<span className={classes.prompt}>enyel@os ~ %</span>
				<input
					ref={inputRef}
					className={classes.input}
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={acceptSuggestion}
					spellCheck={false}
					autoCapitalize="off"
					autoComplete="off"
					aria-label="Terminal input"
				/>
			</form>
			{suggestions.length > 0 && (
				<div className={classes.suggestions} aria-live="polite">
					{suggestions.join("  ")}
					<span className={classes.suggestionsHint}> — tab to complete</span>
				</div>
			)}
		</div>
	);
}
