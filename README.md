# Nakul Patel — Minimal (portfolio v5, `design/v5` branch)

The quiet one. A single narrow column, everything lowercase, no photo — just the
name, the work, the projects and a way to reach me, in the order you'd actually
read them.

The restraint is in the *design*, not the code: underneath there's a ⌘K command
palette, a theme change that wipes in as a circle, text that decodes into place,
and spring physics on the cards. Still vanilla HTML/CSS/JS, one web font, zero
dependencies — every effect is a browser API used directly.

> `main` holds the origin-story design · `design/v3` holds the 3D world · `design/v4` holds the bento grid · this branch is the stripped-back one.

---

## Features

- **One column, 40rem wide** — the whole site is a single read, top to bottom, on every screen size, wide enough that rows don't wrap a single word onto a line of its own
- **All lowercase** — written that way in the markup, not forced with `text-transform`, so it copies and reads as intended
- **Light and dark** — a two-option switch (`light` / `dark`) sits at the top right; it starts on whichever the system prefers and the choice sticks from then on. An inline head script applies the stored theme before first paint, so there's no flash of the wrong colours
- **A three-card widget row** — status, location and current role, sitting under the name so the three things a recruiter screens on are answered before any scrolling
- **One icon set** — twelve hand-written inline SVGs at a single 1.75 stroke weight, inheriting `currentColor` so they re-tone with the theme: one per section heading, one per contact link, two in the widgets
- **A ⌘K command palette** — subsequence matching (`ghb` finds *open github*), matched characters highlighted as you type, full keyboard control, and `aria-activedescendant` wired to a real listbox. Jump to a section, switch theme, copy the email, open a link
- **A theme change that wipes in** — the new palette grows as a circle from the button you clicked, via the View Transitions API driven by a `clipPath` keyframe on `::view-transition-new(root)`. Browsers without it get the plain instant swap
- **Text that decodes on load** — the name and role resolve out of noise, each character settling at its own random moment so the word arrives raggedly instead of left to right
- **Scroll rail and reveal-on-scroll** — a hairline progress bar driven by one `requestAnimationFrame` per scroll burst (never one per event), and an `IntersectionObserver` that staggers the first screenful and reveals the rest as you reach them
- **Spring physics on the widget cards** — a real integrator, force into velocity into position with damping, so the tilt overshoots and settles rather than easing on a fixed curve. It stops its own RAF loop once at rest
- **A live Toronto clock** — `Intl.DateTimeFormat` with a `timeZone`, no date library
- **Restraint where it counts** — none of it moves anything the eye is reading: no parallax, no cursor tricks, no entrance animation on the body copy
- **The easter egg, quietly** — the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) flips the lights and says `nice.`
- **Accessible by default** — real landmarks and lists, a labelled theme group whose buttons carry `aria-pressed`, a palette that restores focus on close (with `preventScroll`, so a jump isn't yanked back), and contrast that holds in both themes
- **Degrades honestly** — every effect is feature-detected and every one is inert under `prefers-reduced-motion`. Content is only hidden for reveal if the inline head script proved JS is alive, so with JS off the page renders in full rather than blank

## Palette & type

Paper `#fcfcfb` · ink `#17171a` · muted `#55555d` · faint `#74747c` · rule `#e7e7e3` · available `#4a9e6a`
Dark: `#0f0f10` · `#ededee` · `#a1a1a9` · `#7e7e87` · `#232326` · `#5cba80`
Every text tone clears WCAG AA (4.5:1) against its background in both themes.
**Inter** 400/500/600 at 15px — one family, three weights, no display face

## Structure

```
.
├── index.html   # Intro + widgets, about, work, projects, education, stack, elsewhere
├── style.css    # Tokens for both themes, icons, widgets, work + project styles
├── script.js    # Theme + view-transition wipe, scramble, rail, reveals,
│                #   spring tilt, clock, command palette, konami
└── assets/      # Resume PDF (the only asset this design loads)
```

## Things to try

| | |
|---|---|
| <kbd>⌘</kbd><kbd>K</kbd> / <kbd>Ctrl</kbd><kbd>K</kbd> | open the command palette — then type `ghb`, or `zzz` to see it come up empty |
| Click `light` / `dark` | the new theme wipes out in a circle from the button |
| Reload | watch the name decode into place |
| Hover a widget card | spring tilt that overshoots and settles |
| <kbd>↑</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd><kbd>←</kbd><kbd>→</kbd><kbd>B</kbd><kbd>A</kbd> | flips the lights and says `nice.` |

## Run it

```bash
python3 -m http.server 5173
# → http://localhost:5173
```
