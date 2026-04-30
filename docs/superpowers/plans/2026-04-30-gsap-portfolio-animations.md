# GSAP Portfolio Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add GSAP-driven motion to the personal portfolio so each section earns one signature interaction, while respecting SSR, `prefers-reduced-motion`, and mobile performance.

**Architecture:** Hybrid file structure — section animations live in their components via `useGSAP`; only cross-cutting concerns (magnetic cursor, motion tokens, matchMedia helper, plugin registration) go in `src/lib/animations/`. All animation work runs client-side via the `useGSAP` hook so SSR HTML is identical to client HTML.

**Tech Stack:** GSAP core (with ScrollTrigger + SplitText, all free), `@gsap/react` for the `useGSAP` hook with built-in cleanup, React 19, TanStack Start, Mantine v8, vitest + jsdom for smoke tests.

**Spec:** `docs/superpowers/specs/2026-04-30-gsap-portfolio-animations-design.md`

---

## Task 1: Install GSAP dependencies

**Files:**
- Modify: `package.json` (via pnpm)

- [ ] **Step 1: Install gsap and @gsap/react**

```bash
pnpm add gsap @gsap/react
```

Expected: both packages added to `dependencies`. Verify with `cat package.json | grep -E "gsap|@gsap"` — should show `"gsap": "^3.x.x"` and `"@gsap/react": "^2.x.x"`.

- [ ] **Step 2: Verify install resolved correctly**

Run: `pnpm install` (no-op if already done; surfaces any peer issues).

Expected: no errors, no warnings about missing peers.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "deps: add gsap and @gsap/react"
```

---

## Task 2: Create motion tokens

**Files:**
- Create: `src/lib/animations/tokens.ts`

- [ ] **Step 1: Write the file**

```ts
// src/lib/animations/tokens.ts
export const ease = {
	out: "power3.out",
	soft: "power2.out",
	snap: "back.out(1.4)",
} as const;

export const duration = {
	fast: 0.4,
	base: 0.8,
	slow: 1.2,
} as const;
```

- [ ] **Step 2: Type-check**

Run: `pnpm tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/animations/tokens.ts
git commit -m "feat: add gsap motion tokens"
```

---

## Task 3: Register GSAP plugins once at app entry

**Files:**
- Create: `src/lib/animations/register-plugins.ts`
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Create the registration module**

```ts
// src/lib/animations/register-plugins.ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, SplitText);
	ScrollTrigger.config({ ignoreMobileResize: true });
}
```

The `typeof window` guard keeps the plugin registration from running during SSR (where `gsap.registerPlugin` would still work but `ScrollTrigger.config` touches `window`).

- [ ] **Step 2: Import the side-effect module from __root.tsx**

In `src/routes/__root.tsx`, add this import at the top of the file, just below the existing imports (around line 13 after `import appCss from ...`):

```ts
import "@/lib/animations/register-plugins";
```

- [ ] **Step 3: Add the noscript fallback to the head**

In `src/routes/__root.tsx`, find the `head: () => ({ ... })` block in `Route` (lines 67–92). Add a `scripts` field is not the right place — the noscript needs to render in the document head. The cleanest approach is to add it directly inside the `<head>` JSX in `RootDocument`. Edit the `<head>` block (around lines 99–102) to:

```tsx
<head>
	<HeadContent />
	<ColorSchemeScript forceColorScheme="dark" />
	<noscript>
		<style>{`[data-anim-gate] { opacity: 1 !important; }`}</style>
	</noscript>
</head>
```

- [ ] **Step 4: Run dev server and verify nothing breaks**

```bash
pnpm dev
```

Open http://localhost:3000. Expected: page renders identically to before (no animations yet), no console errors, no hydration warnings.

- [ ] **Step 5: Commit**

```bash
git add src/lib/animations/register-plugins.ts src/routes/__root.tsx
git commit -m "feat: register gsap plugins on app entry"
```

---

## Task 4: Create matchMedia motion-context helper

**Files:**
- Create: `src/lib/animations/use-motion-context.ts`

- [ ] **Step 1: Write the helper**

```ts
// src/lib/animations/use-motion-context.ts
import { gsap } from "gsap";

/**
 * Conditions used by every section's matchMedia block. Any caller
 * that adds animations should branch on these two keys so behavior
 * stays consistent across the site.
 */
export const motionConditions = {
	full: "(min-width: 769px) and (prefers-reduced-motion: no-preference)",
	reveal: "(max-width: 768px), (prefers-reduced-motion: reduce)",
} as const;

export type MotionConditionKey = keyof typeof motionConditions;

/**
 * Wraps gsap.matchMedia with the project's standard breakpoints.
 * Pass a callback that receives the matched conditions object;
 * inside, do `if (conditions.full) { ... }` or `if (conditions.reveal) { ... }`.
 */
