# Nakul Patel — Bento (portfolio v4, `design/v4` branch)

A dashboard-style bento-grid portfolio: everything about me scannable at a glance, laid out as tiles — intro, headshot, live status, location radar, socials, stats, education, resume, a draggable photo strip — followed by a bento of project tiles, dual skills marquees, and a clean track record. Vanilla HTML/CSS/JS.

> `main` holds the origin-story design · `design/v3` holds the 3D world · this branch is the bento experiment.

---

## Features

- **Hero bento** — 11 tiles with 3D perspective tilt on hover: intro, photo, "open to internships" pulse, Ontario radar ping, GitHub/LinkedIn logo tiles, count-up stats, education, resume download, a short bio, and a drag-to-scroll photo strip
- **Work bento** — six project tiles with image backdrops, gradient scrims and hover zooms, in a big/small rhythm
- **Dual skills marquees** — two rows of the stack scrolling in opposite directions
- **The full award-site kit** — preloader with 0–100 counter, buttery inertia scrolling, custom cursor with magnetic buttons, film grain, staged kinetic reveals
- **Accessible by default** — logos and drawn icons instead of emojis, keyboard-reachable tiles, native scrolling on touch, everything calm under `prefers-reduced-motion`

## Palette & type

Graphite `#0e0f12` · tile `#16171c` · mint signal `#64ffda`
**Figtree** (display + body) · **JetBrains Mono** (labels)

## Structure

```
.
├── index.html   # Hero bento, work bento, marquees, experience, contact
├── style.css    # Tile system, cursor, grain, loader, marquees
├── script.js    # Tilt, inertia scroll, cursor kit, counters, konami
└── assets/      # Photos, project images, resume PDF
```

## Run it

```bash
python3 -m http.server 5173
# → http://localhost:5173
```
