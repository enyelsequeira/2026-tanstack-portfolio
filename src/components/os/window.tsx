import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type ReactNode, useEffect, useRef } from "react";
import { prefersReducedMotion } from "./motion";
import { getApp } from "./registry";
import type { OsWindow } from "./types";
import classes from "./window.module.css";
import { selectFocusedApp, useWindowManager } from "./window-manager";

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
	win,
	children,
}: {
	win: OsWindow;
	children: ReactNode;
}) {
	const { state, close, focus, minimize, toggleMaximize, setRect } =
		useWindowManager();
	const frameRef = useRef<HTMLDivElement>(null);
	const gestureCleanupRef = useRef<(() => void) | null>(null);
	const app = getApp(win.appId);
	const isFocused = selectFocusedApp(state) === win.appId;

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
		animateOut({ scale: 0.92, opacity: 0 }, () => close(win.appId));

	const handleMinimize = () =>
		animateOut({ scale: 0.5, opacity: 0, y: window.innerHeight / 2 }, () => {
			const el = frameRef.current;
			if (el) {
				// clearProps wipes React-managed inline styles too; re-apply the
				// rect so the frame is intact when the window is restored
				gsap.set(el, { clearProps: "all" });
				el.style.width = `${win.rect.width}px`;
				el.style.height = `${win.rect.height}px`;
				el.style.transform = `translate(${win.rect.x}px, ${win.rect.y}px)`;
				el.style.zIndex = String(win.zIndex);
			}
			minimize(win.appId);
		});

	const startDrag = (e: React.PointerEvent) => {
		e.stopPropagation();
		if (win.maximized) return;
		if ((e.target as HTMLElement).closest("button")) return;
		e.preventDefault();
		gestureCleanupRef.current?.();
		focus(win.appId);
		const startX = e.clientX;
		const startY = e.clientY;
		const start = win.rect;
		const onMove = (ev: PointerEvent) => {
			setRect(win.appId, {
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
			if (win.maximized) return;
			e.preventDefault();
			e.stopPropagation();
			gestureCleanupRef.current?.();
			focus(win.appId);
			const startX = e.clientX;
			const startY = e.clientY;
			const start = win.rect;
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
				setRect(win.appId, { x, y, width, height });
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
			onPointerDown={() => focus(win.appId)}
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
						onClick={() => toggleMaximize(win.appId)}
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