export function createMotionContext(
	scope: Element | null,
	setup: (mm: gsap.MatchMedia) => void,
) {
	const mm = gsap.matchMedia(scope ?? undefined);
	setup(mm);
	return mm;
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm tsc --noEmit`

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/animations/use-motion-context.ts
git commit -m "feat: add motion-context matchMedia helper"
```

---

## Task 5: Magnetic cursor component

**Files:**
- Create: `src/lib/animations/magnetic-cursor.tsx`
- Create: `src/lib/animations/magnetic-cursor.module.css`
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Write the CSS module**

```css
/* src/lib/animations/magnetic-cursor.module.css */
.cursor {
	position: fixed;
	top: 0;
	left: 0;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	background: var(--color-accent-primary);
	mix-blend-mode: difference;
	pointer-events: none;
	z-index: 9999;
	transform: translate3d(-50%, -50%, 0);
	will-change: transform, width, height;
	transition: width 0.25s ease, height 0.25s ease;
}

.cursor[data-state="link"] {
	width: 8px;
	height: 8px;
}

.cursor[data-state="card"] {
	width: 6px;
	height: 6px;
}

@media (max-width: 768px), (prefers-reduced-motion: reduce) {
	.cursor {
		display: none;
	}
}
```

- [ ] **Step 2: Write the component**

```tsx
// src/lib/animations/magnetic-cursor.tsx
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";
import classes from "./magnetic-cursor.module.css";

export function MagneticCursor() {
	const ref = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const el = ref.current;
			if (!el) return;

			// Hide on touch / reduced-motion: bail out, CSS already hides via media query
			const mq = window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)");
			if (mq.matches) return;

			const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
			const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });

			const onMove = (e: MouseEvent) => {
				xTo(e.clientX);
				yTo(e.clientY);

				const target = e.target as Element | null;
				if (!target) return;
				const interactive = target.closest("a, button");
				const card = target.closest("[data-cursor='card']");
				if (card) {
					el.dataset.state = "card";
				} else if (interactive) {
					el.dataset.state = "link";
				} else {
					delete el.dataset.state;
				}
			};

			document.addEventListener("mousemove", onMove);
			return () => document.removeEventListener("mousemove", onMove);
		},
		{ scope: ref },
	);

	return <div ref={ref} className={classes.cursor} aria-hidden="true" />;
}
```

- [ ] **Step 3: Mount in __root.tsx**

In `src/routes/__root.tsx`, import the component near the top (with the other component imports):

```ts
import { MagneticCursor } from "@/lib/animations/magnetic-cursor";
```

Then in `RootDocument`, add `<MagneticCursor />` inside `<MantineProvider>` but outside `<ConvexProvider>`. The `<body>` block becomes:

```tsx
<body>
	<MantineProvider
		theme={theme}
		forceColorScheme="dark"
		cssVariablesResolver={cssVariablesResolver}
	>
		<MagneticCursor />
		<ConvexProvider>{children}</ConvexProvider>
		<Scripts />
	</MantineProvider>
</body>
```

- [ ] **Step 4: Visual QA in dev**

Run: `pnpm dev` (if not already running)

Open http://localhost:3000 in a desktop browser. Move the mouse around — expect a small accent-colored circle that lags slightly behind the cursor. Hover over a button or link — circle should shrink to ~8px. Open DevTools → Rendering → check "Emulate CSS media feature prefers-reduced-motion: reduce" — circle should disappear. Resize the window narrow (≤768px) — circle should disappear.

- [ ] **Step 5: Commit**

```bash
git add src/lib/animations/magnetic-cursor.tsx src/lib/animations/magnetic-cursor.module.css src/routes/__root.tsx
git commit -m "feat: add magnetic cursor follower"
```

---

## Task 6: Hero CSS refactor — remove keyframe stagger, add CSS variable for accent line

**Files:**
- Modify: `src/components/sections/hero-section.module.css`
- Modify: `src/components/sections/hero-section.tsx`

- [ ] **Step 1: Remove old keyframe stagger and add CSS variable for accent line**

Open `src/components/sections/hero-section.module.css`. Replace the `.eyebrow::before` rule (around lines 19-24) and remove the old keyframes/nth-child stagger (lines 105-135). The relevant edits:

Replace:
```css
.eyebrow::before {
	content: "";
	width: 24px;
	height: 1px;
	background: var(--color-accent-primary);
}
```

With:
```css
.eyebrow {
	--accent-line-width: 24px;
}

.eyebrow::before {
	content: "";
	width: var(--accent-line-width);
	height: 1px;
	background: var(--color-accent-primary);
	display: inline-block;
	transition: none;
}
```

Then delete the entire block from `/* Staggered fade-in animation */` through the end of the `@keyframes fadeUp` definition (lines 105-135). After this change, the file should end with `.tags { ... flex-wrap: wrap; }` and no `@keyframes` rule.

- [ ] **Step 2: Add data-anim-gate and inline opacity:0 to the hero section**

In `src/components/sections/hero-section.tsx`, change the opening `<section>` tag (line 10) from:

```tsx
<section className={classes.hero}>
```

To:

```tsx
<section className={classes.hero} data-anim-gate style={{ opacity: 0 }}>
```

- [ ] **Step 3: Visual QA — confirm nothing renders before we add the timeline**

Run: `pnpm dev`

Expected: hero is now invisible (opacity:0). The rest of the page renders normally. This is intentional — the next task adds the `useGSAP` block that brings it back.

If you want to verify the noscript fallback works: in DevTools open the Settings → Debugger → check "Disable JavaScript", reload the page. Expected: hero becomes visible again because the noscript style sets opacity:1.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/hero-section.module.css src/components/sections/hero-section.tsx
git commit -m "refactor: prepare hero for gsap takeover"
```

---

## Task 7: Hero animation timeline

**Files:**
- Modify: `src/components/sections/hero-section.tsx`

- [ ] **Step 1: Add refs and useGSAP block**

Replace the entire body of `hero-section.tsx` with:

```tsx
import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { GradientText } from "@/components/ui/gradient-text";
import { TechTag } from "@/components/ui/tech-tag";
import { motionConditions } from "@/lib/animations/use-motion-context";
import { techTags } from "@/data/skills";
import classes from "./hero-section.module.css";

export function HeroSection() {
	const sectionRef = useRef<HTMLElement>(null);

	useGSAP(
		() => {
			const root = sectionRef.current;
			if (!root) return;

			const eyebrow = root.querySelector(`.${classes.eyebrow}`);
			const heading = root.querySelector(`.${classes.heading}`);
			const sub = root.querySelector(`.${classes.sub}`);
			const actions = root.querySelector(`.${classes.actions}`);
			const tags = root.querySelectorAll(`.${classes.tags} > *`);

			const mm = gsap.matchMedia();

			mm.add(motionConditions.full, () => {
				gsap.set(root, { opacity: 1 });

				const split = new SplitText(heading, {
					type: "chars",
					charsClass: "char",
				});
				gsap.set(split.chars, { y: "100%", opacity: 0 });

				const tl = gsap.timeline();
				tl.from(eyebrow, { opacity: 0, y: 8, duration: 0.5, ease: "power2.out" }, 0)
					.fromTo(
						eyebrow,
						{ "--accent-line-width": "0px" },
						{ "--accent-line-width": "24px", duration: 0.5, ease: "power2.out" },
						0,
					)
					.to(
						split.chars,
						{ y: "0%", opacity: 1, duration: 0.9, ease: "back.out(1.4)", stagger: 0.04 },
						0.3,
					)
					.from(sub, { opacity: 0, y: 16, duration: 0.6, ease: "power3.out" }, 1.0)
					.from(
						actions ? actions.children : [],
						{ opacity: 0, y: 16, duration: 0.5, ease: "power3.out", stagger: 0.1 },
						1.4,
					)
					.from(
						tags,
						{ opacity: 0, y: 12, duration: 0.4, ease: "power3.out", stagger: 0.03 },
						1.6,
					);

				return () => split.revert();
			});

			mm.add(motionConditions.reveal, () => {
				gsap.fromTo(
					root,
					{ opacity: 0 },
					{ opacity: 1, duration: 0.4, ease: "power2.out" },
				);
			});
		},
		{ scope: sectionRef },
	);

	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			<section
				ref={sectionRef}
				className={classes.hero}
				data-anim-gate
				style={{ opacity: 0 }}
			>
				<p className={classes.eyebrow}> Frontend Engineer · Remote</p>
				<h1 className={classes.heading} aria-label="Enyel Sequeira">
					Enyel
					<br />
					<GradientText>Sequeira</GradientText>
				</h1>
				<p className={classes.sub}>
					I build scalable interfaces and design systems that bridge technical
					precision with human experience — 5+ years across gaming, Web3, and
					EdTech. Now building AI agents and MCP integrations to ship smarter
					developer tooling.
				</p>
				<div className={classes.actions}>
					<a href="#work" className={classes.btnPrimary}>
						View Work →
					</a>
					<a
						href="/Sequeira_Enyel_resume-2025.pdf"
						download
						className={classes.btnGhost}
					>
						Download CV
					</a>
				</div>
				<div className={classes.tags}>
					{techTags.map((tag) => (
						<TechTag key={tag.label} label={tag.label} variant={tag.variant} />
					))}
				</div>
			</section>
		</Container>
	);
}
```

Note the `aria-label="Enyel Sequeira"` on the heading — when SplitText replaces visible chars with split spans, screen readers still announce the original phrase from the label.

- [ ] **Step 2: Visual QA**

Run: `pnpm dev`

Open http://localhost:3000 with a fresh page load (Cmd+Shift+R). Expected:
- Hero is briefly invisible (~100ms)
- Eyebrow + accent line fade and draw in
- "Enyel Sequeira" letters drop from above with a slight bounce
- Sub paragraph fades up
- Buttons stagger in
- Tech tags stagger in

Test reduced-motion: DevTools → Rendering → "Emulate prefers-reduced-motion: reduce" → reload. Expected: hero just fades in over 0.4s, no per-element animation.

Test mobile: DevTools device toolbar → iPhone 14 → reload. Expected: same as reduced-motion (reveals only).

- [ ] **Step 3: Type-check**

Run: `pnpm tsc --noEmit`

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/hero-section.tsx
git commit -m "feat: animate hero with gsap timeline"
```

