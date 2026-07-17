import { describe, expect, it } from "vitest";
import { runCommand } from "./terminal-commands";

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
