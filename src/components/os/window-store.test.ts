import { beforeEach, describe, expect, it } from "vitest";
import { getApp } from "./registry";
import {
	closeWindow,
	focusWindow,
	minimizeWindow,
	openWindow,
	resetWindowStore,
	selectFocusedApp,
	setWindowRect,
	toggleMaximizeWindow,
	windowStore$,
} from "./window-store";

beforeEach(() => {
	resetWindowStore([]);
});

describe("window store", () => {
	it("boots with the given apps pre-opened (SSR initial state)", () => {
		resetWindowStore(["about"]);
		expect(windowStore$.order.get()).toEqual(["about"]);
		expect(windowStore$.windows.about.rect.get()).toEqual(
			getApp("about").defaultRect,
		);
		expect(windowStore$.nextZIndex.get()).toBe(2);
		expect(selectFocusedApp()).toBe("about");
	});

	it("opens a window with the app default rect and increasing z-index", () => {
		openWindow("about");
		expect(windowStore$.order.get()).toEqual(["about"]);
		expect(windowStore$.windows.about.rect.get()).toEqual(
			getApp("about").defaultRect,
		);
		expect(windowStore$.windows.about.zIndex.get()).toBe(1);
		expect(windowStore$.nextZIndex.get()).toBe(2);
	});

	it("focuses instead of duplicating when opening an already-open app", () => {
		openWindow("about");
		openWindow("projects");
		openWindow("about");
		expect(windowStore$.order.get()).toEqual(["about", "projects"]);
		expect(windowStore$.windows.about.zIndex.get()).toBe(3);
		expect(selectFocusedApp()).toBe("about");
	});

	it("restores a minimized window when re-opened", () => {
		openWindow("about");
		minimizeWindow("about");
		expect(windowStore$.windows.about.minimized.get()).toBe(true);
		expect(selectFocusedApp()).toBeNull();
		openWindow("about");
		expect(windowStore$.windows.about.minimized.get()).toBe(false);
	});

	it("closes a window", () => {
		openWindow("about");
		closeWindow("about");
		expect(windowStore$.order.get()).toEqual([]);
		expect(windowStore$.windows.about.get()).toBeUndefined();
	});

	it("focus raises z-index; ignores unknown windows", () => {
		openWindow("about");
		openWindow("projects");
		focusWindow("about");
		expect(selectFocusedApp()).toBe("about");
		const nextZIndex = windowStore$.nextZIndex.get();
		focusWindow("terminal");
		expect(windowStore$.nextZIndex.get()).toBe(nextZIndex);
		expect(windowStore$.windows.terminal.get()).toBeUndefined();
	});

	it("toggle maximize saves and restores the previous rect", () => {
		openWindow("about");
		const original = { ...getApp("about").defaultRect };
		toggleMaximizeWindow("about");
		expect(windowStore$.windows.about.maximized.get()).toBe(true);
		expect(windowStore$.windows.about.prevRect.get()).toEqual(original);
		toggleMaximizeWindow("about");
		expect(windowStore$.windows.about.maximized.get()).toBe(false);
		expect(windowStore$.windows.about.rect.get()).toEqual(original);
		expect(windowStore$.windows.about.prevRect.get()).toBeNull();
	});

	it("setWindowRect updates position/size; ignores unknown windows", () => {
		openWindow("about");
		const rect = { x: 10, y: 50, width: 500, height: 400 };
		setWindowRect("about", rect);
		expect(windowStore$.windows.about.rect.get()).toEqual(rect);
		setWindowRect("terminal", rect);
		expect(windowStore$.windows.terminal.get()).toBeUndefined();
	});

	it("reset restores the booted state after arbitrary changes", () => {
		resetWindowStore(["about"]);
		openWindow("projects");
		toggleMaximizeWindow("projects");
		closeWindow("about");
		resetWindowStore(["about"]);
		expect(windowStore$.order.get()).toEqual(["about"]);
		expect(windowStore$.windows.projects.get()).toBeUndefined();
		expect(windowStore$.windows.about.maximized.get()).toBe(false);
		expect(windowStore$.nextZIndex.get()).toBe(2);
	});
});