---

## Task 8: NavBar slide-in

**Files:**
- Modify: `src/components/sections/nav-bar.tsx`

- [ ] **Step 1: Add useGSAP block**

In `src/components/sections/nav-bar.tsx`, add the import block at the top:

```ts
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useRef } from "react";
```

Then inside `NavBar`, add a ref and the hook just after the existing `useDisclosure` line:

```tsx
const navRef = useRef<HTMLDivElement>(null);

useGSAP(
	() => {
		gsap.from(navRef.current, {
			y: -20,
			opacity: 0,
			duration: 0.4,
			ease: "power3.out",
		});
	},
	{ scope: navRef },
);
```

Then attach the ref to the outer `<Box component="nav" ...>`:

```tsx
<Box
	ref={navRef}
	component="nav"
	className={classes.navbar}
	data-scrolled={scroll.y > 50 || undefined}
>
```

- [ ] **Step 2: Visual QA**

`pnpm dev` → reload page. Expected: nav slides down from above on initial load.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/nav-bar.tsx
git commit -m "feat: animate navbar slide-in"
```

---

## Task 9: Stats section count-up

**Files:**
- Modify: `src/components/ui/stat-card.tsx`
- Modify: `src/components/sections/stats-section.tsx`

- [ ] **Step 1: Update StatCard to accept a numeric target and forwarded ref**

Replace `src/components/ui/stat-card.tsx` with:

```tsx
import { Box } from "@mantine/core";
import { forwardRef } from "react";
import classes from "./stat-card.module.css";

type StatCardProps = {
	value: string;
	suffix: string;
	label: string;
};

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
	function StatCard({ value, suffix, label }, ref) {
		return (
			<Box ref={ref} className={classes.card}>
				<div className={classes.number}>
					<span data-stat-value>{value}</span>
					<span className={classes.suffix}>{suffix}</span>
				</div>
				<div className={classes.label}>{label}</div>
			</Box>
		);
	},
);
```

The `data-stat-value` attribute lets the parent target the number span without exposing internals.

- [ ] **Step 2: Add useGSAP block to StatsSection**

Replace `src/components/sections/stats-section.tsx` with:

```tsx
import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import { gsap } from "gsap";
import { useRef } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { StatCard } from "@/components/ui/stat-card";
import { motionConditions } from "@/lib/animations/use-motion-context";
import { stats } from "@/data/stats";
import classes from "./stats-section.module.css";

function parseTarget(value: string): number {
	const n = Number.parseFloat(value);
	return Number.isFinite(n) ? n : 0;
}

