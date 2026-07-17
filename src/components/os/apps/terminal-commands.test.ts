import { describe, expect, it } from "vitest";
import { runCommand, suggestCommands } from "./terminal-commands";

describe("runCommand", () => {
	it("returns empty output for blank input", () => {
		expect(runCommand("   ")).toEqual({ output: [] });
	});

	it("help lists available commands", () => {
		const result = runCommand("help");
		expect(result.output.join("\n")).toContain("open <app>");
	});

	it("whoami introduces enyel", () => {
		expect(runCommand("whoami").output[0]).toContain("enyel");
	});

	it("ls lists installed apps", () => {
		expect(runCommand("ls").output).toContain("about.app");
		expect(runCommand("ls").output).toContain("terminal.app");
	});

	it("open <app> returns an open action", () => {
		expect(runCommand("open projects").action).toEqual({
			type: "open",
			appId: "projects",
		});
		expect(runCommand("open blog.app").action).toEqual({
			type: "open",
			appId: "blog",
		});
	});

	it("open with an unknown app errors", () => {
		const result = runCommand("open nope");
		expect(result.action).toBeUndefined();
		expect(result.output[0]).toContain("no such app");
	});

	it("open without an argument prints usage", () => {
		expect(runCommand("open").output[0]).toBe("usage: open <app>");
	});
});

describe("suggestCommands", () => {
	it("returns nothing for empty input", () => {
		expect(suggestCommands("")).toEqual([]);
	});

	it("suggests matching command names for a partial first word", () => {
		expect(suggestCommands("he")).toEqual(["help"]);
		expect(suggestCommands("o")).toEqual(["open"]);
	});

	it("excludes an exact command match", () => {
		expect(suggestCommands("help")).toEqual([]);
	});

	it("suggests all apps after `open `", () => {
		expect(suggestCommands("open ")).toEqual([
			"about",
			"projects",
			"blog",
			"contact",
			"terminal",
		]);
	});

	it("suggests matching apps for a partial argument", () => {
		expect(suggestCommands("open b")).toEqual(["blog"]);
	});

	it("returns nothing for unknown prefixes or extra arguments", () => {
		expect(suggestCommands("x")).toEqual([]);
		expect(suggestCommands("open blog extra")).toEqual([]);
		expect(suggestCommands("ls a")).toEqual([]);
	});

	it("clear returns a clear action", () => {
		expect(runCommand("clear").action).toEqual({ type: "clear" });
	});

	it("sudo is denied", () => {
		expect(runCommand("sudo rm -rf /").output[0]).toContain(
			"permission denied",
		);
	});

	it("unknown commands report command not found", () => {
		expect(runCommand("frobnicate").output[0]).toContain(
			"command not found: frobnicate",
		);
	});
});
