import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useReducer,
} from "react";
import { getApp } from "./registry";
import type { AppId, OsWindow, Rect } from "./types";

export type WindowManagerState = {
	windows: OsWindow[];
	nextZIndex: number;
};

export type WindowManagerAction =
	| { type: "OPEN"; appId: AppId }
	| { type: "CLOSE"; appId: AppId }
	| { type: "FOCUS"; appId: AppId }
	| { type: "MINIMIZE"; appId: AppId }
	| { type: "TOGGLE_MAXIMIZE"; appId: AppId }
	| { type: "SET_RECT"; appId: AppId; rect: Rect };

export const initialWindowManagerState: WindowManagerState = {
	windows: [],
	nextZIndex: 1,
};

function focusWindow(
	state: WindowManagerState,
	appId: AppId,
): WindowManagerState {
	return {
		windows: state.windows.map((w) =>
			w.appId === appId
				? { ...w, zIndex: state.nextZIndex, minimized: false }
				: w,
		),
		nextZIndex: state.nextZIndex + 1,
	};
}

export function windowManagerReducer(
	state: WindowManagerState,
	action: WindowManagerAction,
): WindowManagerState {
	switch (action.type) {
		case "OPEN": {
			if (state.windows.some((w) => w.appId === action.appId)) {
				return focusWindow(state, action.appId);
			}
			const win: OsWindow = {
				appId: action.appId,
				rect: getApp(action.appId).defaultRect,
				prevRect: null,
				minimized: false,
				maximized: false,
				zIndex: state.nextZIndex,
			};
			return {
				windows: [...state.windows, win],
				nextZIndex: state.nextZIndex + 1,
			};
		}
		case "CLOSE":
			return {
				...state,
				windows: state.windows.filter((w) => w.appId !== action.appId),
			};
		case "FOCUS":
			if (!state.windows.some((w) => w.appId === action.appId)) return state;
			return focusWindow(state, action.appId);
		case "MINIMIZE":
			return {
				...state,
				windows: state.windows.map((w) =>
					w.appId === action.appId ? { ...w, minimized: true } : w,
				),
			};
		case "TOGGLE_MAXIMIZE":
			return {
				windows: state.windows.map((w) => {
					if (w.appId !== action.appId) return w;
					if (w.maximized) {
						return {
							...w,
							maximized: false,
							rect: w.prevRect ?? w.rect,
							prevRect: null,
							zIndex: state.nextZIndex,
						};
					}
					return {
						...w,
						maximized: true,
						prevRect: w.rect,
						zIndex: state.nextZIndex,
					};
				}),
				nextZIndex: state.nextZIndex + 1,
			};
		case "SET_RECT":
			return {
				...state,
				windows: state.windows.map((w) =>
					w.appId === action.appId ? { ...w, rect: action.rect } : w,
				),
			};
	}
}

export function selectFocusedApp(state: WindowManagerState): AppId | null {
	let top: OsWindow | null = null;
	for (const w of state.windows) {
		if (w.minimized) continue;
		if (!top || w.zIndex > top.zIndex) top = w;
	}
	return top?.appId ?? null;
}

type WindowManagerContextValue = {
	state: WindowManagerState;
	open: (id: AppId) => void;
	close: (id: AppId) => void;
	focus: (id: AppId) => void;
	minimize: (id: AppId) => void;
	toggleMaximize: (id: AppId) => void;
	setRect: (id: AppId, rect: Rect) => void;
};

const WindowManagerContext = createContext<WindowManagerContextValue | null>(
	null,
);

export function WindowManagerProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(
		windowManagerReducer,
		initialWindowManagerState,
	);

	const value = useMemo<WindowManagerContextValue>(
		() => ({
			state,
			open: (appId) => dispatch({ type: "OPEN", appId }),
			close: (appId) => dispatch({ type: "CLOSE", appId }),
			focus: (appId) => dispatch({ type: "FOCUS", appId }),
			minimize: (appId) => dispatch({ type: "MINIMIZE", appId }),
			toggleMaximize: (appId) => dispatch({ type: "TOGGLE_MAXIMIZE", appId }),
			setRect: (appId, rect) => dispatch({ type: "SET_RECT", appId, rect }),
		}),
		[state],
	);

	return (
		<WindowManagerContext.Provider value={value}>
			{children}
		</WindowManagerContext.Provider>
	);
}

export function useWindowManager(): WindowManagerContextValue {
	const ctx = useContext(WindowManagerContext);
	if (!ctx) {
		throw new Error(
			"useWindowManager must be used inside WindowManagerProvider",
		);
	}
	return ctx;
}