export function StatsSection() {
	const sectionRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const root = sectionRef.current;
			if (!root) return;

			const cards = root.querySelectorAll<HTMLElement>(`.${classes.grid} > *`);
			const valueEls = root.querySelectorAll<HTMLElement>("[data-stat-value]");

			const mm = gsap.matchMedia();

			mm.add(motionConditions.full, () => {
				gsap.from(cards, {
					opacity: 0,
					y: 24,
					duration: 0.7,
					ease: "power3.out",
					stagger: 0.15,
					scrollTrigger: {
						trigger: root,
						start: "top 80%",
						once: true,
					},
				});

				valueEls.forEach((el, i) => {
					const target = parseTarget(stats[i]?.value ?? "0");
					const obj = { val: 0 };
					gsap.to(obj, {
						val: target,
						duration: 1.2,
						ease: "power3.out",
						snap: { val: target % 1 === 0 ? 1 : 0.1 },
						delay: 0.15 * i,
						onUpdate: () => {
							el.textContent =
								target % 1 === 0
									? Math.round(obj.val).toString()
									: obj.val.toFixed(1);
						},
						scrollTrigger: {
							trigger: root,
							start: "top 80%",
							once: true,
						},
					});
				});
			});

			mm.add(motionConditions.reveal, () => {
				gsap.from(cards, {
					opacity: 0,
					y: 16,
					duration: 0.5,
					ease: "power2.out",
					stagger: 0.1,
					scrollTrigger: {
						trigger: root,
						start: "top 90%",
						once: true,
					},
				});
				// Number renders directly via the original value prop — no count-up.
			});
		},
		{ scope: sectionRef },
	);

	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
			<SectionWrapper id="stats">
				<div ref={sectionRef} className={classes.section}>
					<SectionLabel>By The Numbers</SectionLabel>
					<div className={classes.grid}>
						{stats.map((stat) => (
							<StatCard
								key={stat.label}
								value={stat.value}
								suffix={stat.suffix}
								label={stat.label}
							/>
						))}
					</div>
				</div>
			</SectionWrapper>
		</Container>
	);
}
```

Note on cleanup: `useGSAP` automatically reverts all GSAP animations created inside its scope when the component unmounts, including ScrollTrigger instances. No manual cleanup needed.

- [ ] **Step 3: Visual QA**

`pnpm dev` → reload, scroll down to the stats section. Expected:
- Cards fade up in sequence
- Each number counts from 0 to its target value
- The "2.1M" stat: count handles the decimal (parses as 2.1, rounds via the `snap` config). Verify "2.1M" displays correctly.

Test reduced-motion: stats fade in but numbers render immediately, no count-up.

- [ ] **Step 4: Type-check**

Run: `pnpm tsc --noEmit`

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/stat-card.tsx src/components/sections/stats-section.tsx
git commit -m "feat: animate stats with scroll-triggered count-up"
```

---

## Task 10: Projects scroll-reveal

**Files:**
- Modify: `src/components/sections/projects-section.tsx`
- Modify: `src/components/sections/projects-section.module.css`

- [ ] **Step 1: Add perspective to the grid for the upcoming 3D tilt**

In `src/components/sections/projects-section.module.css`, find the `.grid` rule and add `perspective: 1000px;` to it. If `.grid` doesn't have its own rule yet, add one. Example after edit:

```css
.grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 24px;
	perspective: 1000px;
}
```

(Adjust other grid properties to match what's currently there — don't overwrite existing column/gap settings.)

- [ ] **Step 2: Add scroll-reveal to ProjectsSection**

Replace `src/components/sections/projects-section.tsx` with:

```tsx
import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import { gsap } from "gsap";
import { useRef } from "react";
import { ProjectCard } from "@/components/ui/project-card";
import { SectionLabel } from "@/components/ui/section-label";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { motionConditions } from "@/lib/animations/use-motion-context";
import { projects } from "@/data/projects";
import classes from "./projects-section.module.css";

export function ProjectsSection() {
	const sectionRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const root = sectionRef.current;
			if (!root) return;

			const cards = root.querySelectorAll<HTMLElement>(`.${classes.grid} > *`);
			const mm = gsap.matchMedia();

			mm.add(motionConditions.full, () => {
				gsap.from(cards, {
					opacity: 0,
					y: 32,
					duration: 0.8,
					ease: "power3.out",
					stagger: 0.1,
					scrollTrigger: {
						trigger: root,
						start: "top 80%",
						once: true,
					},
				});
			});

			mm.add(motionConditions.reveal, () => {
				gsap.from(cards, {
					opacity: 0,
					y: 16,
					duration: 0.5,
					ease: "power2.out",
					stagger: 0.08,
					scrollTrigger: {
						trigger: root,
						start: "top 90%",
						once: true,
					},
				});
			});
		},
		{ scope: sectionRef },
	);

	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
			<SectionWrapper id="work">
				<div ref={sectionRef} className={classes.section}>
					<SectionLabel>Work</SectionLabel>
					<div className={classes.grid}>
						{projects.map((project) => (
							<ProjectCard key={project.id} project={project} />
						))}
					</div>
				</div>
			</SectionWrapper>
		</Container>
	);
}
```

- [ ] **Step 3: Visual QA**

`pnpm dev` → scroll to the work section. Expected: cards fade up in sequence as the section enters the viewport.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/projects-section.tsx src/components/sections/projects-section.module.css
git commit -m "feat: scroll-reveal for projects section"
```

---

## Task 11: Project card 3D tilt parallax-on-hover

**Files:**
- Modify: `src/components/ui/project-card.tsx`

- [ ] **Step 1: Add useGSAP block with hover handlers**

Replace `src/components/ui/project-card.tsx` with:

```tsx
import { useGSAP } from "@gsap/react";
import { Box } from "@mantine/core";
import { gsap } from "gsap";
import { useRef } from "react";
import type { Project } from "@/data/projects";
import { motionConditions } from "@/lib/animations/use-motion-context";
import classes from "./project-card.module.css";
import { TechTag } from "./tech-tag";

