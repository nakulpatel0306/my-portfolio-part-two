# Nakul Patel — Minimal (portfolio v5, `design/v5` branch)

The quiet one. A single narrow column, everything lowercase, no photo, no scroll
effects, no cursor tricks — just the name, the work, the projects and a way to
reach me, in the order you'd actually read them. Vanilla HTML/CSS/JS with
one web font and nothing else.

> `main` holds the origin-story design · `design/v3` holds the 3D world · `design/v4` holds the bento grid · this branch is the stripped-back one.

---

## Features

- **One column, 40rem wide** — the whole site is a single read, top to bottom, on every screen size, wide enough that rows don't wrap a single word onto a line of its own
- **All lowercase** — written that way in the markup, not forced with `text-transform`, so it copies and reads as intended
- **Light and dark** — a two-option switch (`light` / `dark`) sits at the top right; it starts on whichever the system prefers and the choice sticks from then on. An inline head script applies the stored theme before first paint, so there's no flash of the wrong colours
- **A three-card widget row** — status, location and current role, sitting under the name so the three things a recruiter screens on are answered before any scrolling
- **One icon set** — twelve hand-written inline SVGs at a single 1.75 stroke weight, inheriting `currentColor` so they re-tone with the theme: one per section heading, one per contact link, two in the widgets
- **Restraint as the interaction model** — one 8px fade-up on load, a row tint on project hover, an arrow that nudges. That's the whole animation budget
- **The easter egg, quietly** — the Konami code (↑ ↑ ↓ ↓ ← → ← → B A) flips the lights and says `nice.`
- **Accessible by default** — real landmarks and lists, a labelled toggle button, `prefers-reduced-motion` honoured, and contrast that holds in both themes

## Palette & type

Paper `#fcfcfb` · ink `#17171a` · muted `#55555d` · faint `#74747c` · rule `#e7e7e3` · available `#4a9e6a`
Dark: `#0f0f10` · `#ededee` · `#a1a1a9` · `#7e7e87` · `#232326` · `#5cba80`
Every text tone clears WCAG AA (4.5:1) against its background in both themes.
**Inter** 400/500/600 at 15px — one family, three weights, no display face

## Structure

```
.
├── index.html   # Intro + widgets, about, work, projects, education, stack, elsewhere
├── style.css    # Tokens for both themes, list + project styles
├── script.js    # Theme switch with localStorage, konami
└── assets/      # Resume PDF (the only asset this design loads)
```

## Run it

```bash
python3 -m http.server 5173
# → http://localhost:5173
```
