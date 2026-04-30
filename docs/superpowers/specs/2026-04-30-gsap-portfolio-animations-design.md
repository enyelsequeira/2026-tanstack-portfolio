# GSAP Portfolio Animations — Design

**Date:** 2026-04-30
**Status:** Approved (pending user spec review)
**Author:** Enyel + Claude

## Goal

Add GSAP-driven motion to the personal portfolio so the experience feels polished and modern without being noisy. Each section earns one signature interaction; the rest is restrained scroll-reveal. The design must respect SSR, `prefers-reduced-motion`, and mobile performance.

## Decisions Locked In

| # | Question | Decision |
|---|----------|----------|
| 1 | Motion personality | **B — Balanced / Modern** (Linear / Raycast energy) |
| 2 | Scope | **B — Key moments across the page** (each section gets one focused effect) |
| 3 | First-paint behavior | **C — Hybrid SSR-safe**, hero gated briefly via inline style; rest of page renders normally |
| 4 | Reduced motion + mobile | **B — Reveals only**, no scrubs/parallax/tilts; gate via `gsap.matchMedia()` |
| 5 | Signature flourish | **A + B — Magnetic cursor follower AND project parallax-on-hover** (with cursor scaling down to a small dot over project cards so they don't fight) |
| 6 | Architecture | **3 — Hybrid**: section animations live in their components via `useGSAP`; only cross-cutting concerns go in `src/lib/animations/` |

## Foundation

### Dependencies

```
gsap             # core (free) — includes ScrollTrigger, SplitText, quickTo
@gsap/react      # useGSAP hook with built-in cleanup
```

No paid plugins. SplitText is free as of GSAP 3.13.

### Plugin registration

Once at app entry — top of `src/lib/animations/register-plugins.ts`, imported as a side-effect from `src/routes/__root.tsx`:

```ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });
```

### Motion tokens

`src/lib/animations/tokens.ts` — single source of truth for easings/durations.

```ts
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

### matchMedia rules

`src/lib/animations/use-motion-context.ts` exposes a helper that wraps `gsap.matchMedia()` with two consistent breakpoints used by every section:

- `(min-width: 769px) and (prefers-reduced-motion: no-preference)` → **full** motion (scrubs, parallax, cursor blob, 3D tilt)
- everything else → **reveals only** (opacity/translateY fades, no scrubs, no cursor, no tilt)

Each section's `useGSAP` block calls this helper internally so behavior is consistent and changes in one place propagate everywhere.

### File layout

```
src/lib/animations/
  register-plugins.ts        # one-time gsap.registerPlugin call
  tokens.ts                  # easing/duration constants
  use-motion-context.ts      # matchMedia helper
  magnetic-cursor.tsx        # cross-cutting: rendered in __root.tsx
src/components/sections/
  hero-section.tsx           # adds useGSAP block inline
  stats-section.tsx          # adds useGSAP block inline
  projects-section.tsx       # adds useGSAP block inline
  about-section.tsx          # adds useGSAP block inline
  contact-footer.tsx         # adds useGSAP block inline
  nav-bar.tsx                # adds useGSAP block inline
src/components/ui/
  project-card.tsx           # adds parallax-on-hover useGSAP inline
  stat-card.tsx              # count-up handled by parent stats-section
```

### SSR safety

All `gsap` / `ScrollTrigger` work runs inside `useGSAP`, which is a hook — its body only executes in the browser. Server-rendered HTML is identical to the static client HTML, so there's no hydration mismatch.

The entire `.hero` wrapper renders with `data-anim-gate` and inline `style={{ opacity: 0 }}` on both server and client; the hero's `useGSAP` block sets `opacity: 1` on this wrapper before sequencing the per-element timeline. The gate covers the whole hero block so every element in the timeline (eyebrow, headline, sub, buttons, tags) can animate from its hidden state. Sections below the hero render normally — they reveal on scroll, no gate needed.

A `<noscript>` style override (injected into the document head via TanStack Start's `head` mechanism in `__root.tsx`) ensures the page is readable if JS never loads:

```html
<noscript><style>[data-anim-gate] { opacity: 1 !important; }</style></noscript>
```

### Cleanup of existing CSS

`src/components/sections/hero-section.module.css` lines 105–135 (the current `@keyframes fadeUp` + nth-child stagger) get **removed** — GSAP takes over, and leaving CSS keyframes in place causes double-animation.

## Per-Section Specs

### NavBar (`nav-bar.tsx`)

- **On mount:** nav slides in from `y: -20, opacity: 0` over `duration.fast` (0.4s). Once, no scroll trigger.
- The existing `data-scrolled` attribute (driven by `useWindowScroll`) is left alone — CSS handles bg/blur transition.

### Hero (`hero-section.tsx`)

Master timeline on mount, sequenced:

1. **Eyebrow** — fade in + horizontal accent line draws from `width: 0 → 24px` (0 → 0.5s). Implementation note: the line is currently a `::before` pseudo-element with fixed `width: 24px` (`hero-section.module.css:19-24`). Refactor to drive the width from a CSS custom property (e.g., `width: var(--accent-line, 24px)`) on the eyebrow element, then animate that variable via `gsap.to(el, { "--accent-line": "24px" })`. Pseudo-elements aren't directly animatable; the CSS variable bridges that.
2. **Headline reveal** — `SplitText` splits "Enyel Sequeira" into chars; each char enters `y: 100% → 0`, `opacity: 0 → 1`, easing `back.out(1.4)`, 0.04s stagger (0.3 → 1.2s).
3. **Sub-paragraph** — fade up 16px (1.0 → 1.6s).
4. **Buttons** — stagger in 0.1s apart (1.4 → 1.8s).
5. **Tech tags** — stagger in 0.03s apart (1.6 → 2.2s).

**Reduced-motion / mobile fallback:** all elements fade in together over 0.4s, no SplitText, no per-element stagger. Inline `opacity:0` still gets cleared, so reduced-motion users still see content normally.

### Stats (`stats-section.tsx` + `stat-card.tsx`)

- ScrollTrigger fires when section top hits 80% of viewport.
- Each `StatCard` value counts from `0` to its target via `gsap.to({ val: 0 }, { val: target, snap: { val: 1 }, duration: 1.2 })`. Cards stagger 0.15s apart.
- In parallel: card translates up 24px and fades from 0 → 1.
- **Reduced-motion / mobile:** number renders directly (no count-up); only the fade-in remains.

### Projects (`projects-section.tsx` + `project-card.tsx`)

- **Section reveal:** cards fade + translate up 32px on ScrollTrigger enter, 0.1s stagger.
- **Per-card hover (signature flourish):** in `project-card.tsx`:
  - On `mouseenter`, store `getBoundingClientRect()` and add `data-cursor="card"` to the card so the magnetic cursor scales down to a 6px dot.
  - On `mousemove`, compute cursor position relative to card center (`-1 → 1` on each axis) and drive three `gsap.quickTo` instances:
    - Card: `rotateX` from `6deg → -6deg`, `rotateY` from `-6deg → 6deg`
    - Image (inside card): `translate3d(x*8px, y*8px, 0)` — opposite direction, half intensity
    - Title: `translateZ(20px)` — pulls forward
  - On `mouseleave`, tween everything back to 0 over 0.5s, remove `data-cursor` attribute.
- Parent uses `perspective: 1000px` on the grid so the 3D math reads correctly.
- **Reduced-motion / mobile:** hover handlers not attached at all; only the scroll-in fade remains.

### About (`about-section.tsx`)

- Bio paragraphs: fade up 16px on enter, 0.15s stagger.
- Skill categories: each tech tag pops in with `back.out(1.4)`, 0.02s stagger across tags within a category. Categories themselves stagger 0.2s apart.
- Experience list items: fade + slide from `x: -20`, 0.1s stagger.

### Contact / Footer (`contact-footer.tsx`)

- **Accent bar** (`classes.accentBar`) draws horizontally via `scaleX: 0 → 1` with `transform-origin: left`, `power3.out`, 0.8s.
- Heading + sub + CTA stagger up 16px with 0.15s gap.
- **"Say Hello" button magnetism:** within 120px of the button, `quickTo` translates the button up to 6px toward the cursor. Stronger pull than the global cursor blob — this CTA is the one we want clicked. Reset on `mouseleave`.
- Social icons fade in with 0.05s stagger.

## Magnetic Cursor (`src/lib/animations/magnetic-cursor.tsx`)

Single `<MagneticCursor />` rendered once at the top of `__root.tsx`'s shell, inside `<MantineProvider>` but outside `<main>`.

- Fixed-position 24px circle, accent color, `mix-blend-mode: difference`, `pointer-events: none`, `z-index: 9999`.
- Two `gsap.quickTo` instances (one each for `x`, `y`), 0.4s duration, `power3.out`. The lag is the effect.
- **State variants** (toggled via `data-state` attribute):
  - `default` — 24px blob
  - `link` — 8px dot over `<a>` / `<button>`
  - `card` — 6px dot over project cards (so it doesn't fight the parallax)
- Single delegated `mousemove` listener on `document`. Hover detection via `e.target.closest("a, button, [data-cursor='card']")`.
- **Mobile / touch / reduced-motion:** component returns `null` — no listeners, zero overhead.

## Accessibility

- `gsap.matchMedia()` respects `prefers-reduced-motion: reduce`; verified manually via OS toggle.
- Keyboard-only navigation: focus styles unchanged, no animations triggered on focus events.
- Screen readers: count-up stats keep their final value as readable text; SplitText output preserves an `aria-label` on the wrapper containing the original phrase, with split chars marked `aria-hidden="true"`.
- `<noscript>` style fallback ensures the hero heading is visible if JS never loads.

## Performance Budget

- Bundle add: ~50 KB gzipped (gsap + ScrollTrigger + SplitText + @gsap/react).
- `ScrollTrigger.config({ ignoreMobileResize: true })` set globally to avoid re-running on iOS URL bar resize.
- All hover handlers use `quickTo`, never per-event `gsap.to` — no new tween objects per mousemove.
- `will-change` applied only on the cursor element and on project cards while hover is active. Removed when hover ends.
- Targets: hero LCP unchanged from current baseline; INP under 200ms on mid-tier mobile.

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| SSR/client mismatch on hero heading | Inline `opacity:0` is identical on server and client; only the post-mount `useGSAP` clears it. No hydration warning. |
| `ScrollTrigger.refresh()` not called when images load late and content height changes | Call `ScrollTrigger.refresh()` from a `window.addEventListener("load", ...)` once at app init. |
| Plugin registration race if `useGSAP` runs before `registerPlugin` | Registration is a synchronous top-level import side-effect of `__root.tsx`, so it runs before any component mounts. |
| Project tilt feels janky on Safari | Use `transform: translate3d` + `perspective` on the parent grid; test on real Safari/iOS before merging. |
| GSAP duplicates the existing CSS keyframe stagger in the hero | Remove `@keyframes fadeUp` and the nth-child rules from `hero-section.module.css` as part of the implementation. |

## Testing Approach

- **Manual QA** in dev: reduced-motion toggle, mobile breakpoint, keyboard-only nav, slow 3G throttling, real Safari/iOS.
- **Smoke tests** (vitest): each section component renders without errors. No animation-state assertions.
- **Visual QA**: load the deployed Cloudflare preview before merging to main.

## Out of Scope

- Page transitions between routes (blog → home).
- Animations on the blog post pages.
- ScrambleText, Flip, Draggable, Observer plugins.
- Swapping out Mantine components for animated alternatives.
- Refactoring CSS modules beyond removing the now-redundant hero keyframes.