type ProjectCardProps = {
	project: Project;
};

function getTagVariant(tech: string): "blue" | "indigo" | "slate" {
	const blueItems = ["React", "TypeScript", "Next.js", "Solana"];
	const indigoItems = ["Web3", "TanStack Start", "SSR"];
	if (blueItems.includes(tech)) return "blue";
	if (indigoItems.includes(tech)) return "indigo";
	return "slate";
}

export function ProjectCard({ project }: ProjectCardProps) {
	const cardRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const card = cardRef.current;
			if (!card) return;

			const title = card.querySelector<HTMLElement>(`.${classes.title}`);
			const mm = gsap.matchMedia();

			mm.add(motionConditions.full, () => {
				const rotXTo = gsap.quickTo(card, "rotateX", {
					duration: 0.4,
					ease: "power3.out",
				});
				const rotYTo = gsap.quickTo(card, "rotateY", {
					duration: 0.4,
					ease: "power3.out",
				});
				const titleZTo = title
					? gsap.quickTo(title, "z", { duration: 0.4, ease: "power3.out" })
					: null;

				let rect: DOMRect | null = null;

				const onEnter = () => {
					rect = card.getBoundingClientRect();
					card.dataset.cursor = "card";
					gsap.set(card, { transformStyle: "preserve-3d", willChange: "transform" });
				};
				const onMove = (e: MouseEvent) => {
					if (!rect) return;
					const x = (e.clientX - rect.left) / rect.width - 0.5;
					const y = (e.clientY - rect.top) / rect.height - 0.5;
					rotXTo(-y * 12);
					rotYTo(x * 12);
					titleZTo?.(20);
				};
				const onLeave = () => {
					rect = null;
					delete card.dataset.cursor;
					rotXTo(0);
					rotYTo(0);
					titleZTo?.(0);
					gsap.set(card, { willChange: "auto" });
				};

				card.addEventListener("mouseenter", onEnter);
				card.addEventListener("mousemove", onMove);
				card.addEventListener("mouseleave", onLeave);
				return () => {
					card.removeEventListener("mouseenter", onEnter);
					card.removeEventListener("mousemove", onMove);
					card.removeEventListener("mouseleave", onLeave);
				};
			});
		},
		{ scope: cardRef },
	);

	if (project.featured) {
		return (
			<Box ref={cardRef} className={`${classes.card} ${classes.featured}`}>
				<div>
					<div className={classes.number}>{project.number}</div>
					<h3 className={classes.title}>{project.title}</h3>
					<p className={classes.description}>{project.description}</p>
					<div className={classes.tags}>
						{project.tech.map((t) => (
							<TechTag key={t} label={t} variant={getTagVariant(t)} />
						))}
					</div>
				</div>
				{project.highlights && (
					<div className={classes.highlights}>
						<div className={classes.roleHeader}>
							<span className={classes.roleTitle}>{project.role}</span>
							<span className={classes.rolePeriod}>{project.period}</span>
						</div>
						<ul className={classes.highlightsList}>
							{project.highlights.map((h) => (
								<li key={h} className={classes.highlightItem}>
									{h}
								</li>
							))}
						</ul>
					</div>
				)}
			</Box>
		);
	}

	return (
		<Box
			ref={cardRef}
			component="a"
			href={project.href}
			target="_blank"
			rel="noopener noreferrer"
			className={classes.card}
			style={{ textDecoration: "none" }}
		>
			<div className={classes.number}>{project.number}</div>
			<h3 className={classes.title}>{project.title}</h3>
			<p className={classes.description}>{project.description}</p>
			<div className={classes.tags}>
				{project.tech.map((t) => (
					<TechTag key={t} label={t} variant={getTagVariant(t)} />
				))}
			</div>
			<span className={classes.link}>
				{project.linkLabel}
				<span className={classes.arrow}>→</span>
			</span>
		</Box>
	);
}
```

The component-level matchMedia means tilt is automatically disabled on touch and reduced-motion. No `else` branch needed — without `mm.add(...reveal...)`, those breakpoints get no hover animation at all (which is what we want).

- [ ] **Step 2: Visual QA**

`pnpm dev` → hover over a project card. Expected:
- Card tilts in 3D following the cursor
- Title pulls forward slightly
- Magnetic cursor blob shrinks to a 6px dot while over the card
- On `mouseleave`, card snaps back to flat over ~0.4s

Test reduced-motion / mobile: cards do not tilt on hover.

- [ ] **Step 3: Test on Safari**

If Safari is available locally: open `http://localhost:3000` in Safari, hover cards. Expected: tilt is smooth, no flickering. If you see jank, the spec called this out as a risk — verify the parent grid has `perspective: 1000px` from Task 10 step 1.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/project-card.tsx
git commit -m "feat: 3D tilt parallax on project card hover"
```

---

## Task 12: About section staggered reveals

**Files:**
- Modify: `src/components/sections/about-section.tsx`

- [ ] **Step 1: Add useGSAP block**

Replace `src/components/sections/about-section.tsx` with:

```tsx
import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import { gsap } from "gsap";
import { useRef } from "react";
import { SectionLabel } from "@/components/ui/section-label";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { TechTag } from "@/components/ui/tech-tag";
import { motionConditions } from "@/lib/animations/use-motion-context";
import { experiences } from "@/data/experience";
import { skillCategories } from "@/data/skills";
import classes from "./about-section.module.css";

