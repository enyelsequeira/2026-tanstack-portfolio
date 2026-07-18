import { batch, observable } from "@legendapp/state";
import { getApp } from "./registry";
import type { AppId, OsWindow, Rect } from "./types";

type WindowStoreState = {
	/** windows keyed by app id — one window per app, stable identity for
	 * Legend State's fine-grained tracking (no array index/id juggling) */
	windows: Partial<Record<AppId, OsWindow>>;
	/** open order, drives render order; z-index drives stacking */
	order: AppId[];
	nextZIndex: number;
};

/** Apps open on boot — the server renders their window content (SEO)
 * because the store is initialized with them at module load, not in an
 * effect. Must stay deterministic: SSR and client hydration share it. */
const BOOT_APPS: AppId[] = ["about"];

function bootState(appIds: AppId[]): WindowStoreState {
	const windows: Partial<Record<AppId, OsWindow>> = {};
	appIds.forEach((appId, index) => {
		windows[appId] = {
			appId,
			rect: getApp(appId).defaultRect,
			prevRect: null,
			minimized: false,
			maximized: false,
			zIndex: index + 1,
		};
	});
	return { windows, order: [...appIds], nextZIndex: appIds.length + 1 };
}

export const windowStore$ = observable<WindowStoreState>(bootState(BOOT_APPS));

/** App id of the top non-minimized window, or null. Reactive when called
 * inside `useValue`/`observe`; plain read anywhere else. */
export function selectFocusedApp(): AppId | null {
	const windows = windowStore$.windows.get();
	let top: OsWindow | null = null;
	for (const win of Object.values(windows)) {
		if (!win || win.minimized) continue;
		if (!top || win.zIndex > top.zIndex) top = win;
	}
	return top?.appId ?? null;
}

export function openWindow(appId: AppId): void {
	if (windowStore$.windows[appId].peek()) {
		focusWindow(appId);
		return;
	}
	batch(() => {
		const zIndex = windowStore$.nextZIndex.peek();
		windowStore$.windows[appId].set({
			appId,
			rect: getApp(appId).defaultRect,
			prevRect: null,
			minimized: false,
			maximized: false,
			zIndex,
		});
		windowStore$.order.push(appId);
		windowStore$.nextZIndex.set(zIndex + 1);
	});
}

export function closeWindow(appId: AppId): void {
	batch(() => {
		windowStore$.windows[appId].delete();
		windowStore$.order.set(
			windowStore$.order.peek().filter((id) => id !== appId),
		);
	});
}

export function focusWindow(appId: AppId): void {
	const win$ = windowStore$.windows[appId];
	if (!win$.peek()) return;
	batch(() => {
		const zIndex = windowStore$.nextZIndex.peek();
		win$.assign({ zIndex, minimized: false });
		windowStore$.nextZIndex.set(zIndex + 1);
	});
}

export function minimizeWindow(appId: AppId): void {
	if (!windowStore$.windows[appId].peek()) return;
	windowStore$.windows[appId].minimized.set(true);
}

export function toggleMaximizeWindow(appId: AppId): void {
	const win$ = windowStore$.windows[appId];
	const win = win$.peek();
	if (!win) return;
	batch(() => {
		const zIndex = windowStore$.nextZIndex.peek();
		if (win.maximized) {
			win$.assign({
				maximized: false,
				rect: { ...(win.prevRect ?? win.rect) },
				prevRect: null,
				zIndex,
			});
		} else {
			win$.assign({ maximized: true, prevRect: { ...win.rect }, zIndex });
		}
		windowStore$.nextZIndex.set(zIndex + 1);
	});
}

export function setWindowRect(appId: AppId, rect: Rect): void {
	if (!windowStore$.windows[appId].peek()) return;
	windowStore$.windows[appId].rect.set(rect);
}

/** Restore the freshly-booted state — power cycle and tests. */
export function resetWindowStore(appIds: AppId[] = BOOT_APPS): void {
	windowStore$.set(bootState(appIds));
}
