import { useGSAP } from "@gsap/react";
import { useValue } from "@legendapp/state/react";
import gsap from "gsap";
import { type ReactNode, useEffect, useRef } from "react";
import { prefersReducedMotion } from "./motion";
import { getApp } from "./registry";
import type { AppId } from "./types";
import classes from "./window.module.css";
import {
	closeWindow,
	focusWindow,
	minimizeWindow,
	selectFocusedApp,
	setWindowRect,
	toggleMaximizeWindow,
	windowStore$,
} from "./window-store";

const MIN_WIDTH = 320;
const MIN_HEIGHT = 240;
const MENUBAR = 40;
const EDGE_VISIBLE = 96;

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const RESIZE_HANDLES: ResizeDirection[] = [
	"n",
	"s",
	"e",
	"w",
	"ne",
	"nw",
	"se",
	"sw",
];

export function OsWindowFrame({
	appId,
	children,
}: {
	appId: AppId;
	children: ReactNode;
}) {
	const win$ = windowStore$.windows[appId];
	const win = useValue(win$);
	const isFocused = useValue(selectFocusedApp) === appId;
	const frameRef = useRef<HTMLDivElement>(null);
	const gestureCleanupRef = useRef<(() => void) | null>(null);
	const app = getApp(appId);

	useEffect(() => {
		return () => gestureCleanupRef.current?.();
	}, []);

	useGSAP(
		() => {
			if (prefersReducedMotion()) return;
			gsap.from(frameRef.current, {
				scale: 0.92,
				opacity: 0,
				duration: 0.28,
				ease: "power3.out",
			});
		},
		{ scope: frameRef },
	);

	if (!win) return null;

	const animateOut = (vars: gsap.TweenVars, onDone: () => void) => {
		if (prefersReducedMotion() || !frameRef.current) {
			onDone();
			return;
		}
		gsap.to(frameRef.current, {
			duration: 0.2,
			ease: "power2.in",
			...vars,
			onComplete: onDone,
		});
	};

	const handleClose = () =>
		animateOut({ scale: 0.92, opacity: 0 }, () => closeWindow(appId));

	const handleMinimize = () =>
		animateOut({ scale: 0.5, opacity: 0, y: window.innerHeight / 2 }, () => {
			const el = frameRef.current;
			const rect = win$.rect.peek();
			if (el && rect) {
				// clearProps wipes React-managed inline styles too; re-apply the
				// rect so the frame is intact when the window is restored
				gsap.set(el, { clearProps: "all" });
				el.style.width = `${rect.width}px`;
				el.style.height = `${rect.height}px`;
				el.style.transform = `translate(${rect.x}px, ${rect.y}px)`;
				el.style.zIndex = String(win$.zIndex.peek());
			}
			minimizeWindow(appId);
		});

	const startDrag = (e: React.PointerEvent) => {
		e.stopPropagation();
		if (win$.maximized.peek()) return;
		if ((e.target as HTMLElement).closest("button")) return;
		e.preventDefault();
		gestureCleanupRef.current?.();
		focusWindow(appId);
		const startX = e.clientX;
		const startY = e.clientY;
		const start = win$.rect.peek();
		if (!start) return;
		const onMove = (ev: PointerEvent) => {
			setWindowRect(appId, {
				...start,
				x: clamp(
					start.x + ev.clientX - startX,
					EDGE_VISIBLE - start.width,
					window.innerWidth - EDGE_VISIBLE,
				),
				y: clamp(
					start.y + ev.clientY - startY,
					MENUBAR,
					window.innerHeight - 48,
				),
			});
		};
		const cleanup = () => {
			window.removeEventListener("pointermove", onMove);
			window.removeEventListener("pointerup", onUp);
			window.removeEventListener("pointercancel", onUp);
			gestureCleanupRef.current = null;
		};
		const onUp = () => cleanup();
		gestureCleanupRef.current = cleanup;
		window.addEventListener("pointermove", onMove);
		window.addEventListener("pointerup", onUp);
		window.addEventListener("pointercancel", onUp);
	};

	const startResize =
		(direction: ResizeDirection) => (e: React.PointerEvent) => {
			if (win$.maximized.peek()) return;
			e.preventDefault();
			e.stopPropagation();
			gestureCleanupRef.current?.();
			focusWindow(appId);
			const startX = e.clientX;
			const startY = e.clientY;
			const start = win$.rect.peek();
			if (!start) return;
			const onMove = (ev: PointerEvent) => {
				const dx = ev.clientX - startX;
				const dy = ev.clientY - startY;
				let { x, y, width, height } = start;
				if (direction.includes("e"))
					width = Math.max(MIN_WIDTH, start.width + dx);
				if (direction.includes("s"))
					height = Math.max(MIN_HEIGHT, start.height + dy);
				if (direction.includes("w")) {
					width = Math.max(MIN_WIDTH, start.width - dx);
					x = start.x + (start.width - width);
				}
				if (direction.includes("n")) {
					height = Math.max(MIN_HEIGHT, start.height - dy);
					y = clamp(
						start.y + (start.height - height),
						MENUBAR,
						window.innerHeight - 48,
					);
					height = start.height + (start.y - y);
				}
				setWindowRect(appId, { x, y, width, height });
			};
			const cleanup = () => {
				window.removeEventListener("pointermove", onMove);
				window.removeEventListener("pointerup", onUp);
				window.removeEventListener("pointercancel", onUp);
				gestureCleanupRef.current = null;
			};
			const onUp = () => cleanup();
			gestureCleanupRef.current = cleanup;
			window.addEventListener("pointermove", onMove);
			window.addEventListener("pointerup", onUp);
			window.addEventListener("pointercancel", onUp);
		};

	const style: React.CSSProperties = win.maximized
		? { zIndex: win.zIndex }
		: {
				zIndex: win.zIndex,
				width: win.rect.width,
				height: win.rect.height,
				transform: `translate(${win.rect.x}px, ${win.rect.y}px)`,
			};

	return (
		<div
			ref={frameRef}
			className={classes.frame}
			data-maximized={win.maximized || undefined}
			data-minimized={win.minimized || undefined}
			data-focused={isFocused || undefined}
			style={style}
			onPointerDown={() => focusWindow(appId)}
			role="dialog"
			aria-label={app.title}
		>
			<div className={classes.titleBar} onPointerDown={startDrag}>
				<div className={classes.trafficLights}>
					<button
						type="button"
						className={classes.lightClose}
						onClick={handleClose}
						aria-label={`Close ${app.title}`}
					/>
					<button
						type="button"
						className={classes.lightMinimize}
						onClick={handleMinimize}
						aria-label={`Minimize ${app.title}`}
					/>
					<button
						type="button"
						className={classes.lightZoom}
						onClick={() => toggleMaximizeWindow(appId)}
						aria-label={`Zoom ${app.title}`}
					/>
				</div>
				<span className={classes.title}>{app.title}</span>
				<span className={classes.titleSpacer} />
			</div>
			<div className={classes.content}>{children}</div>
			{!win.maximized &&
				RESIZE_HANDLES.map((direction) => (
					<div
						key={direction}
						className={classes.resizeHandle}
						data-direction={direction}
						onPointerDown={startResize(direction)}
					/>
				))}
		</div>
	);
}