export function AboutSection() {
	const sectionRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			const root = sectionRef.current;
			if (!root) return;

			const bioParagraphs = root.querySelectorAll<HTMLElement>(
				`.${classes.bioText} > p`,
			);
			const skillCategoriesEls = root.querySelectorAll<HTMLElement>(
				`.${classes.skillGroups} > div`,
			);
			const experienceItems = root.querySelectorAll<HTMLElement>(
				`.${classes.experienceItem}`,
			);

			const mm = gsap.matchMedia();

			mm.add(motionConditions.full, () => {
				gsap.from(bioParagraphs, {
					opacity: 0,
					y: 16,
					duration: 0.6,
					ease: "power3.out",
					stagger: 0.15,
					scrollTrigger: { trigger: root, start: "top 75%", once: true },
				});

				skillCategoriesEls.forEach((cat, i) => {
					const tags = cat.querySelectorAll(`.${classes.skillTags} > *`);
					gsap.from(tags, {
						opacity: 0,
						scale: 0.7,
						duration: 0.5,
						ease: "back.out(1.4)",
						stagger: 0.02,
						delay: 0.2 * i,
						scrollTrigger: { trigger: cat, start: "top 85%", once: true },
					});
				});

				gsap.from(experienceItems, {
					opacity: 0,
					x: -20,
					duration: 0.5,
					ease: "power3.out",
					stagger: 0.1,
					scrollTrigger: {
						trigger: experienceItems[0]?.parentElement ?? root,
						start: "top 80%",
						once: true,
					},
				});
			});

			mm.add(motionConditions.reveal, () => {
				gsap.from([...bioParagraphs, ...skillCategoriesEls, ...experienceItems], {
					opacity: 0,
					y: 12,
					duration: 0.4,
					ease: "power2.out",
					stagger: 0.05,
					scrollTrigger: { trigger: root, start: "top 90%", once: true },
				});
			});
		},
		{ scope: sectionRef },
	);

	return (
		<Container id={"about"} size={1100} px={{ base: 20, sm: 40 }}>
			<SectionWrapper>
				<div ref={sectionRef} className={classes.section}>
					<SectionLabel>About</SectionLabel>

					<div className={classes.bioGrid}>
						<div className={classes.bioText}>
							<p>
								Full-stack developer from the US, now based in Lisbon, Portugal.
								Over five years of industry experience with a strong focus on
								frontend development — building pixel-perfect, performant
								experiences for web products and applications.
							</p>
							<p>
								I speak English, Spanish, Portuguese fluently and conversational
								Mandarin Chinese. Currently exploring Rust for JS tooling and
								Python for AI applications.
							</p>
							<p>
								Hands-on with AI — I've built custom agents and MCP (Model
								Context Protocol) servers that integrate LLMs directly into
								development workflows, from automated code review to intelligent
								task orchestration.
							</p>
							<p>
								Collaborated with JSMastery to write code for a YouTube video
								that has accumulated over 2.1+ million views.
							</p>
						</div>
						<div className={classes.skillGroups}>
							{skillCategories.map((category) => (
								<div key={category.label}>
									<div className={classes.skillGroupLabel}>
										{category.label}
									</div>
									<div className={classes.skillTags}>
										{category.skills.map((skill) => (
											<TechTag key={skill} label={skill} variant="slate" />
										))}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
					<div className={classes.experienceList} id="experience">
						<SectionLabel>Experience</SectionLabel>
						{experiences.map((exp) => (
							<div key={exp.company} className={classes.experienceItem}>
								<a
									href={exp.href}
									target="_blank"
									rel="noopener noreferrer"
									className={classes.expCompany}
								>
									{exp.company}
								</a>
								<span className={classes.expRole}>{exp.role}</span>
								<span className={classes.expPeriod}>{exp.period}</span>
							</div>
						))}
					</div>
				</div>
			</SectionWrapper>
		</Container>
	);
}
```

- [ ] **Step 2: Visual QA**

`pnpm dev` → scroll into about section. Expected:
- Bio paragraphs fade up in sequence
- Each skill category's tags pop in with a slight bounce
- Experience items slide in from left in sequence

Test reduced-motion: simpler unified fade for all elements.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/about-section.tsx
git commit -m "feat: about section staggered reveals"
```

---

## Task 13: Contact footer accent bar + magnetic CTA

**Files:**
- Modify: `src/components/sections/contact-footer.tsx`
- Modify: `src/components/sections/contact-footer.module.css`

- [ ] **Step 1: Add transform-origin to the accent bar**

In `src/components/sections/contact-footer.module.css`, find the `.accentBar` rule. Add `transform-origin: left;` so the GSAP `scaleX` tween grows from the left edge:

```css
.accentBar {
	/* ...existing properties... */
	transform-origin: left;
}
```

- [ ] **Step 2: Add useGSAP block**

Replace `src/components/sections/contact-footer.tsx` with:

```tsx
import { useGSAP } from "@gsap/react";
import { Container } from "@mantine/core";
import {
	IconBrandGithub,
	IconBrandLinkedin,
	IconBrandX,
} from "@tabler/icons-react";
import { gsap } from "gsap";
import { useRef } from "react";
import { SectionWrapper } from "@/components/ui/section-wrapper";
import { motionConditions } from "@/lib/animations/use-motion-context";
import classes from "./contact-footer.module.css";

const SOCIALS = [
	{
		href: "https://github.com/enyelsequeira",
		icon: IconBrandGithub,
		label: "GitHub",
	},
	{
		href: "https://www.linkedin.com/in/enyel-sequeira/",
		icon: IconBrandLinkedin,
		label: "LinkedIn",
	},
	{
		href: "https://twitter.com/EnyelSequeira",
		icon: IconBrandX,
		label: "X / Twitter",
	},
];

export function ContactFooter() {
	const sectionRef = useRef<HTMLDivElement>(null);
	const ctaRef = useRef<HTMLAnchorElement>(null);

	useGSAP(
		() => {
			const root = sectionRef.current;
			if (!root) return;

			const accentBar = root.querySelector<HTMLElement>(`.${classes.accentBar}`);
			const heading = root.querySelector<HTMLElement>(`.${classes.heading}`);
			const sub = root.querySelector<HTMLElement>(`.${classes.sub}`);
			const cta = ctaRef.current;
			const socials = root.querySelectorAll<HTMLElement>(`.${classes.socialLink}`);

			const mm = gsap.matchMedia();

			mm.add(motionConditions.full, () => {
				const tl = gsap.timeline({
					scrollTrigger: { trigger: root, start: "top 80%", once: true },
				});
				tl.from(accentBar, {
					scaleX: 0,
					duration: 0.8,
					ease: "power3.out",
				})
					.from(heading, { opacity: 0, y: 16, duration: 0.5, ease: "power3.out" }, "-=0.4")
					.from(sub, { opacity: 0, y: 12, duration: 0.5, ease: "power3.out" }, "-=0.3")
					.from(cta, { opacity: 0, y: 12, duration: 0.4, ease: "power3.out" }, "-=0.3")
					.from(socials, { opacity: 0, y: 8, duration: 0.3, ease: "power2.out", stagger: 0.05 }, "-=0.2");

				if (cta) {
					const xTo = gsap.quickTo(cta, "x", { duration: 0.3, ease: "power3.out" });
					const yTo = gsap.quickTo(cta, "y", { duration: 0.3, ease: "power3.out" });
					const onMove = (e: MouseEvent) => {
						const rect = cta.getBoundingClientRect();
						const cx = rect.left + rect.width / 2;
						const cy = rect.top + rect.height / 2;
						const dx = e.clientX - cx;
						const dy = e.clientY - cy;
						const dist = Math.sqrt(dx * dx + dy * dy);
						if (dist < 120) {
							const pull = 1 - dist / 120;
							xTo(dx * 0.2 * pull);
							yTo(dy * 0.2 * pull);
						} else {
							xTo(0);
							yTo(0);
						}
					};
					const onLeave = () => {
						xTo(0);
						yTo(0);
					};
					document.addEventListener("mousemove", onMove);
					cta.addEventListener("mouseleave", onLeave);
					return () => {
						document.removeEventListener("mousemove", onMove);
						cta.removeEventListener("mouseleave", onLeave);
					};
				}
			});

			mm.add(motionConditions.reveal, () => {
				gsap.from([accentBar, heading, sub, cta, ...socials], {
					opacity: 0,
					y: 12,
					duration: 0.4,
					ease: "power2.out",
					stagger: 0.05,
					scrollTrigger: { trigger: root, start: "top 90%", once: true },
				});
			});
		},
		{ scope: sectionRef },
	);

	return (
		<Container size={1100} px={{ base: 20, sm: 40 }}>
			{/* biome-ignore lint/correctness/useUniqueElementIds: scroll anchor */}
			<SectionWrapper id="contact">
				<div ref={sectionRef} className={classes.section}>
					<div className={classes.accentBar} />
					<div className={classes.content}>
						<h2 className={classes.heading}>Let's work together</h2>
						<p className={classes.sub}>
							Open to remote roles and freelance projects. If you have a
							question or would like to collaborate, get in touch.
						</p>
						<div className={classes.actions}>
							<a
								ref={ctaRef}
								href="mailto:enyelsequeira@hotmail.com"
								className={classes.btnPrimary}
							>
								Say Hello →
							</a>
						</div>
						<div className={classes.socials}>
							{SOCIALS.map((social) => (
								<a
									key={social.label}
									href={social.href}
									target="_blank"
									rel="noopener noreferrer"
									className={classes.socialLink}
									aria-label={social.label}
								>
									<social.icon size={18} stroke={1.5} />
								</a>
							))}
						</div>
					</div>
					<p className={classes.footer}>
						Enyel Sequeira · Open to Remote Roles
					</p>
				</div>
			</SectionWrapper>
		</Container>
	);
}
```

- [ ] **Step 3: Visual QA**

`pnpm dev` → scroll to contact. Expected:
- Accent bar draws horizontally from left
- Heading + sub + CTA + socials stagger in
- Move cursor near the "Say Hello" button — it pulls toward the cursor
- Move cursor away — button snaps back

Test reduced-motion: unified fade, no magnetic pull.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/contact-footer.tsx src/components/sections/contact-footer.module.css
git commit -m "feat: contact footer accent bar + magnetic CTA"
```

---

## Task 14: ScrollTrigger refresh on window load

**Files:**
- Modify: `src/lib/animations/register-plugins.ts`

- [ ] **Step 1: Add a window-load refresh listener**

Update `src/lib/animations/register-plugins.ts` to:

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger, SplitText);
	ScrollTrigger.config({ ignoreMobileResize: true });

	// Recalculate trigger positions once everything (including images / fonts) has loaded.
	if (document.readyState === "complete") {
		ScrollTrigger.refresh();
	} else {
		window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
	}
}
```

- [ ] **Step 2: Visual QA**

`pnpm dev` → reload the page. With the network tab open and throttling set to "Slow 3G", reload again. Expected: scroll-triggered animations still fire at the right scroll positions even though images load slowly.

- [ ] **Step 3: Commit**

```bash
git add src/lib/animations/register-plugins.ts
git commit -m "feat: refresh ScrollTrigger after window load"
```

---

## Task 15: Smoke tests

**Files:**
- Create: `src/components/sections/__tests__/sections-smoke.test.tsx`
- Modify: `vite.config.ts` (if a test config block isn't already present)

- [ ] **Step 1: Verify vitest is wired up**

Run: `pnpm test --reporter=verbose`

Expected: vitest runs, but reports 0 tests (none exist yet). If it errors about missing jsdom or test config, consult the existing `package.json` scripts and the `vitest` + `jsdom` dev dependencies — both are already installed (`pnpm test` is `vitest run`).

If there is no `test` config in `vite.config.ts`, add one:

```ts
// at the top of the file, alongside the existing imports
/// <reference types="vitest" />

// in the defineConfig object, add:
test: {
	environment: "jsdom",
	globals: true,
},
```

- [ ] **Step 2: Write the smoke test**

```tsx
// src/components/sections/__tests__/sections-smoke.test.tsx
import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock @gsap/react useGSAP — in jsdom we don't actually want to run GSAP timelines.
vi.mock("@gsap/react", () => ({
	useGSAP: (fn: () => void) => {
		// Run the setup once so any DOM queries inside don't surprise us, but swallow errors.
		try {
			fn();
		} catch {
			/* animation code can fail in jsdom; that's fine for a smoke test */
		}
	},
}));

vi.mock("gsap", () => {
	const noop = () => {};
	const noopReturn = () => ({ kill: noop, revert: noop });
	return {
		gsap: {
			from: noop,
			to: noopReturn,
			fromTo: noop,
			set: noop,
			timeline: () => ({
				from: () => ({ from: noop, fromTo: noop, to: noop }),
				fromTo: () => ({}),
				to: () => ({}),
			}),
			matchMedia: () => ({ add: noop, revert: noop }),
			quickTo: () => noop,
			registerPlugin: noop,
		},
	};
});

vi.mock("gsap/ScrollTrigger", () => ({
	ScrollTrigger: { config: () => {}, refresh: () => {}, getAll: () => [] },
}));

vi.mock("gsap/SplitText", () => ({
	SplitText: class {
		chars: never[] = [];
		revert() {}
	},
}));

import { AboutSection } from "../about-section";
import { ContactFooter } from "../contact-footer";
import { HeroSection } from "../hero-section";
import { NavBar } from "../nav-bar";
import { ProjectsSection } from "../projects-section";
import { StatsSection } from "../stats-section";

function renderInProvider(ui: React.ReactNode) {
	return render(<MantineProvider>{ui}</MantineProvider>);
}

describe("section smoke tests", () => {
	it("NavBar mounts", () => {
		const { container } = renderInProvider(<NavBar />);
		expect(container).toBeTruthy();
	});
	it("HeroSection mounts", () => {
		const { container } = renderInProvider(<HeroSection />);
		expect(container.textContent).toContain("Enyel");
	});
	it("StatsSection mounts", () => {
		const { container } = renderInProvider(<StatsSection />);
		expect(container).toBeTruthy();
	});
	it("ProjectsSection mounts", () => {
		const { container } = renderInProvider(<ProjectsSection />);
		expect(container).toBeTruthy();
	});
	it("AboutSection mounts", () => {
		const { container } = renderInProvider(<AboutSection />);
		expect(container.textContent).toContain("Lisbon");
	});
	it("ContactFooter mounts", () => {
		const { container } = renderInProvider(<ContactFooter />);
		expect(container.textContent).toContain("Let's work together");
	});
});
```

Note: `NavBar` uses TanStack Router's `<Link>` component, which requires a router context. If the test fails because of a missing router, wrap the smoke render in a memory router. Quickest fix:

```tsx
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from "@tanstack/react-router";

function renderWithRouter(ui: React.ReactNode) {
	const rootRoute = createRootRoute({ component: () => ui });
	const router = createRouter({
		routeTree: rootRoute,
		history: createMemoryHistory({ initialEntries: ["/"] }),
	});
	return render(
		<MantineProvider>
			<RouterProvider router={router} />
		</MantineProvider>,
	);
}
```

Use `renderWithRouter` for `NavBar` only. Other sections don't use Router and can stay with `renderInProvider`.

- [ ] **Step 3: Run tests**

Run: `pnpm test --reporter=verbose`

Expected: all 6 tests pass.

If `HeroSection` test fails because SplitText was called on a node that doesn't exist, the mock above already handles it — verify the import order is correct (mocks declared before component imports).

- [ ] **Step 4: Run all the project's quality gates**

```bash
pnpm tsc --noEmit
pnpm lint
pnpm test
```

Expected: no errors from any of them.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/__tests__/sections-smoke.test.tsx vite.config.ts
git commit -m "test: smoke tests for animated sections"
```

---

## Task 16: Final visual QA pass

No file changes — manual verification only before declaring the feature done.

- [ ] **Step 1: Cold-load the homepage in dev**

Stop and restart the dev server: `pnpm dev`. Open `http://localhost:3000` in a private/incognito window. Walk through:
- Nav slides down ✅
- Hero animates in (eyebrow → headline drop → sub → buttons → tags) ✅
- Magnetic cursor follows pointer with slight lag ✅
- Scroll to stats — cards reveal, numbers count up ✅
- Scroll to work — cards reveal, hover one for 3D tilt ✅ and check magnetic cursor shrinks to a small dot ✅
- Scroll to about — bio paragraphs reveal in sequence ✅, skills pop in by category ✅, experience items slide in ✅
- Scroll to contact — accent bar draws ✅, content staggers in ✅, hover near "Say Hello" → button magnetism ✅

- [ ] **Step 2: Reduced-motion verification**

DevTools → Rendering → "Emulate prefers-reduced-motion: reduce" → reload. Expected: every section just fades in. No tilts, no count-up, no magnetic pull, no cursor blob. Page is fully usable.

- [ ] **Step 3: Mobile breakpoint verification**

DevTools device toolbar → iPhone 14 Pro → reload. Expected: same as reduced-motion (reveals only, no cursor blob).

- [ ] **Step 4: Keyboard navigation verification**

Reload → Tab through the page. Expected: focus rings visible on links/buttons, no animations triggered on focus events, page remains usable.

- [ ] **Step 5: JS-disabled verification**

DevTools → Settings → Debugger → "Disable JavaScript" → reload. Expected: page renders fully (the noscript fallback flips `[data-anim-gate]` to opacity:1 so the hero is visible). No GSAP-related errors break layout.

- [ ] **Step 6: Production build verification**

```bash
pnpm build
pnpm preview
```

Open the preview URL. Expected: same animations, no console errors, no hydration warnings.

- [ ] **Step 7: Commit (no-op or docs)**

If any tweaks were needed during QA (e.g., a stagger that felt too long), commit them now with a clear message. Otherwise, no commit needed — the feature is complete.

---

## Done

All tasks complete. The portfolio now has GSAP-driven motion across every section with a magnetic cursor + project parallax flourish, while respecting SSR, `prefers-reduced-motion`, and mobile constraints.

