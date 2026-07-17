import { describe, expect, it } from "vitest";
import { getApp } from "./registry";
import type { WindowManagerState } from "./window-manager";
import {
	initialWindowManagerState,
	selectFocusedApp,
	windowManagerReducer,
} from "./window-manager";

function open(
	state: WindowManagerState,
	appId: "about" | "projects" | "terminal",
) {
	return windowManagerReducer(state, { type: "OPEN", appId });
}

describe("windowManagerReducer", () => {
	it("opens a window with the app default rect and increasing z-index", () => {
		const state = open(initialWindowManagerState, "about");
		expect(state.windows).toHaveLength(1);
		expect(state.windows[0].rect).toEqual(getApp("about").defaultRect);
		expect(state.windows[0].zIndex).toBe(1);
		expect(state.nextZIndex).toBe(2);
	});

	it("focuses instead of duplicating when opening an already-open app", () => {
		let state = open(initialWindowManagerState, "about");
		state = open(state, "projects");
		state = open(state, "about");
		expect(state.windows).toHaveLength(2);
		const about = state.windows.find((w) => w.appId === "about");
		expect(about?.zIndex).toBe(3);
		expect(selectFocusedApp(state)).toBe("about");
	});

	it("restores a minimized window when re-opened", () => {
		let state = open(initialWindowManagerState, "about");
		state = windowManagerReducer(state, { type: "MINIMIZE", appId: "about" });
		expect(state.windows[0].minimized).toBe(true);
		expect(selectFocusedApp(state)).toBeNull();
		state = open(state, "about");
		expect(state.windows[0].minimized).toBe(false);
	});

	it("closes a window", () => {
		let state = open(initialWindowManagerState, "about");
		state = windowManagerReducer(state, { type: "CLOSE", appId: "about" });
		expect(state.windows).toHaveLength(0);
	});

	it("FOCUS raises z-index; ignores unknown windows", () => {
		let state = open(initialWindowManagerState, "about");
		state = open(state, "projects");
		state = windowManagerReducer(state, { type: "FOCUS", appId: "about" });
		expect(selectFocusedApp(state)).toBe("about");
		const before = state;
		state = windowManagerReducer(state, { type: "FOCUS", appId: "terminal" });
		expect(state).toBe(before);
	});

	it("toggle maximize saves and restores the previous rect", () => {
		let state = open(initialWindowManagerState, "about");
		const original = state.windows[0].rect;
		state = windowManagerReducer(state, {
			type: "TOGGLE_MAXIMIZE",
			appId: "about",
		});
		expect(state.windows[0].maximized).toBe(true);
		expect(state.windows[0].prevRect).toEqual(original);
		state = windowManagerReducer(state, {
			type: "TOGGLE_MAXIMIZE",
			appId: "about",
		});
		expect(state.windows[0].maximized).toBe(false);
		expect(state.windows[0].rect).toEqual(original);
		expect(state.windows[0].prevRect).toBeNull();
	});

	it("SET_RECT updates position/size", () => {
		let state = open(initialWindowManagerState, "about");
		const rect = { x: 10, y: 50, width: 500, height: 400 };
		state = windowManagerReducer(state, {
			type: "SET_RECT",
			appId: "about",
			rect,
		});
		expect(state.windows[0].rect).toEqual(rect);
	});
});
