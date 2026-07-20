export type AppId = "about" | "projects" | "blog" | "contact" | "terminal";

export type Rect = {
	x: number;
	y: number;
	width: number;
	height: number;
};

export type OsWindow = {
	appId: AppId;
	rect: Rect;
	/** rect saved before maximizing, restored on un-maximize */
	prevRect: Rect | null;
	minimized: boolean;
	maximized: boolean;
	zIndex: number;
};
